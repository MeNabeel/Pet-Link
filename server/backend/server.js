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

// Express Middlewares
app.use(cors());
app.use(express.json()); // JSON parser for body payload

// Main API Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Server Health Endpoint
app.get('/', (req, res) => {
  res.send('PetLink Layered Authentication Backend Server is running...');
});

// Configure Active Listening Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`PetLink Server running in ${process.env.NODE_ENV || 'development'} mode on port: ${PORT}`);
});
