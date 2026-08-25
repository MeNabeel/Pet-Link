const Pet = require('../../models/Pet');
const Report = require('../../models/Report');
const User = require('../../models/User');
const sendEmail = require('../../utils/sendEmail');

// Helper to notify owner on status/moderation changes
const notifyOwner = async (petId, action) => {
  try {
    const pet = await Pet.findById(petId).populate('owner', 'name email');
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

    const query = {};

    // Realtime search match by Name, Owner Name, Listing ID, Breed, Species, City
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      
      // Let's resolve Owner ID mapping if searched by Owner Name
      let matchedOwnerIds = [];
      const matchedUsers = await User.find({ name: searchRegex }).select('_id');
      matchedOwnerIds = matchedUsers.map(u => u._id);

      const isObjectId = /^[0-9a-fA-F]{24}$/.test(search.trim());

      query.$or = [
        { name: searchRegex },
        { breed: searchRegex },
        { species: searchRegex },
        { city: searchRegex },
        { owner: { $in: matchedOwnerIds } }
      ];

      if (isObjectId) {
        query.$or.push({ _id: search.trim() });
      }
    }

    // Filters
    if (species) query.species = species;
    if (breed) query.breed = new RegExp(`^${breed}$`, 'i');
    if (gender) query.gender = gender;
    
    if (vaccinated !== undefined) {
      query.isVaccinated = vaccinated === 'true' || vaccinated === true;
    }
    if (city) query.city = new RegExp(`^${city}$`, 'i');
    if (province) query.province = new RegExp(`^${province}$`, 'i');

    // Listing Type Filter
    if (listingType && listingType !== 'all') {
      query.activeStatus = listingType;
    }

    // Status Filter (moderationStatus mapping)
    if (status && status !== 'all') {
      if (status === 'Featured') {
        query.isFeatured = true;
      } else if (status === 'Reported') {
        query.reportsCount = { $gt: 0 };
      } else {
        query.moderationStatus = status;
      }
    }

    // Price Filter
    if (listingType !== 'FOR_ADOPTION') {
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = Number(minPrice);
        if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
      }
    }

    // Sorting Map
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
    } else if (sort === 'most_viewed') {
      sortConfig = { viewsCount: -1 };
    } else if (sort === 'most_wishlisted') {
      sortConfig = { favoritesCount: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const pets = await Pet.find(query)
      .populate('owner', 'name email phone city province profilePic createdAt')
      .sort(sortConfig)
      .skip(skip)
      .limit(Number(limit));

    const total = await Pet.countDocuments(query);

    // Dynamic stats aggregation
    const totalListings = await Pet.countDocuments({});
    const forSaleCount = await Pet.countDocuments({ activeStatus: 'FOR_SALE' });
    const forAdoptionCount = await Pet.countDocuments({ activeStatus: 'FOR_ADOPTION' });
    const pendingApprovalCount = await Pet.countDocuments({ moderationStatus: 'Pending Review' });
    const soldPetsCount = await Pet.countDocuments({ adoptionStatus: 'Adopted', activeStatus: 'FOR_SALE' }); // Sold pets have adoptionStatus Adopted
    const adoptedPetsCount = await Pet.countDocuments({ adoptionStatus: 'Adopted', activeStatus: 'FOR_ADOPTION' });

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
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (status) pet.moderationStatus = status;
    if (activeStatus) pet.activeStatus = activeStatus;
    if (adoptionStatus) pet.adoptionStatus = adoptionStatus;

    const updated = await pet.save();
    
    // Notify owner via email helper
    await notifyOwner(updated._id, status || activeStatus || adoptionStatus);

    res.status(200).json({ success: true, message: 'Listing updated successfully', pet: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating listing status', error: error.message });
  }
};

// @desc    Toggle Featured listing flag
// @route   PUT /api/admin/marketplace/:petId/feature
// @access  Private/Admin
exports.toggleFeatured = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    pet.isFeatured = !pet.isFeatured;
    const updated = await pet.save();

    await notifyOwner(updated._id, updated.isFeatured ? 'featured' : 'removed from featured');

    res.status(200).json({ success: true, message: `Listing marked ${updated.isFeatured ? 'Featured' : 'Regular'}`, pet: updated });
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

    let updatePayload = {};
    if (action === 'approve') {
      updatePayload = { moderationStatus: 'Published' };
    } else if (action === 'reject') {
      updatePayload = { moderationStatus: 'Rejected' };
    } else if (action === 'archive') {
      updatePayload = { moderationStatus: 'Archived' };
    } else if (action === 'suspend') {
      updatePayload = { moderationStatus: 'Suspended' };
    } else if (action === 'delete') {
      updatePayload = { moderationStatus: 'Removed', activeStatus: 'ARCHIVED' };
    } else if (action === 'feature') {
      updatePayload = { isFeatured: value === undefined ? true : value };
    } else if (action === 'restore') {
      updatePayload = { moderationStatus: 'Published' };
    }

    await Pet.updateMany({ _id: { $in: ids } }, { $set: updatePayload });

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
    const speciesDistribution = await Pet.aggregate([
      { $match: { activeStatus: { $in: ['FOR_SALE', 'FOR_ADOPTION'] } } },
      { $group: { _id: '$species', count: { $sum: 1 } } },
      { $project: { species: '$_id', count: 1, _id: 0 } }
    ]);

    // 2. Top cities locations
    const topCities = await Pet.aggregate([
      { $match: { activeStatus: { $in: ['FOR_SALE', 'FOR_ADOPTION'] } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { city: '$_id', count: 1, _id: 0 } }
    ]);

    // 3. Top breeds
    const topBreeds = await Pet.aggregate([
      { $match: { activeStatus: { $in: ['FOR_SALE', 'FOR_ADOPTION'] } } },
      { $group: { _id: '$breed', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { breed: '$_id', count: 1, _id: 0 } }
    ]);

    // 4. Trending views count
    const mostViewed = await Pet.find({ activeStatus: { $in: ['FOR_SALE', 'FOR_ADOPTION'] } })
      .select('name species breed viewsCount price activeStatus image')
      .sort({ viewsCount: -1 })
      .limit(5);

    // 5. Most reported
    const mostReported = await Pet.find({ reportsCount: { $gt: 0 } })
      .select('name species breed reportsCount activeStatus image')
      .sort({ reportsCount: -1 })
      .limit(5);

    // 6. Monthly listings, adoptions, sales default chart telemetry mock
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
        mostViewed,
        mostReported,
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
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = 'Resolved';
    await report.save();

    // If resolve action is taken, we decrement reportsCount on the pet or handle accordingly
    if (action === 'dismiss') {
      await Pet.findByIdAndUpdate(report.pet, { $inc: { reportsCount: -1 } });
    }

    res.status(200).json({ success: true, message: `Report successfully ${action === 'dismiss' ? 'dismissed' : 'resolved'}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resolving report', error: error.message });
  }
};
