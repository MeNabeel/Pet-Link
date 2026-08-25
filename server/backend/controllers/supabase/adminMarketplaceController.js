const { prisma } = require('../../database/supabase/client');
const sendEmail = require('../../utils/sendEmail');

const notifyOwner = async (petId, action) => {
  try {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: { owner: true }
    });
    if (!pet || !pet.owner || !pet.owner.email) return;

    const emailOptions = {
      email: pet.owner.email,
      subject: `PetLink Listing Alert: "${pet.name}" has been ${action}`,
      message: `Hello ${pet.owner.name},\n\nWe wanted to inform you that your pet listing "${pet.name}" has been ${action.toUpperCase()} by the platform administrator.\n\nBest regards,\nPetLink Moderation Team`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #E5E7EB; border-radius: 12px; max-width: 500px;">
          <h2 style="color: #0066CC; margin-top: 0;">PetLink Listing Alert</h2>
          <p>Hello <strong>${pet.owner.name}</strong>,</p>
          <p>We wanted to inform you that your pet listing <strong>"${pet.name}"</strong> has been updated to <strong>${action.toUpperCase()}</strong> by the platform administrator.</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748B;">This is an automated security notification regarding your account details. Please do not reply to this email.</p>
        </div>
      `
    };

    await sendEmail(emailOptions);
  } catch (err) {
    console.error(`Moderation email notify failure for pet ${petId}: ${err.message}`);
  }
};

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

// @desc    Get paginated, filtered, searched and sorted Admin marketplace listings with stats
// @route   GET /api/admin/marketplace
// @access  Private/Admin
exports.getAdminMarketplacePets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      species,
      breed,
      gender,
      vaccinated,
      city,
      province,
      listingType, // 'FOR_SALE' | 'FOR_ADOPTION'
      status, // moderationStatus e.g. Published, Pending Review, etc.
      minPrice,
      maxPrice,
      sort = 'newest'
    } = req.query;

    const where = {};

    // Realtime search match
    if (search && search.trim()) {
      const searchStr = search.trim();
      const matchedUsers = await prisma.user.findMany({
        where: { name: { contains: searchStr, mode: 'insensitive' } },
        select: { id: true }
      });
      const matchedOwnerIds = matchedUsers.map(u => u.id);

      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { breed: { contains: searchStr, mode: 'insensitive' } },
        { species: { contains: searchStr, mode: 'insensitive' } },
        { city: { contains: searchStr, mode: 'insensitive' } },
        { ownerId: { in: matchedOwnerIds } }
      ];

      // standard UUID format test for Supabase
      if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(searchStr)) {
        where.OR.push({ id: searchStr });
      }
    }

    // Filters
    if (species) where.species = species;
    if (breed) where.breed = { equals: breed, mode: 'insensitive' };
    if (gender) where.gender = gender;
    
    if (vaccinated !== undefined) {
      where.isVaccinated = vaccinated === 'true' || vaccinated === true;
    }
    if (city) where.city = { equals: city, mode: 'insensitive' };
    if (province) where.province = { equals: province, mode: 'insensitive' };

    // Listing Type Filter
    if (listingType && listingType !== 'all') {
      where.activeStatus = listingType;
    }

    // Status Filter (moderationStatus mapping)
    if (status && status !== 'all') {
      if (status === 'Featured') {
        where.isFeatured = true;
      } else if (status === 'Reported') {
        where.reportsCount = { gt: 0 };
      } else {
        where.moderationStatus = status;
      }
    }

    // Price Filter
    if (listingType !== 'FOR_ADOPTION') {
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = parseFloat(minPrice);
        if (maxPrice !== undefined) where.price.lte = parseFloat(maxPrice);
      }
    }

    // Sorting Map
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
    } else if (sort === 'most_viewed') {
      orderBy.push({ viewsCount: 'desc' });
    } else if (sort === 'most_wishlisted') {
      orderBy.push({ favoritesCount: 'desc' });
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

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
            profilePic: true,
            createdAt: true
          }
        }
      },
      orderBy,
      skip,
      take
    });

    const total = await prisma.pet.count({ where });

    // Dynamic stats aggregation
    const totalListings = await prisma.pet.count({});
    const forSaleCount = await prisma.pet.count({ where: { activeStatus: 'FOR_SALE' } });
    const forAdoptionCount = await prisma.pet.count({ where: { activeStatus: 'FOR_ADOPTION' } });
    const pendingApprovalCount = await prisma.pet.count({ where: { moderationStatus: 'Pending Review' } });
    const soldPetsCount = await prisma.pet.count({ where: { adoptionStatus: 'Adopted', activeStatus: 'FOR_SALE' } });
    const adoptedPetsCount = await prisma.pet.count({ where: { adoptionStatus: 'Adopted', activeStatus: 'FOR_ADOPTION' } });

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
        pendingApproval: pendingApprovalCount,
        soldPets: soldPetsCount,
        adoptedPets: adoptedPetsCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading admin listings', error: error.message });
  }
};

// @desc    Update listing status/moderation state
// @route   PUT /api/admin/marketplace/:petId/status
// @access  Private/Admin
exports.updateListingStatus = async (req, res) => {
  try {
    const { status, activeStatus, adoptionStatus } = req.body;
    const pet = await prisma.pet.findUnique({ where: { id: req.params.petId } });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const data = {};
    if (status) data.moderationStatus = status;
    if (activeStatus) data.activeStatus = activeStatus;
    if (adoptionStatus) data.adoptionStatus = adoptionStatus;

    const updated = await prisma.pet.update({
      where: { id: req.params.petId },
      data
    });
    
    // Notify owner via email helper
    await notifyOwner(updated.id, status || activeStatus || adoptionStatus);

    res.status(200).json({ success: true, message: 'Listing updated successfully', pet: mapPet(updated) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating listing status', error: error.message });
  }
};

// @desc    Toggle Featured listing flag
// @route   PUT /api/admin/marketplace/:petId/feature
// @access  Private/Admin
exports.toggleFeatured = async (req, res) => {
  try {
    const pet = await prisma.pet.findUnique({ where: { id: req.params.petId } });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const updated = await prisma.pet.update({
      where: { id: req.params.petId },
      data: { isFeatured: !pet.isFeatured }
    });

    await notifyOwner(updated.id, updated.isFeatured ? 'featured' : 'removed from featured');

    res.status(200).json({ success: true, message: `Listing marked ${updated.isFeatured ? 'Featured' : 'Regular'}`, pet: mapPet(updated) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling featured status', error: error.message });
  }
};

// @desc    Bulk action processor for moderation
// @route   POST /api/admin/marketplace/bulk-action
// @access  Private/Admin
exports.executeBulkAction = async (req, res) => {
  try {
    const { ids, action, value } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No listing IDs selected' });
    }

    const data = {};
    if (action === 'approve') {
      data.moderationStatus = 'Published';
    } else if (action === 'reject') {
      data.moderationStatus = 'Rejected';
    } else if (action === 'archive') {
      data.moderationStatus = 'Archived';
    } else if (action === 'suspend') {
      data.moderationStatus = 'Suspended';
    } else if (action === 'delete') {
      data.moderationStatus = 'Removed';
      data.activeStatus = 'ARCHIVED';
    } else if (action === 'feature') {
      data.isFeatured = value === undefined ? true : value;
    } else if (action === 'restore') {
      data.moderationStatus = 'Published';
    }

    await prisma.pet.updateMany({
      where: { id: { in: ids } },
      data
    });

    // Notify owners in background parallel
    ids.forEach(id => {
      notifyOwner(id, action);
    });

    res.status(200).json({ success: true, message: `Bulk action "${action}" applied to ${ids.length} listings successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error executing bulk action', error: error.message });
  }
};

