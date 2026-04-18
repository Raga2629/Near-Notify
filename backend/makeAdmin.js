import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    let user = await User.findOneAndUpdate(
      { email: 'nasaniragamala@gmail.com' },
      { role: 'admin' },
      { new: true }
    );
    
    if (user) {
      console.log('✅ Successfully upgraded nasaniragamala@gmail.com to Admin!');
    } else {
      console.log('❌ User not found in database. Please register first.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
};

makeAdmin();
