const { Pool } = require('pg');
const dotenv = require('dotenv');
const fetch = require('node-fetch'); // Standard fetch package on node environment

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// In-Memory Search Caching Strategy (6-hour expiration)
const searchCache = new Map();
const CACHE_EXPIRY_MS = 6 * 60 * 60 * 1000; // 6 Hours

const getCacheKey = (lat, lng, radius, query = '') => {
  const roundedLat = lat ? parseFloat(lat).toFixed(3) : '0';
  const roundedLng = lng ? parseFloat(lng).toFixed(3) : '0';
  return `${roundedLat}_${roundedLng}_${radius}_${query.trim().toLowerCase()}`;
};

const getCachedSearch = (key) => {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_EXPIRY_MS) {
    searchCache.delete(key);
    return null;
  }
  return entry.data;
};

const cacheSearch = (key, data) => {
  searchCache.set(key, {
    timestamp: Date.now(),
    data
  });
};

// Helper: Dispatch system notification
const createNotification = async (userId, title, message, type = 'General') => {
  try {
    await pool.query(`
      INSERT INTO notifications ("userId", title, message, type)
      VALUES ($1, $2, $3, $4);
    `, [userId, title, message, type]);
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
};

// Helper: Map Google Places response items and link with Supabase connected state
const mapGooglePlacesAndCheckConnections = async (googlePlaces, userLat, userLng) => {
  const mapped = [];

  for (const place of googlePlaces) {
    const placeId = place.id;
    if (!placeId) continue;

    // Check if this Place ID is connected to PetLink in Supabase
    const { rows: connectedClinics } = await pool.query(
      'SELECT id, "startingFee", "providesEmergency" FROM clinics WHERE "googlePlaceId" = $1 AND status = \'Active\'',
      [placeId]
    );

    const isConnected = connectedClinics.length > 0;
    const connectedClinicId = isConnected ? connectedClinics[0].id : null;
    const startingFee = isConnected ? connectedClinics[0].startingFee : null;
    const providesEmergency = isConnected ? connectedClinics[0].providesEmergency : false;

    // Calculate distance if user lat/long is provided
    let calculatedDistance = null;
    if (userLat && userLng && place.location?.latitude && place.location?.longitude) {
      const { rows: distRows } = await pool.query(
        'SELECT calculate_distance($1, $2, $3, $4) AS distance',
        [parseFloat(userLat), parseFloat(userLng), parseFloat(place.location.latitude), parseFloat(place.location.longitude)]
      );
      calculatedDistance = distRows[0]?.distance || null;
    }

    // Map photo URL
    let photoUrl = 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=600';
    if (place.photos && place.photos.length > 0 && process.env.GOOGLE_PLACES_API_KEY) {
      photoUrl = `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${process.env.GOOGLE_PLACES_API_KEY}&maxHeightPx=400`;
    }

    mapped.push({
      googlePlaceId: placeId,
      name: place.displayName?.text || 'Veterinary Clinic',
      formattedAddress: place.formattedAddress || 'Address not available',
      latitude: place.location?.latitude || null,
      longitude: place.location?.longitude || null,
      rating: place.rating || null,
      reviewCount: place.userRatingCount || 0,
      phone: place.nationalPhoneNumber || null,
      website: place.websiteUri || null,
      photo: photoUrl,
      openNow: place.regularOpeningHours?.openNow ?? null,
      weekdayDescriptions: place.regularOpeningHours?.weekdayDescriptions || [],
      connected: isConnected,
      clinicId: connectedClinicId,
      startingFee,
      providesEmergency,
      distance: calculatedDistance
    });
  }

  return mapped;
};

// Fallback/Simulated Google Places results for offline development testing
const getSimulatedPlaces = () => {
  return [
    {
      id: 'ChIJ53w4fF353zgRkC0lK6YFz5k',
      displayName: { text: 'DHA Animal Hospital & Emergency Care' },
      formattedAddress: 'Sector XX, DHA Phase 3, Lahore, Pakistan',
      location: { latitude: 31.4697, longitude: 74.4084 },
      rating: 4.9,
      userRatingCount: 42,
      nationalPhoneNumber: '03001234567',
      websiteUri: 'https://dhavet.petlink.com',
      regularOpeningHours: {
        openNow: true,
        weekdayDescriptions: ['Monday: 24 Hours', 'Tuesday: 24 Hours', 'Wednesday: 24 Hours', 'Thursday: 24 Hours', 'Friday: 24 Hours', 'Saturday: 24 Hours', 'Sunday: 24 Hours']
      }
    },
    {
      id: 'ChIJ_yGpg60FGTkRZk99oO6xNRE',
      displayName: { text: 'Gulberg Pet Wellness Clinic' },
      formattedAddress: 'Block K, Gulberg 2, Lahore, Pakistan',
      location: { latitude: 31.5204, longitude: 74.3587 },
      rating: 4.7,
      userRatingCount: 28,
      nationalPhoneNumber: '03217654321',
      websiteUri: 'https://gulbergvet.petlink.com',
      regularOpeningHours: {
        openNow: true,
        weekdayDescriptions: ['Monday: 9:00 AM – 9:00 PM', 'Tuesday: 9:00 AM – 9:00 PM', 'Wednesday: 9:00 AM – 9:00 PM', 'Thursday: 9:00 AM – 9:00 PM', 'Friday: 9:00 AM – 9:00 PM', 'Saturday: 9:00 AM – 9:00 PM', 'Sunday: Closed']
      }
    },
    {
      id: 'ChIJm7_Bv9g9sTkRl_iN1p961-A',
      displayName: { text: 'Clifton Veterinary Hospital & Surgery Center' },
      formattedAddress: 'Block 5, Clifton, Karachi, Pakistan',
      location: { latitude: 24.8138, longitude: 67.0336 },
      rating: 4.8,
      userRatingCount: 35,
      nationalPhoneNumber: '03338765432',
      websiteUri: 'https://cliftonvet.petlink.com',
      regularOpeningHours: {
        openNow: false,
        weekdayDescriptions: ['Monday: 9:00 AM – 8:00 PM', 'Tuesday: 9:00 AM – 8:00 PM', 'Wednesday: 9:00 AM – 8:00 PM', 'Thursday: 9:00 AM – 8:00 PM', 'Friday: 9:00 AM – 8:00 PM', 'Saturday: 9:00 AM – 8:00 PM', 'Sunday: Closed']
      }
    },
    {
      id: 'ChIJV4qPZ-d3tTkRs8D8T72xXwE',
      displayName: { text: 'Islamabad Animal Wellness Center' },
      formattedAddress: 'Street 12, F-7/2, Islamabad, Pakistan',
      location: { latitude: 33.7215, longitude: 73.0564 },
      rating: 4.6,
      userRatingCount: 19,
      nationalPhoneNumber: '03154567890',
      websiteUri: 'https://islamabadvets.petlink.com',
      regularOpeningHours: {
        openNow: true,
        weekdayDescriptions: ['Monday: 9:00 AM – 9:00 PM', 'Tuesday: 9:00 AM – 9:00 PM', 'Wednesday: 9:00 AM – 9:00 PM', 'Thursday: 9:00 AM – 9:00 PM', 'Friday: 9:00 AM – 9:00 PM', 'Saturday: 9:00 AM – 5:00 PM', 'Sunday: Closed']
      }
    }
  ];
};

// @desc    Geospatial nearby clinic search using Google Places API (New)
// @route   GET /api/clinics/nearby
// @access  Public
exports.getNearbyClinics = async (req, res) => {
  try {
    const { lat, lng, city, service, providesEmergency, rating, distanceLimit } = req.query;
    const radius = distanceLimit ? parseInt(distanceLimit) * 1000 : 25000; // in meters (default 25km)

    const cacheKey = getCacheKey(lat, lng, radius, city || '');
    const cachedData = getCachedSearch(cacheKey);

    if (cachedData) {
      console.log('Serving clinic search results from cache...');
      return res.status(200).json(cachedData);
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.log('Google Places API Key missing. Returning simulation demo clinics...');
      const simulated = getSimulatedPlaces();
      
      // Filter list for matching criteria
      let filteredSimulated = simulated;
      if (city) {
        filteredSimulated = simulated.filter(c => c.formattedAddress.toLowerCase().includes(city.toLowerCase()));
      }

      const responseData = await mapGooglePlacesAndCheckConnections(filteredSimulated, lat, lng);
      
      // Tag response with key missing metadata
      res.setHeader('x-places-api-key-missing', 'true');
      return res.status(200).json(responseData);
    }

    let googlePlaces = [];

    if (lat && lng) {
      // 1. Coordinates Search: Call Nearby Search (New) API
      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.photos'
        },
        body: JSON.stringify({
          includedTypes: ['veterinary_care'],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng)
              },
              radius: parseFloat(radius)
            }
          }
        })
      });

      if (response.ok) {
        const body = await response.json();
        googlePlaces = body.places || [];
      } else {
        const errorBody = await response.text();
        console.error('Google Places Nearby API error:', errorBody);
        return res.status(502).json({ message: 'Google Places Nearby API search failure.' });
      }
    } else {
      // 2. City Fallback Search: Call Text Search (New) API
      const textQuery = city ? `veterinary care clinics in ${city}` : 'veterinary clinics near me';
      const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.photos'
        },
        body: JSON.stringify({
          textQuery,
          includedType: 'veterinary_care',
          maxResultCount: 20
        })
      });

      if (response.ok) {
        const body = await response.json();
        googlePlaces = body.places || [];
      } else {
        const errorBody = await response.text();
        console.error('Google Places Text API error:', errorBody);
        return res.status(502).json({ message: 'Google Places Text API search failure.' });
      }
    }

    // Map Google fields & resolve Supabase connection keys
    let finalClinics = await mapGooglePlacesAndCheckConnections(googlePlaces, lat, lng);

    // Apply local rating filters
    if (rating) {
      const minRating = parseFloat(rating);
      finalClinics = finalClinics.filter(c => c.rating >= minRating);
    }

    // Sort by distance (if coords exist) or rating (descending)
    if (lat && lng) {
      finalClinics.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    } else {
      finalClinics.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    // Store in-memory cache
    cacheSearch(cacheKey, finalClinics);

    res.status(200).json(finalClinics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching nearby clinics', error: error.message });
  }
};