// @desc    Marketplace analytics charts data
// @route   GET /api/admin/marketplace/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Species distribution counts
    const speciesDistributionGroup = await prisma.pet.groupBy({
      by: ['species'],
      where: { activeStatus: { in: ['FOR_SALE', 'FOR_ADOPTION'] } },
      _count: { id: true }
    });
    const speciesDistribution = speciesDistributionGroup.map(g => ({
      species: g.species,
      count: g._count.id
    }));

    // 2. Top cities locations
    const topCitiesGroup = await prisma.pet.groupBy({
      by: ['city'],
      where: { activeStatus: { in: ['FOR_SALE', 'FOR_ADOPTION'] } },
      _count: { id: true }
    });
    const topCities = topCitiesGroup
      .map(g => ({ city: g.city, count: g._count.id }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Top breeds
    const topBreedsGroup = await prisma.pet.groupBy({
      by: ['breed'],
      where: { activeStatus: { in: ['FOR_SALE', 'FOR_ADOPTION'] } },
      _count: { id: true }
    });
    const topBreeds = topBreedsGroup
      .map(g => ({ breed: g.breed, count: g._count.id }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Trending views count
    const mostViewed = await prisma.pet.findMany({
      where: { activeStatus: { in: ['FOR_SALE', 'FOR_ADOPTION'] } },
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        viewsCount: true,
        price: true,
        activeStatus: true,
        image: true
      },
      orderBy: { viewsCount: 'desc' },
      take: 5
    });

    // 5. Most reported
    const mostReported = await prisma.pet.findMany({
      where: { reportsCount: { gt: 0 } },
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        reportsCount: true,
        activeStatus: true,
        image: true
      },
      orderBy: { reportsCount: 'desc' },
      take: 5
    });

    // 6. Monthly listings telemetry mock
    const monthlyListings = [
      { month: 'Jan', listings: 12, sales: 5, adoptions: 7 },
      { month: 'Feb', listings: 24, sales: 11, adoptions: 12 },
      { month: 'Mar', listings: 35, sales: 18, adoptions: 15 },
      { month: 'Apr', listings: 48, sales: 22, adoptions: 24 },
      { month: 'May', listings: 65, sales: 30, adoptions: 28 },
      { month: 'Jun', listings: 85, sales: 42, adoptions: 35 }
    ];

    res.status(200).json({
      success: true,
      analytics: {
        speciesDistribution,
        topCities,
        topBreeds,
        mostViewed: mostViewed.map(mapPet),
        mostReported: mostReported.map(mapPet),
        monthlyListings,
        revenuePlaceholder: '450,000 PKR'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving analytics data', error: error.message });
  }
};

// @desc    Dismiss or resolve listings reports
// @route   PUT /api/admin/marketplace/reports/:reportId/resolve
// @access  Private/Admin
exports.resolveReport = async (req, res) => {
  try {
    const { action } = req.body; // 'resolve' or 'dismiss'
    const report = await prisma.report.findUnique({ where: { id: req.params.reportId } });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    await prisma.report.update({
      where: { id: req.params.reportId },
      data: { status: 'Resolved' }
    });

    if (action === 'dismiss') {
      await prisma.pet.update({
        where: { id: report.petId },
        data: { reportsCount: { decrement: 1 } }
      });
    }

    res.status(200).json({ success: true, message: `Report successfully ${action === 'dismiss' ? 'dismissed' : 'resolved'}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resolving report', error: error.message });
  }
};
