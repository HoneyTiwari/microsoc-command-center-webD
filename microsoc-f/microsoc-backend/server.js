const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// =====================
// Create app
// =====================
const app = express();

// =====================
// CORS (🔥 MUST BE FIRST)
// =====================
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  process.env.FRONTEND_URL || 'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow Postman / curl (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🔥 Handle preflight requests
app.options('*', cors());

// =====================
// Security & Utils
// =====================
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// Database Connection
// =====================
const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/microsoc'
    );

    console.log('✅ MongoDB connected successfully');

    const User = require('./models/User');
    await User.createDemoUsers();

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

// =====================
// Routes
// =====================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/incidents', require('./routes/incidentRoutes'));

// Temporary analytics API
app.get('/api/analytics', (req, res) => {
  console.log('🔥 Analytics API HIT');
  res.json({
    attackDistribution: [12, 8, 5, 6],
    timeline: Array.from({ length: 10 }, () =>
      Math.floor(Math.random() * 20)
    )
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MicroSOC Backend is running',
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Demo credentials
app.get('/api/demo-credentials', (req, res) => {
  res.json({
    admin: {
      email: 'admin@morphingrid.com',
      password: 'password123'
    },
    analyst: {
      email: 'analyst@morphingrid.com',
      password: 'password123'
    }
  });
});

// =====================
// 404 Handler
// =====================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// =====================
// Start Server
// =====================
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log('=================================');
    console.log('🚀 MicroSOC Backend Server');
    console.log('=================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log('🌍 Environment: development');
    console.log(`🗄️  Database: mongodb://localhost:27017/microsoc`);
    console.log('=================================');
  });
};

startServer();
