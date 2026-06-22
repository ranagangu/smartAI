const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  getUserStats 
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Public Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected User routes
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.get('/stats', authMiddleware, getUserStats);

module.exports = router;
