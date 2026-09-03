const express = require('express');
const router = express.Router();
const {
  getUserAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress
} = require('../controllers/supabase/addressController');

router.get('/', getUserAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.put('/:id/default', setDefaultAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
