const { pool } = require('../../database/supabase/init');

// @desc    Get or create conversation between user, owner, and pet
// @route   POST /api/chat/conversation
// @access  Public
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { senderId, receiverId, petId } = req.body;
    if (!senderId || !receiverId || !petId) {
      return res.status(400).json({ success: false, message: 'Please provide senderId, receiverId, and petId.' });
    }

    // Check if conversation already exists (either senderId -> receiverId or receiverId -> senderId)
    const existing = await pool.query(
      `SELECT * FROM pet_conversations 
       WHERE "petId" = $1 
         AND (("senderId" = $2 AND "receiverId" = $3) OR ("senderId" = $3 AND "receiverId" = $2))
       LIMIT 1`,
      [petId, senderId, receiverId]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({ success: true, conversation: existing.rows[0] });
    }

    // Create new conversation
    const newConv = await pool.query(
      `INSERT INTO pet_conversations ("senderId", "receiverId", "petId") 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [senderId, receiverId, petId]
    );

    return res.status(201).json({ success: true, conversation: newConv.rows[0] });
  } catch (error) {
    console.error('getOrCreateConversation error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving conversation', error: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Public
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const result = await pool.query(
      `SELECT * FROM pet_messages WHERE "conversationId" = $1 ORDER BY "createdAt" ASC`,
      [conversationId]
    );
    return res.status(200).json({ success: true, messages: result.rows });
  } catch (error) {
    console.error('getMessages error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching chat messages', error: error.message });
  }
};

// @desc    Send chat message
// @route   POST /api/chat/message
// @access  Public
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, text } = req.body;
    if (!conversationId || !senderId || !text) {
      return res.status(400).json({ success: false, message: 'Missing conversationId, senderId, or text' });
    }

    // Insert message
    const msgResult = await pool.query(
      `INSERT INTO pet_messages ("conversationId", "senderId", text) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [conversationId, senderId, text.trim()]
    );

    // Update conversation lastMessage & updatedAt
    await pool.query(
      `UPDATE pet_conversations 
       SET "lastMessage" = $1, "updatedAt" = NOW() 
       WHERE id = $2`,
      [text.trim(), conversationId]
    );

    return res.status(201).json({ success: true, message: msgResult.rows[0] });
  } catch (error) {
    console.error('sendMessage error:', error);
    return res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
};

// @desc    Get user conversations inbox
// @route   GET /api/chat/user/:userId
// @access  Public
exports.getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT * FROM pet_conversations 
       WHERE "senderId" = $1 OR "receiverId" = $1 
       ORDER BY "updatedAt" DESC`,
      [userId]
    );
    return res.status(200).json({ success: true, conversations: result.rows });
  } catch (error) {
    console.error('getUserConversations error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching user conversations', error: error.message });
  }
};
