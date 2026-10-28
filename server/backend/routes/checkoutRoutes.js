const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  handleWebhook,
  getOrderStatus
} = require('../controllers/checkoutController');

// Stripe checkout session creation
router.post('/create-session', createCheckoutSession);

// Stripe asynchronous webhook handler
router.post('/webhook', handleWebhook);

// Check order status
router.get('/status/:identifier', getOrderStatus);

module.exports = router;
