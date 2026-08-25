const { prisma } = require('../../database/supabase/client');

const mapPet = (pet) => {
  if (!pet) return null;
  const mapped = {
    ...pet,
    _id: pet.id,
    owner: pet.owner ? { ...pet.owner, _id: pet.owner.id } : pet.ownerId
  };
  delete mapped.id;
  delete mapped.ownerId;
  if (mapped.owner && typeof mapped.owner === 'object') {
    delete mapped.owner.id;
  }
  return mapped;
};

// @desc    Get paginated, filtered, searched and sorted Marketplace pets
// @route   GET /api/marketplace
// @access  Public
exports.getMarketplacePets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      species,
      breed,
      gender,
      age,
      size,
      color,
      vaccinated,
      friendlyWithKids,
      friendlyWithPets,
      trainingLevel,
      city,
      province,
      listingType, // 'FOR_SALE' or 'FOR_ADOPTION' or undefined/all
      minPrice,
      maxPrice,
      sort = 'newest'
    } = req.query;

    // Base query only returns FOR_SALE or FOR_ADOPTION pets
    const where = {
      activeStatus: { in: ['FOR_SALE', 'FOR_ADOPTION'] }
    };

    // Text Search Match
    if (search && search.trim()) {
      const searchStr = search.trim();
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { breed: { contains: searchStr, mode: 'insensitive' } },
        { species: { contains: searchStr, mode: 'insensitive' } },
        { aboutPet: { contains: searchStr, mode: 'insensitive' } },
        { city: { contains: searchStr, mode: 'insensitive' } },
        { province: { contains: searchStr, mode: 'insensitive' } }
      ];
    }

    // Exact Match Filters
    if (species) where.species = species;
    if (breed) where.breed = { equals: breed, mode: 'insensitive' };
    if (gender) where.gender = gender;
    if (age) where.age = age;
    if (size) where.size = size;
    if (color) where.color = { contains: color, mode: 'insensitive' };
    
    if (vaccinated !== undefined) {
      where.isVaccinated = vaccinated === 'true' || vaccinated === true;
    }
    if (friendlyWithKids !== undefined) {
      where.friendlyWithKids = friendlyWithKids === 'true' || friendlyWithKids === true;
    }
    if (friendlyWithPets !== undefined) {
      where.friendlyWithPets = friendlyWithPets === 'true' || friendlyWithPets === true;
    }
    if (trainingLevel) where.trainingLevel = trainingLevel;
    if (city) where.city = { equals: city, mode: 'insensitive' };
    if (province) where.province = { equals: province, mode: 'insensitive' };

    // Listing Type Filter
    if (listingType && listingType !== 'all') {
      where.activeStatus = listingType;
    }

    // Price Filtering (Applies only when listingType is not FOR_ADOPTION)
    if (listingType !== 'FOR_ADOPTION') {
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = parseFloat(minPrice);
        if (maxPrice !== undefined) where.price.lte = parseFloat(maxPrice);
      }
    }

    // Sorting Configuration
    const orderBy = [];
    if (sort === 'newest') {
      orderBy.push({ createdAt: 'desc' });
    } else if (sort === 'oldest') {
      orderBy.push({ createdAt: 'asc' });
    } else if (sort === 'price_asc') {
      orderBy.push({ price: 'asc' });
      orderBy.push({ createdAt: 'desc' });
    } else if (sort === 'price_desc') {
      orderBy.push({ price: 'desc' });
      orderBy.push({ createdAt: 'desc' });
    } else if (sort === 'recently_updated') {
      orderBy.push({ updatedAt: 'desc' });
    }

    // Pagination Calculation
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);
    
    // Execute database query with populated owner profile
    const pets = await prisma.pet.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            province: true,
            profilePic: true
          }
        }
      },
      orderBy,
      skip,
      take
    });

    const total = await prisma.pet.count({ where });

    // Compute dynamic dashboard stats
    const statsQuery = { activeStatus: { in: ['FOR_SALE', 'FOR_ADOPTION'] } };
    
    const totalListings = await prisma.pet.count({ where: statsQuery });
    const forSaleCount = await prisma.pet.count({ where: { activeStatus: 'FOR_SALE' } });
    const forAdoptionCount = await prisma.pet.count({ where: { activeStatus: 'FOR_ADOPTION' } });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyAddedCount = await prisma.pet.count({
      where: {
        ...statsQuery,
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    res.status(200).json({
      success: true,
      pets: pets.map(mapPet),
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      },
      stats: {
        totalListings,
        forSaleCount,
        forAdoptionCount,
        recentlyAddedCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading marketplace directory', error: error.message });
  }
};

// @desc    Get similar pet recommendations matching species, breed, or location
// @route   GET /api/marketplace/similar/:petId
// @access  Public
exports.getSimilarPets = async (req, res) => {
  try {
    const pet = await prisma.pet.findUnique({ where: { id: req.params.petId } });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Find similar pets by matching species, breed or city
    const similarPets = await prisma.pet.findMany({
      where: {
        id: { not: pet.id },
        activeStatus: { in: ['FOR_SALE', 'FOR_ADOPTION'] },
        OR: [
          { species: pet.species },
          { breed: { equals: pet.breed, mode: 'insensitive' } },
          { city: { equals: pet.city, mode: 'insensitive' } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            province: true,
            profilePic: true
          }
        }
      },
      take: 4
    });

    res.status(200).json({ success: true, similarPets: similarPets.map(mapPet) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving recommendations', error: error.message });
  }
};

// @desc    Report inappropriate listing
// @route   POST /api/marketplace/report
// @access  Public
exports.reportListing = async (req, res) => {
  try {
    const { reporter, petId, reason } = req.body;
    if (!reporter || !petId || !reason) {
      return res.status(400).json({ success: false, message: 'Missing report parameters' });
    }

    const reportEntry = await prisma.report.create({
      data: {
        reporterId: reporter,
        petId: petId,
        reason,
        status: 'Pending'
      }
    });

    const formattedReport = {
      ...reportEntry,
      _id: reportEntry.id,
      reporter: reportEntry.reporterId,
      pet: reportEntry.petId
    };
    delete formattedReport.id;
    delete formattedReport.reporterId;
    delete formattedReport.petId;

    res.status(201).json({ success: true, message: 'Thank you for reporting. Platform Admins will review this listing shortly.', report: formattedReport });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting listing report', error: error.message });
  }
};
