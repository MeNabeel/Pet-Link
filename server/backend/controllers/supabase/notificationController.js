const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

let pool;
try {
  const initModule = require('../../database/supabase/init');
  pool = initModule.pool;
} catch (e) {
  // Fallback
}

if (!pool) {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const isSupabaseOrProd = process.env.NODE_ENV === 'production' || (connectionString && (connectionString.includes('supabase') || connectionString.includes('pooler.supabase.com')));
  pool = new Pool({
    connectionString,
    ssl: isSupabaseOrProd ? { rejectUnauthorized: false } : false
  });
}

const extractUserId = (req) => {
  return req.headers['x-requester-id'] || req.headers['x-user-id'] || req.user?.id || req.user?._id;
};

// Helper function to create notification programmatically
const createNotificationInternal = async (userId, title, message, type = 'General') => {
  if (!userId || !title) return null;
  try {
    const { rows } = await pool.query(`
      INSERT INTO notifications ("userId", title, message, type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [userId, title, message, type]);
    return rows[0] || null;
  } catch (err) {
    console.error('Error creating notification internal:', err.message);
    return null;
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Missing user identification' });
    }

    const { rows } = await pool.query(`
      SELECT * FROM notifications 
      WHERE "userId" = $1 
      ORDER BY "createdAt" DESC 
      LIMIT 50
    `, [userId]);

    return res.status(200).json({ success: true, notifications: rows || [] });
  } catch (err) {
    console.error('Error retrieving notifications:', err);
    return res.status(500).json({ message: 'Error retrieving notifications', error: err.message });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res) => {
  try {
    const userId = extractUserId(req);
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await pool.query(`
      UPDATE notifications 
      SET "isRead" = true 
      WHERE id = $1 AND "userId" = $2
    `, [id, userId]);

    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating notification', error: err.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await pool.query(`
      UPDATE notifications 
      SET "isRead" = true 
      WHERE "userId" = $1
    `, [userId]);

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    return res.status(500).json({ message: 'Error marking all notifications read', error: err.message });
  }
};

// @desc    Dismiss / Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const dismissNotification = async (req, res) => {
  try {
    const userId = extractUserId(req);
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await pool.query(`
      DELETE FROM notifications 
      WHERE id = $1 AND "userId" = $2
    `, [id, userId]);

    return res.status(200).json({ success: true, message: 'Notification dismissed' });
  } catch (err) {
    return res.status(500).json({ message: 'Error dismissing notification', error: err.message });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllRead,
  dismissNotification,
  createNotificationInternal
};
