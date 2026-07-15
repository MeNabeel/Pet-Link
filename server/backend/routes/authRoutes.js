const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword, updateUserProfile, getUserProfile } = require('../controllers/authController');

// Map routing endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', updateUserProfile);
router.get('/profile/:userId', getUserProfile);

module.exports = router;
