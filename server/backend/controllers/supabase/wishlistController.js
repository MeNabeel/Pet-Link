const { prisma } = require('../../database/supabase/client');

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
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || !['FOR_SALE', 'FOR_ADOPTION'].includes(pet.activeStatus)) {
      return res.status(400).json({ success: false, message: 'Only active marketplace listings can be saved to wishlist' });
    }

    // Create unique wishlist record
    const savedItem = await prisma.wishlist.upsert({
      where: {
        userId_petId: {
          userId,
          petId
        }
      },
      update: {},
      create: {
        userId,
        petId
      }
    });

    // Format response to match MongoDB structure
    const formattedItem = {
      _id: savedItem.id,
      user: savedItem.userId,
      pet: savedItem.petId,
      createdAt: savedItem.createdAt,
      updatedAt: savedItem.updatedAt
    };

    res.status(201).json({ success: true, message: 'Companion saved to your wishlist!', item: formattedItem });
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

    await prisma.wishlist.deleteMany({
      where: {
        userId,
        petId
      }
    });
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
    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        pet: {
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
          }
        }
      }
    });

    const validPets = [];
    const staleItemIds = [];

    // Purge records on-the-fly for pets no longer available
    for (const item of items) {
      if (!item.pet || !['FOR_SALE', 'FOR_ADOPTION'].includes(item.pet.activeStatus)) {
        staleItemIds.push(item.id);
      } else {
        // Map keys like id to _id to preserve frontend structure
        const mappedPet = {
          ...item.pet,
          _id: item.pet.id,
          owner: item.pet.owner ? { ...item.pet.owner, _id: item.pet.owner.id } : null
        };
        delete mappedPet.id;
        if (mappedPet.owner) delete mappedPet.owner.id;
        validPets.push(mappedPet);
      }
    }

    // Run clean up delete queries if any stale keys found
    if (staleItemIds.length > 0) {
      await prisma.wishlist.deleteMany({
        where: {
          id: {
            in: staleItemIds
          }
        }
      });
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
