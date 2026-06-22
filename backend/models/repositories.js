const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dbConfig = require('../config/db');

// --- 1. Mongoose Schema Definitions ---

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String, default: '' },
  targetRole: { type: String, default: 'Full Stack Engineer' },
  experienceLevel: { type: String, default: 'Mid Level' },
  resumeText: { type: String, default: '' },
  openrouterKey: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const InterviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  track: { type: String, required: true }, // e.g., Frontend, Backend, System Design, Behavioral
  difficulty: { type: String, required: true }, // Junior, Mid, Senior
  status: { type: String, default: 'active' }, // active, completed
  questions: [{
    questionText: String,
    answerText: String,
    feedback: {
      score: Number,
      strengths: [String],
      weaknesses: [String],
      suggestions: [String],
      sampleAnswer: String
    }
  }],
  overallFeedback: {
    score: Number,
    summary: String,
    technicalSkills: Number,
    communication: Number,
    knowledge: Number,
    confidence: Number
  },
  createdAt: { type: Date, default: Date.now }
});

const LearningPathSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { type: String, required: true },
  modules: [{
    id: String,
    title: String,
    description: String,
    status: { type: String, default: 'pending' }, // pending, completed
    resources: [String],
    exercises: [String]
  }],
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', UserSchema);
const MongoInterview = mongoose.model('Interview', InterviewSchema);
const MongoLearningPath = mongoose.model('LearningPath', LearningPathSchema);

// --- 2. JSON Fallback Database Implementation ---

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class JsonRepository {
  constructor(filename) {
    this.filePath = path.join(dataDir, filename);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  read() {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (err) {
      console.error(`Error reading ${this.filePath}:`, err);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(`Error writing to ${this.filePath}:`, err);
    }
  }

  async find(query = {}) {
    const list = this.read();
    if (Object.keys(query).length === 0) return list;
    return list.filter(item => {
      for (let key in query) {
        if (String(item[key]) !== String(query[key])) return false;
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const list = this.read();
    return list.find(item => {
      for (let key in query) {
        if (String(item[key]) !== String(query[key])) return false;
      }
      return true;
    });
  }

  async findById(id) {
    const list = this.read();
    return list.find(item => String(item._id) === String(id) || String(item.id) === String(id));
  }

  async create(data) {
    const list = this.read();
    if (data.email) {
      const exists = list.find(item => item.email && item.email.toLowerCase() === data.email.toLowerCase());
      if (exists) {
        throw new Error('Email already registered.');
      }
    }
    const newItem = {
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    list.push(newItem);
    this.write(list);
    return newItem;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const list = this.read();
    const idx = list.findIndex(item => String(item._id) === String(id) || String(item.id) === String(id));
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.write(list);
    return list[idx];
  }

  async findByIdAndDelete(id) {
    const list = this.read();
    const idx = list.findIndex(item => String(item._id) === String(id) || String(item.id) === String(id));
    if (idx === -1) return null;
    const deleted = list.splice(idx, 1)[0];
    this.write(list);
    return deleted;
  }
}

const JsonUserDb = new JsonRepository('users.json');
const JsonInterviewDb = new JsonRepository('interviews.json');
const JsonLearningPathDb = new JsonRepository('learning_paths.json');

// --- 3. Unified Repository Interface Wrapper ---

const UserRepository = {
  find: async (query) => {
    return dbConfig.getUseJsonDb() ? JsonUserDb.find(query) : MongoUser.find(query);
  },
  findOne: async (query) => {
    return dbConfig.getUseJsonDb() ? JsonUserDb.findOne(query) : MongoUser.findOne(query);
  },
  findById: async (id) => {
    return dbConfig.getUseJsonDb() ? JsonUserDb.findById(id) : MongoUser.findById(id);
  },
  create: async (data) => {
    return dbConfig.getUseJsonDb() ? JsonUserDb.create(data) : MongoUser.create(data);
  },
  findByIdAndUpdate: async (id, updateData) => {
    if (dbConfig.getUseJsonDb()) {
      return JsonUserDb.findByIdAndUpdate(id, updateData);
    }
    return MongoUser.findByIdAndUpdate(id, updateData, { new: true });
  }
};

const InterviewRepository = {
  find: async (query) => {
    return dbConfig.getUseJsonDb() ? JsonInterviewDb.find(query) : MongoInterview.find(query);
  },
  findById: async (id) => {
    return dbConfig.getUseJsonDb() ? JsonInterviewDb.findById(id) : MongoInterview.findById(id);
  },
  create: async (data) => {
    return dbConfig.getUseJsonDb() ? JsonInterviewDb.create(data) : MongoInterview.create(data);
  },
  findByIdAndUpdate: async (id, updateData) => {
    if (dbConfig.getUseJsonDb()) {
      return JsonInterviewDb.findByIdAndUpdate(id, updateData);
    }
    return MongoInterview.findByIdAndUpdate(id, updateData, { new: true });
  },
  findByIdAndDelete: async (id) => {
    if (dbConfig.getUseJsonDb()) {
      return JsonInterviewDb.findByIdAndDelete(id);
    }
    return MongoInterview.findByIdAndDelete(id);
  }
};

const LearningPathRepository = {
  findOne: async (query) => {
    return dbConfig.getUseJsonDb() ? JsonLearningPathDb.findOne(query) : MongoLearningPath.findOne(query);
  },
  create: async (data) => {
    return dbConfig.getUseJsonDb() ? JsonLearningPathDb.create(data) : MongoLearningPath.create(data);
  },
  findByIdAndUpdate: async (id, updateData) => {
    if (dbConfig.getUseJsonDb()) {
      return JsonLearningPathDb.findByIdAndUpdate(id, updateData);
    }
    return MongoLearningPath.findByIdAndUpdate(id, updateData, { new: true });
  }
};

module.exports = {
  UserRepository,
  InterviewRepository,
  LearningPathRepository
};