// @desc    Get Place Details by Google Place ID
// @route   GET /api/clinics/:id
// @access  Public
exports.getClinicDetails = async (req, res) => {
  try {
    const { id } = req.params; // Expects Google Place ID
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    let placeData = null;

    if (!apiKey) {
      console.log('Google Places API Key missing. Returning simulation details...');
      const simulated = getSimulatedPlaces();
      placeData = simulated.find(c => c.id === id);

      if (!placeData) {
        return res.status(404).json({ message: 'Clinic details not found in simulation database.' });
      }
    } else {
      // Call Google Place Details (New) API
      const response = await fetch(`https://places.googleapis.com/v1/places/${id}?key=${apiKey}`, {
        headers: {
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,nationalPhoneNumber,websiteUri,regularOpeningHours,photos'
        }
      });

      if (response.ok) {
        placeData = await response.json();
      } else {
        const errorBody = await response.text();
        console.error('Google Place Details API error:', errorBody);
        return res.status(502).json({ message: 'Google Place Details API retrieval failure.' });
      }
    }

    // Map properties
    let photoUrl = 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800';
    if (placeData.photos && placeData.photos.length > 0 && apiKey) {
      photoUrl = `https://places.googleapis.com/v1/${placeData.photos[0].name}/media?key=${apiKey}&maxHeightPx=600`;
    }

    const clinicProfile = {
      googlePlaceId: placeData.id,
      name: placeData.displayName?.text || 'Veterinary Clinic',
      formattedAddress: placeData.formattedAddress || 'Address not available',
      latitude: placeData.location?.latitude || null,
      longitude: placeData.location?.longitude || null,
      rating: placeData.rating || null,
      reviewCount: placeData.userRatingCount || 0,
      phone: placeData.nationalPhoneNumber || null,
      website: placeData.websiteUri || null,
      photo: photoUrl,
      openNow: placeData.regularOpeningHours?.openNow ?? null,
      weekdayDescriptions: placeData.regularOpeningHours?.weekdayDescriptions || [],
      connected: false,
      clinicId: null,
      services: [],
      doctors: [],
      reviews: []
    };

    // Query connected credentials in Supabase using the Place ID
    const { rows: connectedClinics } = await pool.query(
      'SELECT id, description, logo, "startingFee", "providesEmergency" FROM clinics WHERE "googlePlaceId" = $1 AND status = \'Active\'',
      [placeData.id]
    );

    if (connectedClinics.length > 0) {
      const conn = connectedClinics[0];
      clinicProfile.connected = true;
      clinicProfile.clinicId = conn.id;
      clinicProfile.logo = conn.logo || '';
      clinicProfile.description = conn.description || '';
      clinicProfile.startingFee = conn.startingFee || 0;
      clinicProfile.providesEmergency = conn.providesEmergency || false;

      // Load PetLink connected services
      const { rows: services } = await pool.query(
        'SELECT * FROM clinic_services WHERE "clinicId" = $1 AND status = \'Active\'',
        [conn.id]
      );
      clinicProfile.services = services;

      // Load PetLink connected doctors
      const { rows: doctors } = await pool.query(
        'SELECT * FROM clinic_doctors WHERE "clinicId" = $1 AND status = \'Active\'',
        [conn.id]
      );
      clinicProfile.doctors = doctors;

      // Load PetLink user reviews
      const { rows: reviews } = await pool.query(`
        SELECT r.*, u.name as "userName", u."profilePic" as "userAvatar"
        FROM clinic_reviews r
        JOIN users u ON r."userId" = u.id
        WHERE r."clinicId" = $1
        ORDER BY r."createdAt" DESC
      `, [conn.id]);
      clinicProfile.reviews = reviews;
    }

    res.status(200).json(clinicProfile);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving clinic details', error: error.message });
  }
};

