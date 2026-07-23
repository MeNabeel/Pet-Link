const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = async () => {
  try {
    const conn = await require('./config/db')();
  } catch (err) {
    // Already logged in db connection helper
  }
};

// Configure Environment Variables
dotenv.config();

// Connect to MongoDB Database
require('./config/db')();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Main API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/marketplace', require('./routes/marketplaceRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/admin/marketplace', require('./routes/adminMarketplaceRoutes'));

// Server Health Endpoint
app.get('/', (req, res) => {
  res.send('PetLink Layered Authentication Backend Server is running...');
});

// Configure Active Listening Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`PetLink Server running in ${process.env.NODE_ENV || 'development'} mode on port: ${PORT}`);
});
