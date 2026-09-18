const mongoose = require('mongoose');

const connectDB = (url) => {
  // Explicitly configure strictQuery behavior
  mongoose.set('strictQuery', true);

  // Optional: Connection state monitoring
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB connection lost.');
  });

  return mongoose.connect(url);
};

module.exports = connectDB;
