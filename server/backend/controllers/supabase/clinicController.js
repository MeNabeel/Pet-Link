const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// Helper to send system notification
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

// @desc    Get clinics sorted by geographical distance
// @route   GET /api/clinics/nearby
// @access  Public
exports.getNearbyClinics = async (req, res) => {
  try {
    const { lat, lng, city, service, providesEmergency, rating, distanceLimit } = req.query;

    let query;
    let params = [];

    if (lat && lng) {
      // With GPS location coordinates
      params = [parseFloat(lat), parseFloat(lng)];
      query = `
        SELECT *, calculate_distance($1, $2, latitude, longitude) AS distance
        FROM clinics
        WHERE status = 'Active'
      `;
    } else {
      // Without GPS coordinates
      query = `
        SELECT *, 0.0 AS distance
        FROM clinics
        WHERE status = 'Active'
      `;
    }

    // Add city filter
    if (city) {
      params.push(city);
      query += ` AND city = $${params.length}`;
    }

    // Add emergency availability filter
    if (providesEmergency === 'true') {
      query += ` AND "providesEmergency" = true`;
    }

    // Add rating filter
    if (rating) {
      params.push(parseFloat(rating));
      query += ` AND rating >= $${params.length}`;
    }

    // Distance sorting
    if (lat && lng) {
      query += ` ORDER BY distance ASC`;
    } else {
      query += ` ORDER BY rating DESC, name ASC`;
    }

    const { rows: clinics } = await pool.query(query, params);

    // Apply distance limit filtering
    let filtered = clinics;
    if (lat && lng && distanceLimit) {
      const limit = parseFloat(distanceLimit);
      filtered = clinics.filter(c => parseFloat(c.distance) <= limit);
    }

    // Apply service filter (as database check or simple mapping)
    if (service) {
      // Filter out clinics that do not offer this service name
      const { rows: serviceClinics } = await pool.query(`
        SELECT DISTINCT "clinicId" FROM clinic_services 
        WHERE name ILIKE $1 AND status = 'Active'
      `, [`%${service}%`]);
      const validClinicIds = serviceClinics.map(s => s.clinicId);
      filtered = filtered.filter(c => validClinicIds.includes(c.id));
    }

    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving nearby clinics', error: error.message });
  }
};

// @desc    Get detailed clinic profile by ID
// @route   GET /api/clinics/:id
// @access  Public
exports.getClinicDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: clinics } = await pool.query('SELECT * FROM clinics WHERE id = $1', [id]);
    if (clinics.length === 0) {
      return res.status(404).json({ message: 'Clinic profile not found' });
    }

    const clinic = clinics[0];

    // Fetch services
    const { rows: services } = await pool.query('SELECT * FROM clinic_services WHERE "clinicId" = $1 AND status = \'Active\'', [id]);

    // Fetch doctors
    const { rows: doctors } = await pool.query('SELECT * FROM clinic_doctors WHERE "clinicId" = $1 AND status = \'Active\'', [id]);

    // Fetch reviews
    const { rows: reviews } = await pool.query(`
      SELECT r.*, u.name as "userName", u."profilePic" as "userAvatar"
      FROM clinic_reviews r
      JOIN users u ON r."userId" = u.id
      WHERE r."clinicId" = $1
      ORDER BY r."createdAt" DESC
    `, [id]);

    res.status(200).json({
      ...clinic,
      services,
      doctors,
      reviews
    });
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

    // Fetch appointment details
    const { rows: appts } = await pool.query('SELECT * FROM clinic_appointments WHERE id = $1', [id]);
    if (appts.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = appts[0];

    // Authorize: users can only cancel their own appointments
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

    // Send status notification
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

    // Verify appointment status is Completed and owned by user
    const { rows: appts } = await pool.query(`
      SELECT id FROM clinic_appointments 
      WHERE id = $1 AND "userId" = $2 AND status = 'Completed'
    `, [appointmentId, requesterId]);

    if (appts.length === 0) {
      return res.status(400).json({ message: 'Reviews can only be created for completed appointments' });
    }

    // Insert review
    const { rows: review } = await pool.query(`
      INSERT INTO clinic_reviews ("clinicId", "appointmentId", "userId", rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [clinicId, appointmentId, requesterId, parseInt(rating), comment || '']);

    // Recompute clinic rating
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
    const { clinicId } = req.body;

    if (!requesterId || !clinicId) {
      return res.status(400).json({ message: 'Missing user or clinic identifiers' });
    }

    const { rows: exists } = await pool.query('SELECT id FROM clinic_wishlist WHERE "userId" = $1 AND "clinicId" = $2', [requesterId, clinicId]);

    if (exists.length > 0) {
      // Remove
      await pool.query('DELETE FROM clinic_wishlist WHERE id = $1', [exists[0].id]);
      return res.status(200).json({ wishlisted: false, message: 'Removed clinic from wishlist' });
    } else {
      // Add
      await pool.query('INSERT INTO clinic_wishlist ("userId", "clinicId") VALUES ($1, $2)', [requesterId, clinicId]);
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
      SELECT c.*, 0.0 AS distance
      FROM clinic_wishlist w
      JOIN clinics c ON w."clinicId" = c.id
      WHERE w."userId" = $1 AND c.status = 'Active'
    `, [requesterId]);

    res.status(200).json(clinics);
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
