import mongoose from 'mongoose';

//  Connect to MongoDB using Mongoose
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DBURL); // Connection string from .env
    console.log('✅ MongoDB Connected');       // Success log
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message); // Handle connection error
    process.exit(1); // Exit process if DB connection fails
  }
};
