const dbType = process.env.DB_TYPE || 'supabase';
module.exports = dbType === 'mongodb'
  ? require('./mongodb/categoryController')
  : require('./supabase/categoryController');
