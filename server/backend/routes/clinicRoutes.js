const express = require('express');
const router = express.Router();
const {
  getNearbyClinics,
  getClinicDetails,
  bookAppointment,
  getUserAppointments,
  updateAppointmentStatus,
  createClinicReview,
  toggleClinicWishlist,
  getClinicWishlist,
  getNotifications,
  getMessages,
  sendMessage
} = require('../controllers/supabase/clinicController');

// Nearby and list discovery
router.get('/nearby', getNearbyClinics);
router.get('/notifications', getNotifications);

// Wishlist
router.get('/wishlist', getClinicWishlist);
router.post('/wishlist', toggleClinicWishlist);

// Appointments
router.get('/appointments/user', getUserAppointments);
router.post('/appointments', bookAppointment);
router.put('/appointments/:id/status', updateAppointmentStatus);

// Reviews & Chat Messaging
router.post('/reviews', createClinicReview);
router.get('/messages/:appointmentId', getMessages);
router.post('/messages', sendMessage);

// Details (place at bottom to avoid mapping conflicts)
router.get('/:id', getClinicDetails);

module.exports = router;
