const express = require('express');
const router = express.Router();
const {
  checkNameUniqueness,
  getShelterProfile,
  upsertShelterProfile,
  getShelterServices,
  createShelterService,
  updateShelterService,
  deleteShelterService,
  getShelterBookings,
  updateBookingStatus,
  getPublicShelters,
  getPublicShelterDetails,
  createBookingRequest,
  getUserBookings,
  getShelterReviews,
  createReview,
  respondToReview,
  getMessages,
  sendMessage,
  toggleWishlist,
  getWishlist
} = require('../controllers/supabase/shelterController');

// Profile checking and config
router.get('/check-name', checkNameUniqueness);
router.get('/profile', getShelterProfile);
router.post('/profile', upsertShelterProfile);

// Services CRUD
router.get('/services', getShelterServices);
router.post('/services', createShelterService);
router.put('/services/:id', updateShelterService);
router.delete('/services/:id', deleteShelterService);

// Bookings management
router.get('/bookings', getShelterBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// User specific bookings discovery
router.get('/user/bookings', getUserBookings);

// Messages endpoints
router.get('/messages/:bookingId', getMessages);
router.post('/messages', sendMessage);

// Reviews
router.get('/reviews', getShelterReviews);
router.post('/reviews', createReview);
router.post('/reviews/:id/response', respondToReview);

// Wishlists
router.post('/wishlist', toggleWishlist);
router.get('/wishlist', getWishlist);

// Public discovery
router.get('/public/list', getPublicShelters);
router.get('/public/:id', getPublicShelterDetails);
router.post('/public/bookings', createBookingRequest);

module.exports = router;
