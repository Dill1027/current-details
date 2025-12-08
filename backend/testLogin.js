const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'superadmin@gmail.com';
    const password = 'Super123';

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.email);
    console.log('User role:', user.role);
    console.log('User active:', user.isActive);
    console.log('Password hash length:', user.password?.length);

    // Test password
    const isPasswordCorrect = await user.correctPassword(password);
    console.log('Password test result:', isPasswordCorrect);

    if (isPasswordCorrect) {
      console.log('🎉 Login would succeed!');
    } else {
      console.log('❌ Login would fail - password mismatch');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

testLogin();