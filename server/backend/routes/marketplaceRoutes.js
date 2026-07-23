const express = require('express');
const router = express.Router();
const {
  getMarketplacePets,
  getSimilarPets,
  reportListing
} = require('../controllers/marketplaceController');

router.get('/', getMarketplacePets);
router.get('/similar/:petId', getSimilarPets);
router.post('/report', reportListing);

module.exports = router;
