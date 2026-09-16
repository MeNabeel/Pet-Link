const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  markAllRead,
  dismissNotification
} = require('../controllers/supabase/notificationController');

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markNotificationRead);
router.delete('/:id', dismissNotification);

module.exports = router;
