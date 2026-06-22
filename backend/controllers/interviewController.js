const { InterviewRepository, UserRepository } = require('../models/repositories');
const AIService = require('../services/aiService');


const startInterview = async (req, res) => {
  try {
    const user = req.user;
    const { track, difficulty } = req.body;

    if (!track || !difficulty) {
      return res.status(400).json({ error: 'Track and difficulty are required.' });
    }

    // Generate questions using AI (or fallback)
    const questionsList = await AIService.generateQuestions(
      track, 
      difficulty, 
      user.resumeText, 
      user.openrouterKey
    );

    const questionsData = questionsList.map(qText => ({
      questionText: qText,
      answerText: '',
      feedback: null
    }));

    const newInterview = await InterviewRepository.create({
      userId: user._id,
      track,
      difficulty,
      status: 'active',
      questions: questionsData,
      overallFeedback: null
    });

    res.status(201).json(newInterview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIndex, answerText } = req.body;

    if (questionIndex === undefined || answerText === undefined) {
      return res.status(400).json({ error: 'questionIndex and answerText are required.' });
    }

    const interview = await InterviewRepository.findById(id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    if (questionIndex < 0 || questionIndex >= interview.questions.length) {
      return res.status(400).json({ error: 'Invalid question index.' });
    }

    const user = await UserRepository.findById(interview.userId);
    const questionText = interview.questions[questionIndex].questionText;

    // Get feedback for this specific answer
    const feedback = await AIService.analyzeAnswer(
      questionText,
      answerText,
      interview.track,
      interview.difficulty,
      user?.openrouterKey
    );

    // Update the question response and feedback
    const questions = [...interview.questions];
    questions[questionIndex] = {
      ...questions[questionIndex],
      answerText,
      feedback
    };

    const updated = await InterviewRepository.findByIdAndUpdate(id, { questions });

    res.json({
      questionIndex,
      answerText,
      feedback,
      interviewId: updated._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const completeInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await InterviewRepository.findById(id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    const user = await UserRepository.findById(interview.userId);

    // Filter to questions that have been answered
    const answeredQuestions = interview.questions.filter(q => q.answerText);
    
    // Generate overall performance rating
    const overallFeedback = await AIService.generateOverallFeedback(
      answeredQuestions,
      interview.track,
      interview.difficulty,
      user?.openrouterKey
    );

    const updated = await InterviewRepository.findByIdAndUpdate(id, {
      status: 'completed',
      overallFeedback
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInterviews = async (req, res) => {
  try {
    const user = req.user;
    const interviews = await InterviewRepository.find({ userId: user._id });
    // Sort by newest first
    const sorted = [...interviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await InterviewRepository.findById(id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await InterviewRepository.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Interview not found.' });
    }
    res.json({ message: 'Interview deleted successfully.', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviews,
  getInterviewById,
  deleteInterview
};
