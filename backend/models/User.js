const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to get users by role
userSchema.statics.getUsersByRole = function(role) {
  return this.find({ role, isActive: true }).select('-password');
};

// Instance method to check if user has permission
userSchema.methods.hasPermission = function(requiredRoles) {
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(this.role);
  }
  return this.role === requiredRoles;
};

// Instance method to check if user can manage other users
userSchema.methods.canManageUsers = function() {
  return this.role === 'super_admin';
};

// Instance method to check if user can perform CRUD operations
userSchema.methods.canPerformCRUD = function() {
  return ['admin', 'super_admin'].includes(this.role);
};

// Instance method to check if user can only read
userSchema.methods.isReadOnly = function() {
  return this.role === 'user';
};

module.exports = mongoose.model('User', userSchema);