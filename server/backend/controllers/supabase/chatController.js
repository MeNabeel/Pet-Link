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

// Ensure chat database tables exist and deduplicate duplicate conversations
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

    // Clean up any existing duplicate conversations in pet_conversations
    try {
      const dupCheck = await pool.query(`
        SELECT "petId", LEAST("senderId", "receiverId") AS p1, GREATEST("senderId", "receiverId") AS p2, COUNT(*) 
        FROM pet_conversations 
        GROUP BY "petId", p1, p2 
        HAVING COUNT(*) > 1
      `);

      if (dupCheck.rows && dupCheck.rows.length > 0) {
        for (const dup of dupCheck.rows) {
          const petId = dup.petId || dup.petid;
          const p1 = dup.p1;
          const p2 = dup.p2;

          const convs = await pool.query(`
            SELECT id FROM pet_conversations 
            WHERE "petId" = $1 
              AND LEAST("senderId", "receiverId") = $2 
              AND GREATEST("senderId", "receiverId") = $3 
            ORDER BY "updatedAt" DESC
          `, [petId, p1, p2]);

          if (convs.rows && convs.rows.length > 1) {
            const canonicalId = convs.rows[0].id;
            const duplicateIds = convs.rows.slice(1).map(r => r.id);

            // Merge messages to canonical conversation ID
            await pool.query(`
              UPDATE pet_messages 
              SET "conversationId" = $1 
              WHERE "conversationId" = ANY($2::uuid[])
            `, [canonicalId, duplicateIds]);

            // Remove duplicate conversation records
            await pool.query(`
              DELETE FROM pet_conversations 
              WHERE id = ANY($1::uuid[])
            `, [duplicateIds]);
          }
        }
      }

      // Enforce DB-level uniqueness constraint
      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS pet_conversations_unique_pair_idx 
        ON pet_conversations ("petId", LEAST("senderId", "receiverId"), GREATEST("senderId", "receiverId"));
      `);
    } catch (migErr) {
      console.error('Deduplication/Index error:', migErr.message);
    }
  } catch (err) {
    console.error('ensureTablesExist error:', err.message);
  }
};

// @desc    Get or create conversation between user, owner, and pet (Find-or-Create)
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

    // 1. Check if conversation already exists (either senderId -> receiverId or receiverId -> senderId)
    const existing = await pool.query(
      `SELECT * FROM pet_conversations 
       WHERE "petId" = $1 
         AND (("senderId" = $2 AND "receiverId" = $3) OR ("senderId" = $3 AND "receiverId" = $2))
       ORDER BY "updatedAt" DESC 
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

    // 2. Insert new conversation with race condition conflict protection
    try {
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
    } catch (insertErr) {
      // Re-fetch existing if unique index prevented concurrent duplicate insertion
      const reFetch = await pool.query(
        `SELECT * FROM pet_conversations 
         WHERE "petId" = $1 
           AND (("senderId" = $2 AND "receiverId" = $3) OR ("senderId" = $3 AND "receiverId" = $2))
         ORDER BY "updatedAt" DESC 
         LIMIT 1`,
        [petId, senderId, receiverId]
      );

      if (reFetch.rows && reFetch.rows.length > 0) {
        const conv = reFetch.rows[0];
        return res.status(200).json({ 
          success: true, 
          conversation: conv,
          conversationId: conv.id,
          petId: conv.petId,
          ownerId: receiverId
        });
      }
      throw insertErr;
    }
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

// @desc    Get user conversations inbox (Deduplicated)
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

    // Deduplicate in-memory to prevent duplicate cards
    const seenMap = new Map();
    const uniqueRows = [];

    for (const row of result.rows) {
      const partnerId = row.senderId === String(userId) ? row.receiverId : row.senderId;
      const key = `${row.petId}_${partnerId}`;
      if (!seenMap.has(key)) {
        seenMap.set(key, true);
        uniqueRows.push(row);
      }
    }

    const conversations = await Promise.all(
      uniqueRows.map(async (conv) => {
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

// @desc    Delete conversation
// @route   DELETE /api/chat/conversation/:conversationId
// @access  Public
exports.deleteConversation = async (req, res) => {
  try {
    await ensureTablesExist();
    const { conversationId } = req.params;
    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Please provide conversationId' });
    }
    await pool.query(`DELETE FROM pet_conversations WHERE id = $1`, [conversationId]);
    return res.status(200).json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('deleteConversation error:', error);
    return res.status(500).json({ success: false, message: 'Error deleting conversation', error: error.message });
  }
};