// @desc    Book / Request an appointment
// @route   POST /api/clinics/appointments
// @access  Private
exports.bookAppointment = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { clinicId, serviceId, doctorId, petId, appointmentDate, appointmentTime, notes } = req.body;

    if (!requesterId || !clinicId || !petId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Verify pet belongs to user
    const { rows: pets } = await pool.query('SELECT * FROM pets WHERE id = $1 AND "ownerId" = $2', [petId, requesterId]);
    if (pets.length === 0) {
      return res.status(403).json({ message: 'Forbidden: Selected pet does not belong to user' });
    }

    // Check if slot is already booked for this doctor
    if (doctorId) {
      const { rows: exists } = await pool.query(`
        SELECT id FROM clinic_appointments
        WHERE "doctorId" = $1 AND "appointmentDate" = $2 AND "appointmentTime" = $3 AND status IN ('Confirmed', 'Pending')
      `, [doctorId, appointmentDate, appointmentTime]);

      if (exists.length > 0) {
        return res.status(400).json({ message: 'The selected veterinarian is already booked at this time slot' });
      }
    }

    // Insert appointment
    const { rows: appt } = await pool.query(`
      INSERT INTO clinic_appointments ("clinicId", "serviceId", "doctorId", "petId", "userId", "appointmentDate", "appointmentTime", notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending')
      RETURNING *;
    `, [clinicId, serviceId || null, doctorId || null, petId, requesterId, appointmentDate, appointmentTime, notes || '']);

    const appointment = appt[0];

    // Fetch clinic name for notification
    const { rows: clinic } = await pool.query('SELECT name FROM clinics WHERE id = $1', [clinicId]);
    const clinicName = clinic[0]?.name || 'the clinic';

    // Dispatch notification
    await createNotification(
      requesterId,
      'Appointment Requested',
      `Your booking request for ${pets[0].name} at ${clinicName} on ${appointmentDate} at ${appointmentTime} has been submitted.`,
      'Appointment'
    );

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error scheduling appointment', error: error.message });
  }
};

