import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/food-expiry-tracker';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB connected successfully!');
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  App will continue without database (data won\'t persist)');
  }
};
