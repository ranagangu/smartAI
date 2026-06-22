const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let useJsonDb = false;

const connectDB = async () => {
  let mongoURI = process.env.MONGODB_URI;
  if (mongoURI) {
    mongoURI = mongoURI.replace(/^['"]|['"]$/g, '');
  }
  if (!mongoURI) {
    console.log('⚠️ No MONGODB_URI environment variable detected. Running in local JSON Database mode.');
    useJsonDb = true;
    return;
  }

  try {
    // Attempt Mongoose connection with a short timeout to prevent hanging if MongoDB is not active
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    console.log('⚠️ Falling back to local JSON Database mode.');
    useJsonDb = true;
  }
};

const getUseJsonDb = () => useJsonDb;
const setUseJsonDb = (val) => { useJsonDb = val; };

module.exports = {
  connectDB,
  getUseJsonDb,
  setUseJsonDb
};
