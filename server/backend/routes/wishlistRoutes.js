const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} = require('../controllers/wishlistController');

router.get('/owner/:userId', getWishlist);
router.post('/add', addToWishlist);
router.post('/remove', removeFromWishlist);

module.exports = router;
