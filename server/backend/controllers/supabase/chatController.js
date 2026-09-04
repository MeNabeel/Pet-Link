const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Resilient PostgreSQL pool initialization
let pool;
try {
  const initModule = require('../../database/supabase/init');
  pool = initModule.pool;
} catch (e) {
  // Fallback pool instantiation
}

if (!pool) {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  pool = new Pool({ connectionString });
}

// Ensure chat database tables exist on query
const ensureTablesExist = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pet_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "senderId" VARCHAR(255) NOT NULL,
        "receiverId" VARCHAR(255) NOT NULL,
        "petId" VARCHAR(255) NOT NULL,
        "lastMessage" TEXT DEFAULT '',
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pet_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "conversationId" UUID NOT NULL REFERENCES pet_conversations(id) ON DELETE CASCADE,
        "senderId" VARCHAR(255) NOT NULL,
        "text" TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error('ensureTablesExist error:', err.message);
  }
};

// @desc    Get or create conversation between user, owner, and pet
// @route   POST /api/chat/conversation
// @access  Public
exports.getOrCreateConversation = async (req, res) => {
  try {
    await ensureTablesExist();

    const senderId = String(req.body.senderId || '').trim();
    const receiverId = String(req.body.receiverId || '').trim();
    const petId = String(req.body.petId || '').trim();

    if (!senderId || !receiverId || !petId) {
      return res.status(400).json({ success: false, message: 'Please provide senderId, receiverId, and petId.' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ success: false, message: 'Pet owners cannot message themselves.' });
    }

    // Check if conversation already exists (either senderId -> receiverId or receiverId -> senderId)
    const existing = await pool.query(
      `SELECT * FROM pet_conversations 
       WHERE "petId" = $1 
         AND (("senderId" = $2 AND "receiverId" = $3) OR ("senderId" = $3 AND "receiverId" = $2))
       LIMIT 1`,
      [petId, senderId, receiverId]
    );

    if (existing.rows && existing.rows.length > 0) {
      const conv = existing.rows[0];
      return res.status(200).json({ 
        success: true, 
        conversation: conv,
        conversationId: conv.id,
        petId: conv.petId,
        ownerId: receiverId
      });
    }

    // Create new conversation
    const newConv = await pool.query(
      `INSERT INTO pet_conversations ("senderId", "receiverId", "petId") 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [senderId, receiverId, petId]
    );

    const createdConv = newConv.rows[0];

    return res.status(201).json({ 
      success: true, 
      conversation: createdConv,
      conversationId: createdConv.id,
      petId: createdConv.petId,
      ownerId: receiverId
    });
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
    await ensureTablesExist();
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
    await ensureTablesExist();
    const conversationId = String(req.body.conversationId || '').trim();
    const senderId = String(req.body.senderId || '').trim();
    const text = String(req.body.text || '').trim();

    if (!conversationId || !senderId || !text) {
      return res.status(400).json({ success: false, message: 'Missing conversationId, senderId, or text' });
    }

    // Insert message
    const msgResult = await pool.query(
      `INSERT INTO pet_messages ("conversationId", "senderId", text) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [conversationId, senderId, text]
    );

    // Update conversation lastMessage & updatedAt
    await pool.query(
      `UPDATE pet_conversations 
       SET "lastMessage" = $1, "updatedAt" = NOW() 
       WHERE id = $2`,
      [text, conversationId]
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
    await ensureTablesExist();
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT * FROM pet_conversations 
       WHERE "senderId" = $1 OR "receiverId" = $1 
       ORDER BY "updatedAt" DESC`,
      [String(userId)]
    );

    const conversations = await Promise.all(
      result.rows.map(async (conv) => {
        const otherUserId = conv.senderId === String(userId) ? conv.receiverId : conv.senderId;
        
        let otherUser = null;
        try {
          const userRes = await pool.query(
            `SELECT id, name, email, phone, "profilePic", city, province FROM users WHERE id = $1 LIMIT 1`,
            [otherUserId]
          );
          if (userRes.rows.length > 0) {
            const u = userRes.rows[0];
            otherUser = { ...u, _id: u.id };
          }
        } catch (e) {}

        let pet = null;
        try {
          const petRes = await pool.query(
            `SELECT id, name, species, breed, age, image, "imageSettings", "activeStatus", price, city, province FROM pets WHERE id = $1 LIMIT 1`,
            [conv.petId]
          );
          if (petRes.rows.length > 0) {
            const p = petRes.rows[0];
            pet = { ...p, _id: p.id };
          }
        } catch (e) {}

        return {
          ...conv,
          otherUser,
          pet
        };
      })
    );

    return res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error('getUserConversations error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching user conversations', error: error.message });
  }
};
