const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserRepository, InterviewRepository } = require('../models/repositories');

const getJwtSecret = () => {
  let secret = process.env.JWT_SECRET || 'smart_interview_jwt_secret';
  return secret.replace(/^['"]|['"]$/g, '');
};
const JWT_SECRET = getJwtSecret();

// Generates JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register Local User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter all registration fields.' });
    }

    const emailLower = email.toLowerCase();
    
    // Check for existing email in repository
    const userExists = await UserRepository.findOne({ email: emailLower });
    if (userExists) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in DB
    const newUser = await UserRepository.create({
      name,
      email: emailLower,
      password: hashedPassword,
      targetRole: 'Full Stack Engineer',
      experienceLevel: 'Mid Level',
      resumeText: '',
      openrouterKey: '',
      avatar: ''
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        targetRole: newUser.targetRole,
        experienceLevel: newUser.experienceLevel,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login Local User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password.' });
    }

    const user = await UserRepository.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid login credentials.' });
    }

    // Compare Hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid login credentials.' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Get profile (Authenticated)
const getUserProfile = async (req, res) => {
  try {
    // req.user is loaded by authMiddleware
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update profile (Authenticated)
const updateUserProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, email, targetRole, experienceLevel, resumeText, openrouterKey } = req.body;

    const updated = await UserRepository.findByIdAndUpdate(user._id, {
      name: name !== undefined ? name : user.name,
      email: email !== undefined ? email.toLowerCase() : user.email,
      targetRole: targetRole !== undefined ? targetRole : user.targetRole,
      experienceLevel: experienceLevel !== undefined ? experienceLevel : user.experienceLevel,
      resumeText: resumeText !== undefined ? resumeText : user.resumeText,
      openrouterKey: openrouterKey !== undefined ? openrouterKey : user.openrouterKey
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get dashboard stats (Authenticated)
const getUserStats = async (req, res) => {
  try {
    const user = req.user;
    const interviews = await InterviewRepository.find({ userId: user._id });

    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const totalInterviews = completedInterviews.length;

    let averageScore = 0;
    let categoryScores = {
      technicalSkills: 0,
      communication: 0,
      knowledge: 0,
      confidence: 0
    };

    if (totalInterviews > 0) {
      const sumScores = completedInterviews.reduce((acc, curr) => acc + (curr.overallFeedback?.score || 0), 0);
      averageScore = Math.round(sumScores / totalInterviews);

      const metrics = ['technicalSkills', 'communication', 'knowledge', 'confidence'];
      metrics.forEach(metric => {
        const sum = completedInterviews.reduce((acc, curr) => acc + (curr.overallFeedback?.[metric] || 0), 0);
        categoryScores[metric] = Math.round(sum / totalInterviews);
      });
    }

    // Historical score trends
    const scoreHistory = completedInterviews
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(i => ({
        date: new Date(i.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: i.overallFeedback?.score || 0,
        track: i.track
      }));

    // Tracks distribution
    const trackCount = {};
    completedInterviews.forEach(i => {
      trackCount[i.track] = (trackCount[i.track] || 0) + 1;
    });

    res.json({
      totalInterviews,
      averageScore,
      categoryScores,
      scoreHistory,
      trackCount,
      user: {
        name: user.name,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserStats
};
