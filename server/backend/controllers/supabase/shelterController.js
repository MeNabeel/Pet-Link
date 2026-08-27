const { supabase } = require('../../database/supabase/client');

// Helper to check user role
const checkRole = async (userId, allowedRoles = ['shelter_provider', 'admin']) => {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) return false;
  return allowedRoles.includes(data.role);
};

// @desc    Check unique shelter name
// @route   GET /api/shelter/check-name
// @access  Public
exports.checkNameUniqueness = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: 'Name parameter is required' });
    }

    const { data, error } = await supabase
      .from('shelter_profiles')
      .select('id')
      .eq('name', name.trim());

    if (error) throw error;

    const available = data.length === 0;
    res.status(200).json({ 
      available, 
      message: available ? '✓ Shelter name available' : 'That shelter name is already in use.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking name uniqueness', error: error.message });
  }
};

// @desc    Get shelter profile of logged in user
// @route   GET /api/shelter/profile
// @access  Private
exports.getShelterProfile = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    if (!requesterId) {
      return res.status(400).json({ message: 'Missing x-requester-id header' });
    }

    const { data, error } = await supabase
      .from('shelter_profiles')
      .select('*')
      .eq('userId', requesterId)
      .maybeSingle();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving shelter profile', error: error.message });
  }
};

// @desc    Create or update shelter profile
// @route   POST /api/shelter/profile
// @access  Private (Shelter Provider)
exports.upsertShelterProfile = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    if (!requesterId) {
      return res.status(400).json({ message: 'Missing x-requester-id header' });
    }

    const isAuthorized = await checkRole(requesterId);
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Forbidden: Shelter Provider access only' });
    }

    const profileData = req.body;
    profileData.userId = requesterId;

    // Check if name is already taken by another profile
    if (profileData.name) {
      const { data: existing } = await supabase
        .from('shelter_profiles')
        .select('id, userId')
        .eq('name', profileData.name.trim())
        .maybeSingle();

      if (existing && existing.userId !== requesterId) {
        return res.status(400).json({ message: 'That shelter name is already in use.' });
      }
    }

    // Check if profile exists to do insert or update
    const { data: currentProfile } = await supabase
      .from('shelter_profiles')
      .select('id')
      .eq('userId', requesterId)
      .maybeSingle();

    let result;
    if (currentProfile) {
      // Update
      const { data, error } = await supabase
        .from('shelter_profiles')
        .update({
          ...profileData,
          updatedAt: new Date().toISOString()
        })
        .eq('userId', requesterId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('shelter_profiles')
        .insert({
          ...profileData,
          status: profileData.status || 'Pending Approval'
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error saving shelter profile', error: error.message });
  }
};

// @desc    Get provider shelter services
// @route   GET /api/shelter/services
// @access  Private (Shelter Provider)
exports.getShelterServices = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { data: profile } = await supabase
      .from('shelter_profiles')
      .select('id')
      .eq('userId', requesterId)
      .maybeSingle();

    if (!profile) {
      return res.status(400).json({ message: 'No shelter profile found for user' });
    }

    const { data, error } = await supabase
      .from('shelter_services')
      .select('*')
      .eq('shelterId', profile.id)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving shelter services', error: error.message });
  }
};

// @desc    Create shelter service
// @route   POST /api/shelter/services
// @access  Private (Shelter Provider)
exports.createShelterService = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { data: profile } = await supabase
      .from('shelter_profiles')
      .select('id')
      .eq('userId', requesterId)
      .maybeSingle();

    if (!profile) {
      return res.status(400).json({ message: 'Create a shelter profile first' });
    }

    const serviceData = req.body;
    serviceData.shelterId = profile.id;

    const { data, error } = await supabase
      .from('shelter_services')
      .insert([serviceData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating shelter service', error: error.message });
  }
};

