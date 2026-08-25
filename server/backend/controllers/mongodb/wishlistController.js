const Wishlist = require('../../models/Wishlist');
const Pet = require('../../models/Pet');

// @desc    Add pet to user wishlist
// @route   POST /api/wishlist/add
// @access  Public
exports.addToWishlist = async (req, res) => {
  try {
    const { userId, petId } = req.body;
    if (!userId || !petId) {
      return res.status(400).json({ success: false, message: 'Please provide user and pet identifier parameters' });
    }

    // Verify pet exists and is in the marketplace
    const pet = await Pet.findById(petId);
    if (!pet || !['FOR_SALE', 'FOR_ADOPTION'].includes(pet.activeStatus)) {
      return res.status(400).json({ success: false, message: 'Only active marketplace listings can be saved to wishlist' });
    }

    // Create unique wishlist record (handles duplicates via index)
    const savedItem = await Wishlist.findOneAndUpdate(
      { user: userId, pet: petId },
      { user: userId, pet: petId },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, message: 'Companion saved to your wishlist!', item: savedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save to wishlist', error: error.message });
  }
};

// @desc    Remove pet from user wishlist
// @route   POST /api/wishlist/remove
// @access  Public
exports.removeFromWishlist = async (req, res) => {
  try {
    const { userId, petId } = req.body;
    if (!userId || !petId) {
      return res.status(400).json({ success: false, message: 'Please provide user and pet identifier parameters' });
    }

    await Wishlist.findOneAndDelete({ user: userId, pet: petId });
    res.status(200).json({ success: true, message: 'Companion removed from wishlist successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove from wishlist', error: error.message });
  }
};

// @desc    Get user wishlist with on-the-fly stale records purge
// @route   GET /api/wishlist/owner/:userId
// @access  Public
exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    // Load user's wishlist mappings, populate pet details & owners
    const items = await Wishlist.find({ user: userId })
      .populate({
        path: 'pet',
        populate: {
          path: 'owner',
          select: 'name email phone city province profilePic'
        }
      });

    const validPets = [];
    const staleItemIds = [];

    // Purge records on-the-fly for pets no longer available
    for (const item of items) {
      if (!item.pet || !['FOR_SALE', 'FOR_ADOPTION'].includes(item.pet.activeStatus)) {
        staleItemIds.push(item._id);
      } else {
        validPets.push(item.pet);
      }
    }

    // Run clean up delete queries in parallel background if any stale keys found
    if (staleItemIds.length > 0) {
      await Wishlist.deleteMany({ _id: { $in: staleItemIds } });
    }

    res.status(200).json({
      success: true,
      wishlist: validPets,
      purgedCount: staleItemIds.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve wishlist directory', error: error.message });
  }
};
