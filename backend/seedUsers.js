const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing users (optional - remove this if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    // Remove existing super admin accounts
    await User.deleteMany({ role: 'super_admin' });
    console.log('Removed existing super admin accounts');

    // Create super admin user only
    const testUsers = [
      {
        name: 'Super Administrator',
        email: 'superadmin@gmail.com',
        password: 'Super123',
        role: 'super_admin',
        isActive: true
      }
    ];

    // Create users
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create user (password will be hashed by the pre-save hook)
      const user = new User(userData);
      await user.save();
      
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📋 Super Admin Account:');
    console.log('┌─────────────────┬─────────────────────┬─────────────────┐');
    console.log('│ Role            │ Email               │ Password        │');
    console.log('├─────────────────┼─────────────────────┼─────────────────┤');
    console.log('│ Super Admin     │ superadmin@gmail.com│ Super123        │');
    console.log('└─────────────────┴─────────────────────┴─────────────────┘');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeder
seedUsers();