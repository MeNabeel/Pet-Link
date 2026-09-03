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

const rawFrontendUrl = process.env.FRONTEND_URL;
const frontendUrl = rawFrontendUrl && rawFrontendUrl.endsWith('/') ? rawFrontendUrl.slice(0, -1) : rawFrontendUrl;

const allowedOrigins = [
  'http://localhost:5173', // Vite default port
  'http://localhost:3000',
  'https://pet-link-ashen.vercel.app',
  'https://pet-link-git-main-mrnabeel.vercel.app',
  frontendUrl
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
app.use('/api/shelter', require('./routes/shelterRoutes'));
app.use('/api/clinics', require('./routes/clinicRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));

// Server Health Endpoint
app.get('/', (req, res) => {
  res.send('PetLink Layered Authentication Backend Server is running...');
});

const initDB = require('./database/supabase/init');

// Configure Active Listening Port
const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`PetLink Server running in ${process.env.NODE_ENV || 'development'} mode on port: ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database tables:', err.message);
  app.listen(PORT, () => {
    console.log(`PetLink Server running in ${process.env.NODE_ENV || 'development'} mode on port: ${PORT}`);
  });
});
