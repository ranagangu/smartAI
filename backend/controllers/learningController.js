const { LearningPathRepository, UserRepository } = require('../models/repositories');
const AIService = require('../services/aiService');


const getLearningPath = async (req, res) => {
  try {
    const user = req.user;
    let pathRecord = await LearningPathRepository.findOne({ userId: user._id });
    
    // If none exists, create a default one based on user profile
    if (!pathRecord) {
      console.log(`🤖 LearningController: Creating initial roadmap for ${user.targetRole}`);
      const generated = await AIService.generateRoadmap(
        user.targetRole,
        user.experienceLevel,
        user.openrouterKey
      );

      pathRecord = await LearningPathRepository.create({
        userId: user._id,
        role: generated.role,
        modules: generated.modules.map(mod => ({
          ...mod,
          status: 'pending'
        }))
      });
    }

    res.json(pathRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const generateNewPath = async (req, res) => {
  try {
    const user = req.user;
    const { targetRole, experienceLevel } = req.body;

    if (!targetRole || !experienceLevel) {
      return res.status(400).json({ error: 'targetRole and experienceLevel are required.' });
    }

    // Call AI to generate a roadmap
    const generated = await AIService.generateRoadmap(
      targetRole,
      experienceLevel,
      user.openrouterKey
    );

    // See if user already has a learning path
    let pathRecord = await LearningPathRepository.findOne({ userId: user._id });

    if (pathRecord) {
      // Update existing path record
      pathRecord = await LearningPathRepository.findByIdAndUpdate(pathRecord._id, {
        role: generated.role,
        modules: generated.modules.map(mod => ({
          ...mod,
          status: 'pending'
        }))
      });
    } else {
      // Create new
      pathRecord = await LearningPathRepository.create({
        userId: user._id,
        role: generated.role,
        modules: generated.modules.map(mod => ({
          ...mod,
          status: 'pending'
        }))
      });
    }

    res.json(pathRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleModuleStatus = async (req, res) => {
  try {
    const user = req.user;
    const { moduleId } = req.params;
    const { status } = req.body; // should be 'completed' or 'pending'

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const pathRecord = await LearningPathRepository.findOne({ userId: user._id });
    if (!pathRecord) {
      return res.status(404).json({ error: 'Learning roadmap not found.' });
    }

    const modules = [...pathRecord.modules];
    const modIdx = modules.findIndex(m => m.id === moduleId);

    if (modIdx === -1) {
      return res.status(404).json({ error: 'Module not found in this learning path.' });
    }

    modules[modIdx] = {
      ...modules[modIdx],
      status
    };

    const updated = await LearningPathRepository.findByIdAndUpdate(pathRecord._id, { modules });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getLearningPath,
  generateNewPath,
  toggleModuleStatus
};
