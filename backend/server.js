const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (with JSON fallback logic)
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/learning', require('./routes/learningRoutes'));

// Health / Status Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    databaseMode: require('./config/db').getUseJsonDb() ? 'Local JSON Files' : 'MongoDB Atlas/Local'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Smart Interview Platform API running on port ${PORT}`);
});
