const express = require('express');
const router = express.Router();
const {
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getUserConversations
} = require('../controllers/chatController');

router.post('/conversation', getOrCreateConversation);
router.get('/messages/:conversationId', getMessages);
router.post('/message', sendMessage);
router.get('/user/:userId', getUserConversations);

module.exports = router;
