const Pet = require('../../models/Pet');
const Report = require('../../models/Report');

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
    const query = {
      activeStatus: { $in: ['FOR_SALE', 'FOR_ADOPTION'] }
    };

    // Text Search Match
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { breed: searchRegex },
        { species: searchRegex },
        { aboutPet: searchRegex },
        { city: searchRegex },
        { province: searchRegex }
      ];
    }

    // Exact Match Filters
    if (species) query.species = species;
    if (breed) query.breed = new RegExp(`^${breed}$`, 'i');
    if (gender) query.gender = gender;
    if (age) query.age = age;
    if (size) query.size = size;
    if (color) query.color = new RegExp(color, 'i');
    
    if (vaccinated !== undefined) {
      query.isVaccinated = vaccinated === 'true' || vaccinated === true;
    }
    if (friendlyWithKids !== undefined) {
      query.friendlyWithKids = friendlyWithKids === 'true' || friendlyWithKids === true;
    }
    if (friendlyWithPets !== undefined) {
      query.friendlyWithPets = friendlyWithPets === 'true' || friendlyWithPets === true;
    }
    if (trainingLevel) query.trainingLevel = trainingLevel;
    if (city) query.city = new RegExp(`^${city}$`, 'i');
    if (province) query.province = new RegExp(`^${province}$`, 'i');

    // Listing Type Filter
    if (listingType && listingType !== 'all') {
      query.activeStatus = listingType;
    }

    // Price Filtering (Applies only when listingType is not FOR_ADOPTION)
    if (listingType !== 'FOR_ADOPTION') {
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = Number(minPrice);
        if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
      }
    }

    // Sorting Configuration
    let sortConfig = {};
    if (sort === 'newest') {
      sortConfig = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortConfig = { createdAt: 1 };
    } else if (sort === 'price_asc') {
      sortConfig = { price: 1, createdAt: -1 };
    } else if (sort === 'price_desc') {
      sortConfig = { price: -1, createdAt: -1 };
    } else if (sort === 'recently_updated') {
      sortConfig = { updatedAt: -1 };
    }

    // Pagination Calculation
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute database query with populated owner profile
    const pets = await Pet.find(query)
      .populate('owner', 'name email phone city province profilePic')
      .sort(sortConfig)
      .skip(skip)
      .limit(Number(limit));

    const total = await Pet.countDocuments(query);

    // Compute dynamic dashboard stats (relative to current filters if needed, but here absolute for active marketplace listings)
    const statsQuery = { activeStatus: { $in: ['FOR_SALE', 'FOR_ADOPTION'] } };
    
    const totalListings = await Pet.countDocuments(statsQuery);
    const forSaleCount = await Pet.countDocuments({ activeStatus: 'FOR_SALE' });
    const forAdoptionCount = await Pet.countDocuments({ activeStatus: 'FOR_ADOPTION' });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyAddedCount = await Pet.countDocuments({
      ...statsQuery,
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      pets,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
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
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Find similar pets by matching species, breed or city
    const similarPets = await Pet.find({
      _id: { $ne: pet._id },
      activeStatus: { $in: ['FOR_SALE', 'FOR_ADOPTION'] },
      $or: [
        { species: pet.species },
        { breed: pet.breed },
        { city: pet.city }
      ]
    })
    .populate('owner', 'name email phone city province profilePic')
    .limit(4);

    res.status(200).json({ success: true, similarPets });
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

    const reportEntry = await Report.create({
      reporter,
      pet: petId,
      reason,
      status: 'Pending'
    });

    res.status(201).json({ success: true, message: 'Thank you for reporting. Platform Admins will review this listing shortly.', report: reportEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting listing report', error: error.message });
  }
};