// @desc    Get user appointments
// @route   GET /api/clinics/user/appointments
// @access  Private
exports.getUserAppointments = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    if (!requesterId) {
      return res.status(400).json({ message: 'Missing x-requester-id header' });
    }

    const { rows: appointments } = await pool.query(`
      SELECT 
        a.*,
        c.name as "clinicName", c.address as "clinicAddress", c.city as "clinicCity",
        p.name as "petName", p.image as "petImage", p.breed as "petBreed",
        s.name as "serviceName", s.price as "servicePrice",
        d.name as "doctorName", d.specialization as "doctorSpecialization"
      FROM clinic_appointments a
      JOIN clinics c ON a."clinicId" = c.id
      JOIN pets p ON a."petId" = p.id
      LEFT JOIN clinic_services s ON a."serviceId" = s.id
      LEFT JOIN clinic_doctors d ON a."doctorId" = d.id
      WHERE a."userId" = $1
      ORDER BY a."appointmentDate" DESC, a."appointmentTime" DESC
    `, [requesterId]);

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving appointments', error: error.message });
  }
};

// @desc    Update appointment status (Admin / Provider / User Cancel)
// @route   PUT /api/clinics/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { id } = req.params;
    const { status } = req.body;

    const { rows: appts } = await pool.query('SELECT * FROM clinic_appointments WHERE id = $1', [id]);
    if (appts.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = appts[0];

    if (status === 'Cancelled' && appointment.userId !== requesterId) {
      return res.status(403).json({ message: 'Unauthorized status operation' });
    }

    const { rows: updated } = await pool.query(`
      UPDATE clinic_appointments
      SET status = $1, "updatedAt" = NOW()
      WHERE id = $2
      RETURNING *;
    `, [status, id]);

    const updatedAppointment = updated[0];

    const { rows: clinic } = await pool.query('SELECT name FROM clinics WHERE id = $1', [appointment.clinicId]);
    const clinicName = clinic[0]?.name || 'the clinic';

    await createNotification(
      appointment.userId,
      `Appointment ${status}`,
      `Your appointment at ${clinicName} on ${appointment.appointmentDate} has been ${status.toLowerCase()}.`,
      'Appointment'
    );

    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Error changing appointment status', error: error.message });
  }
};

