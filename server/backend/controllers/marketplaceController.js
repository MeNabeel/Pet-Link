const dbType = process.env.DB_TYPE || 'supabase';
module.exports = dbType === 'mongodb'
  ? require('./mongodb/marketplaceController')
  : require('./supabase/marketplaceController');
