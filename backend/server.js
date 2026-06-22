const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getUseJsonDb } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Smart Interview Platform API is running',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      interviews: '/api/interviews',
      learning: '/api/learning'
    }
  });
});

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/learning', require('./routes/learningRoutes'));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    databaseMode: getUseJsonDb()
      ? 'Local JSON Files'
      : 'MongoDB Atlas/Local'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Smart Interview Platform API running on port ${PORT}`);
});