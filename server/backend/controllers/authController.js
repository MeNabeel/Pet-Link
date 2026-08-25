const dbType = process.env.DB_TYPE || 'supabase';
module.exports = dbType === 'mongodb'
  ? require('./mongodb/authController')
  : require('./supabase/authController');