// @desc    Update shelter service
// @route   PUT /api/shelter/services/:id
// @access  Private (Shelter Provider)
exports.updateShelterService = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { data: profile } = await supabase
      .from('shelter_profiles')
      .select('id')
      .eq('userId', requesterId)
      .maybeSingle();

    if (!profile) {
      return res.status(400).json({ message: 'Shelter profile not found' });
    }

    const { id } = req.params;
    const { data, error } = await supabase
      .from('shelter_services')
      .update({
        ...req.body,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .eq('shelterId', profile.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error updating shelter service', error: error.message });
  }
};

// @desc    Delete/Deactivate shelter service
// @route   DELETE /api/shelter/services/:id
// @access  Private (Shelter Provider)
exports.deleteShelterService = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { data: profile } = await supabase
      .from('shelter_profiles')
      .select('id')
      .eq('userId', requesterId)
      .maybeSingle();

    if (!profile) {
      return res.status(400).json({ message: 'Shelter profile not found' });
    }

    const { id } = req.params;
    const { data, error } = await supabase
      .from('shelter_services')
      .update({ status: 'Inactive', updatedAt: new Date().toISOString() })
      .eq('id', id)
      .eq('shelterId', profile.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating shelter service', error: error.message });
  }
};

// @desc    Get shelter bookings
// @route   GET /api/shelter/bookings
// @access  Private (Shelter Provider)
exports.getShelterBookings = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { data: profile } = await supabase
      .from('shelter_profiles')
      .select('id')
      .eq('userId', requesterId)
      .maybeSingle();

    if (!profile) {
      return res.status(400).json({ message: 'Shelter profile not found' });
    }

    const { data, error } = await supabase
      .from('shelter_bookings')
      .select(`
        *,
        owner:users(id, name, email, phone, profilePic),
        pet:pets(id, name, breed, species, age, image, medicalHistory, allergies),
        service:shelter_services(*)
      `)
      .eq('shelterId', profile.id)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    // Map properties for frontend compatibility
    const mapped = data.map(b => ({
      ...b,
      ownerName: b.owner?.name,
      petName: b.pet?.name,
      serviceName: b.service?.name
    }));

    res.status(200).json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving bookings', error: error.message });
  }
};

// @desc    Update booking status and update capacity
// @route   PUT /api/shelter/bookings/:id/status
// @access  Private (Shelter Provider)
exports.updateBookingStatus = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { data: profile } = await supabase
      .from('shelter_profiles')
      .select('id')
      .eq('userId', requesterId)
      .maybeSingle();

    if (!profile) {
      return res.status(400).json({ message: 'Shelter profile not found' });
    }

    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    // Fetch original booking to check existence
    const { data: booking } = await supabase
      .from('shelter_bookings')
      .select('id, shelterId')
      .eq('id', id)
      .eq('shelterId', profile.id)
      .maybeSingle();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update status
    const { data: updatedBooking, error } = await supabase
      .from('shelter_bookings')
      .update({
        status,
        rejectionReason: status === 'Rejected' ? rejectionReason || '' : '',
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Dynamically calculate occupied spaces for this shelter profile
    const { data: activeBookings } = await supabase
      .from('shelter_bookings')
      .select('id')
      .eq('shelterId', profile.id)
      .in('status', ['Accepted', 'Active']);

    const occupiedCount = activeBookings ? activeBookings.length : 0;

    // Update occupiedSpaces in profile
    await supabase
      .from('shelter_profiles')
      .update({ occupiedSpaces: occupiedCount })
      .eq('id', profile.id);

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
};

// @desc    Get public shelters for user discovery
// @route   GET /api/shelter/public/list
// @access  Public
exports.getPublicShelters = async (req, res) => {
  try {
    const { city, service, species, breed, pickup } = req.query;

    let query = supabase
      .from('shelter_profiles')
      .select('*')
      .eq('status', 'Published');

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (pickup === 'true') {
      query = query.eq('providesPickup', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    let filtered = data;

    // Manual filtering for complex arrays if present
    if (service) {
      filtered = filtered.filter(s => s.shelterTypes && s.shelterTypes.includes(service));
    }
    if (species) {
      filtered = filtered.filter(s => s.acceptedSpecies && s.acceptedSpecies.includes(species));
    }
    if (breed) {
      filtered = filtered.filter(s => s.acceptedBreeds && s.acceptedBreeds.includes(breed));
    }

    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: 'Error discovering shelters', error: error.message });
  }
};

// @desc    Get public shelter details by ID
// @route   GET /api/shelter/public/:id
// @access  Public
exports.getPublicShelterDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: shelter, error } = await supabase
      .from('shelter_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    // Fetch related services
    const { data: services } = await supabase
      .from('shelter_services')
      .select('*')
      .eq('shelterId', id)
      .eq('status', 'Active');

    // Fetch related reviews
    const { data: reviews } = await supabase
      .from('shelter_reviews')
      .select(`
        *,
        user:users(id, name, profilePic)
      `)
      .eq('shelterId', id);

    res.status(200).json({
      ...shelter,
      services: services || [],
      reviews: reviews || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving shelter details', error: error.message });
  }
};

// @desc    Create booking request (by pet owner)
// @route   POST /api/shelter/public/bookings
// @access  Private
exports.createBookingRequest = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    if (!requesterId) {
      return res.status(400).json({ message: 'Missing x-requester-id header' });
    }

    const bookingData = req.body;
    bookingData.ownerId = requesterId;
    bookingData.status = 'Pending';

    // Verify dates check
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    if (checkOut <= checkIn) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    const { data, error } = await supabase
      .from('shelter_bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting booking request', error: error.message });
  }
};

