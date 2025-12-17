const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Please provide an image'],
    trim: true
  },
  dateRange: {
    start: {
      type: Date,
      required: [true, 'Please provide a start date']
    },
    end: {
      type: Date,
      required: [true, 'Please provide an end date'],
      validate: {
        validator: function(value) {
          return value > this.dateRange.start;
        },
        message: 'End date must be after start date'
      }
    }
  },
  note: {
    type: String,
    required: [true, 'Please provide a note'],
    trim: true,
    maxlength: [1000, 'Note cannot be more than 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
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

// Update the updatedAt field before saving
itemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Populate user information when querying
itemSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'createdBy',
    select: 'name email role'
  }).populate({
    path: 'updatedBy',
    select: 'name email role'
  });
  next();
});

// Static method to get items with pagination
itemSchema.statics.getItemsWithPagination = function(page = 1, limit = 10, filter = {}) {
  const skip = (page - 1) * limit;
  return this.find({ ...filter, isActive: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get items count
itemSchema.statics.getItemsCount = function(filter = {}) {
  return this.countDocuments({ ...filter, isActive: true });
};

// Instance method to check if user can edit this item
itemSchema.methods.canEdit = function(user) {
  // Super admin and admin can edit any item
  if (['super_admin', 'admin'].includes(user.role)) {
    return true;
  }
  // Regular users cannot edit items
  return false;
};

// Instance method to check if user can delete this item
itemSchema.methods.canDelete = function(user) {
  // Super admin and admin can delete any item
  if (['super_admin', 'admin'].includes(user.role)) {
    return true;
  }
  // Regular users cannot delete items
  return false;
};

// Virtual for duration in days
itemSchema.virtual('durationDays').get(function() {
  const diffTime = Math.abs(this.dateRange.end - this.dateRange.start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual to check if the item is expired
itemSchema.virtual('isExpired').get(function() {
  const now = new Date();
  return this.dateRange.end < now;
});

// Ensure virtual fields are serialized
itemSchema.set('toJSON', { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Item', itemSchema);