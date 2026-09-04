const dbType = process.env.DB_TYPE || 'supabase';
module.exports = require('./supabase/chatController');
