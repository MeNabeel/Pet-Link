const express = require('express');
const router = express.Router();
const { 
  registerUser, loginUser, forgotPassword, resetPassword, 
  updateUserProfile, getUserProfile, getAllUsers, updateUserStatus, deleteUser,
  getSystemAnalytics, updateUserRole
} = require('../controllers/authController');

// Map routing endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', updateUserProfile);
router.get('/profile/:userId', getUserProfile);

// Admin User Management routes
router.get('/users', getAllUsers);
router.put('/users/:userId/status', updateUserStatus);
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// Admin Analytics routes
router.get('/analytics', getSystemAnalytics);

module.exports = router;
