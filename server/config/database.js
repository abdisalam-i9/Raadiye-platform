import mongoose from 'mongoose';
import env from './env.js';

export async function connectDatabase() {
  const uri = env.DATABASE.URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB Database');
}

export default connectDatabase;
