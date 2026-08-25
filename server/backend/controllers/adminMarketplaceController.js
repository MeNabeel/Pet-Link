const dbType = process.env.DB_TYPE || 'supabase';
module.exports = dbType === 'mongodb'
  ? require('./mongodb/adminMarketplaceController')
  : require('./supabase/adminMarketplaceController');