// @desc    Leave a review for a completed appointment
// @route   POST /api/clinics/reviews
// @access  Private
exports.createClinicReview = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { clinicId, appointmentId, rating, comment } = req.body;

    if (!requesterId || !clinicId || !appointmentId || !rating) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const { rows: appts } = await pool.query(`
      SELECT id FROM clinic_appointments 
      WHERE id = $1 AND "userId" = $2 AND status = 'Completed'
    `, [appointmentId, requesterId]);

    if (appts.length === 0) {
      return res.status(400).json({ message: 'Reviews can only be created for completed appointments' });
    }

    const { rows: review } = await pool.query(`
      INSERT INTO clinic_reviews ("clinicId", "appointmentId", "userId", rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [clinicId, appointmentId, requesterId, parseInt(rating), comment || '']);

    await pool.query(`
      UPDATE clinics
      SET rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM clinic_reviews WHERE "clinicId" = $1),
          "reviewCount" = (SELECT COUNT(*) FROM clinic_reviews WHERE "clinicId" = $1)
      WHERE id = $1;
    `, [clinicId]);

    res.status(201).json(review[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating clinic review', error: error.message });
  }
};

// @desc    Toggle wishlist save clinic
// @route   POST /api/clinics/wishlist
// @access  Private
exports.toggleClinicWishlist = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { googlePlaceId } = req.body; // Expects Google Place ID for external discoverability

    if (!requesterId || !googlePlaceId) {
      return res.status(400).json({ message: 'Missing user or clinic identifiers' });
    }

    // Verify if clinic is registered in table; if not, create a skeleton clinic record in table to bind saves
    const { rows: localClinics } = await pool.query('SELECT id FROM clinics WHERE "googlePlaceId" = $1', [googlePlaceId]);
    let targetClinicId = null;

    if (localClinics.length > 0) {
      targetClinicId = localClinics[0].id;
    } else {
      // Create a skeleton clinic record
      const { rows: newClinic } = await pool.query(`
        INSERT INTO clinics (name, "googlePlaceId", status)
        VALUES ($1, $2, 'Active')
        RETURNING id;
      `, [`GooglePlace_${googlePlaceId}`, googlePlaceId]);
      targetClinicId = newClinic[0].id;
    }

    const { rows: exists } = await pool.query('SELECT id FROM clinic_wishlist WHERE "userId" = $1 AND "clinicId" = $2', [requesterId, targetClinicId]);

    if (exists.length > 0) {
      await pool.query('DELETE FROM clinic_wishlist WHERE id = $1', [exists[0].id]);
      return res.status(200).json({ wishlisted: false, message: 'Removed clinic from wishlist' });
    } else {
      await pool.query('INSERT INTO clinic_wishlist ("userId", "clinicId") VALUES ($1, $2)', [requesterId, targetClinicId]);
      return res.status(200).json({ wishlisted: true, message: 'Clinic saved to wishlist' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error toggling clinic wishlist', error: error.message });
  }
};

// @desc    Get saved clinics wishlist
// @route   GET /api/clinics/wishlist
// @access  Private
exports.getClinicWishlist = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    if (!requesterId) {
      return res.status(400).json({ message: 'Missing x-requester-id header' });
    }

    const { rows: clinics } = await pool.query(`
      SELECT c.*
      FROM clinic_wishlist w
      JOIN clinics c ON w."clinicId" = c.id
      WHERE w."userId" = $1 AND c.status = 'Active'
    `, [requesterId]);

    // Map local clinics to clean response matching search discovery properties
    const mapped = clinics.map(c => ({
      googlePlaceId: c.googlePlaceId,
      name: c.name.startsWith('GooglePlace_') ? 'Saved Clinic' : c.name,
      formattedAddress: c.address || 'Saved Clinic Profile',
      latitude: c.latitude,
      longitude: c.longitude,
      rating: c.rating,
      reviewCount: c.reviewCount,
      phone: c.phone,
      website: c.email,
      photo: c.logo || 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=320',
      connected: !c.name.startsWith('GooglePlace_'),
      clinicId: c.name.startsWith('GooglePlace_') ? null : c.id
    }));

    res.status(200).json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving saved clinics', error: error.message });
  }
};

// @desc    Get user notifications
// @route   GET /api/clinics/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    if (!requesterId) {
      return res.status(400).json({ message: 'Missing header parameters' });
    }

    const { rows: notifications } = await pool.query(`
      SELECT * FROM notifications
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
      LIMIT 30;
    `, [requesterId]);

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error loading notifications', error: error.message });
  }
};

// @desc    Get appointment chat messages
// @route   GET /api/clinics/messages/:appointmentId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rows: messages } = await pool.query(`
      SELECT * FROM clinic_messages
      WHERE "appointmentId" = $1
      ORDER BY "createdAt" ASC
    `, [appointmentId]);

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error loading chat messages', error: error.message });
  }
};

// @desc    Send chat message regarding appointment
// @route   POST /api/clinics/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const requesterId = req.headers['x-requester-id'];
    const { appointmentId, receiverId, message } = req.body;

    if (!requesterId || !appointmentId || !receiverId || !message) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const { rows: msg } = await pool.query(`
      INSERT INTO clinic_messages ("appointmentId", "senderId", "receiverId", message)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [appointmentId, requesterId, receiverId, message]);

    res.status(201).json(msg[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error dispatching message', error: error.message });
  }
};
