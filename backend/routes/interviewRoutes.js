const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviews,
  getInterviewById,
  deleteInterview
} = require('../controllers/interviewController');

// Apply auth middleware to protect all routes in this router
router.use(authMiddleware);

router.get('/', getInterviews);
router.post('/', startInterview);
router.get('/:id', getInterviewById);
router.delete('/:id', deleteInterview);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);

module.exports = router;