// @desc    Get user's personal bookings
// @route   GET /api/shelter/user/bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    if (!requesterId) {
      return res.status(400).json({ message: 'Missing x-requester-id header' });
    }

    const { data, error } = await supabase
      .from('shelter_bookings')
      .select(`
        *,
        shelter:shelter_profiles(*),
        pet:pets(id, name, species, breed, image),
        service:shelter_services(*)
      `)
      .eq('ownerId', requesterId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user bookings', error: error.message });
  }
};

// @desc    Get reviews for a shelter
// @route   GET /api/shelter/reviews
// @access  Public
exports.getShelterReviews = async (req, res) => {
  try {
    const { shelterId } = req.query;
    if (!shelterId) {
      return res.status(400).json({ message: 'Missing shelterId query parameter' });
    }

    const { data, error } = await supabase
      .from('shelter_reviews')
      .select(`
        *,
        user:users(id, name, profilePic)
      `)
      .eq('shelterId', shelterId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving shelter reviews', error: error.message });
  }
};

// @desc    Create a review for booking
// @route   POST /api/shelter/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'BookingId and rating are required' });
    }

    // Verify booking
    const { data: booking } = await supabase
      .from('shelter_bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('ownerId', requesterId)
      .maybeSingle();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not owned by requester' });
    }

    const { data, error } = await supabase
      .from('shelter_reviews')
      .insert([{
        bookingId,
        shelterId: booking.shelterId,
        userId: requesterId,
        rating: parseInt(rating),
        comment: comment || ''
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// @desc    Respond to review
// @route   POST /api/shelter/reviews/:id/response
// @access  Private (Shelter Provider)
exports.respondToReview = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { id } = req.params;
    const { response } = req.body;

    const { data: profile } = await supabase
      .from('shelter_profiles')
      .select('id')
      .eq('userId', requesterId)
      .maybeSingle();

    if (!profile) {
      return res.status(400).json({ message: 'Shelter profile not found' });
    }

    const { data, error } = await supabase
      .from('shelter_reviews')
      .update({ response })
      .eq('id', id)
      .eq('shelterId', profile.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error responding to review', error: error.message });
  }
};

// @desc    Get shelter messages
// @route   GET /api/shelter/messages/:bookingId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { data, error } = await supabase
      .from('shelter_messages')
      .select('*')
      .eq('bookingId', bookingId)
      .order('createdAt', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages', error: error.message });
  }
};

// @desc    Send message
// @route   POST /api/shelter/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { bookingId, receiverId, message } = req.body;

    const { data, error } = await supabase
      .from('shelter_messages')
      .insert([{
        bookingId,
        senderId: requesterId,
        receiverId,
        message,
        isRead: false
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// @desc    Shelter Wishlist operations
// @route   POST /api/shelter/wishlist
// @access  Private
exports.toggleWishlist = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { shelterId } = req.body;

    const { data: existing } = await supabase
      .from('shelter_wishlist')
      .select('id')
      .eq('userId', requesterId)
      .eq('shelterId', shelterId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('shelter_wishlist')
        .delete()
        .eq('id', existing.id);
      res.status(200).json({ wishlisted: false });
    } else {
      await supabase
        .from('shelter_wishlist')
        .insert([{ userId: requesterId, shelterId }]);
      res.status(200).json({ wishlisted: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Wishlist toggle failed', error: error.message });
  }
};

// @desc    Get user's wishlist
// @route   GET /api/shelter/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { data, error } = await supabase
      .from('shelter_wishlist')
      .select('*, shelter:shelter_profiles(*)')
      .eq('userId', requesterId);

    if (error) throw error;
    res.status(200).json(data.map(w => w.shelter));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving wishlist', error: error.message });
  }
};
