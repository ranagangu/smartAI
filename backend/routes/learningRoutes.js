const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getLearningPath,
  generateNewPath,
  toggleModuleStatus
} = require('../controllers/learningController');

// Apply auth middleware to protect all routes in this router
router.use(authMiddleware);

router.get('/', getLearningPath);
router.post('/generate', generateNewPath);
router.put('/module/:moduleId', toggleModuleStatus);

module.exports = router;
