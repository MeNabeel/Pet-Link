const express = require('express');
const router = express.Router();
const {
  getAdminMarketplacePets,
  updateListingStatus,
  toggleFeatured,
  executeBulkAction,
  getAnalytics,
  resolveReport
} = require('../controllers/adminMarketplaceController');

router.get('/', getAdminMarketplacePets);
router.put('/:petId/status', updateListingStatus);
router.put('/:petId/feature', toggleFeatured);
router.post('/bulk-action', executeBulkAction);
router.get('/analytics', getAnalytics);
router.put('/reports/:reportId/resolve', resolveReport);

module.exports = router;
