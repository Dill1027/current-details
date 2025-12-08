const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const User = require('../models/User');
const Item = require('../models/Item');
const { protect, canManageUsers, superAdminOnly } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (with pagination and filtering)
// @route   GET /api/users
// @access  Private (super_admin only)
router.get('/', [
  protect,
  superAdminOnly,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(['user', 'admin', 'super_admin'])
    .withMessage('Role must be user, admin, or super_admin'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot be more than 100 characters'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const search = req.query.search || '';
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

    // Build filter
    let filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (super_admin only)
router.get('/:id', [
  protect,
  superAdminOnly,
  param('id').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's item count
    const itemCount = await Item.countDocuments({ 
      createdBy: user._id, 
      isActive: true 
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          itemCount
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (super_admin only)
router.put('/:id/role', [
  protect,
  canManageUsers,
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role')
    .isIn(['user', 'admin', 'super_admin'])
    .withMessage('Role must be user, admin, or super_admin')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { role } = req.body;

    // Prevent super_admin from changing their own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    // Find the user
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user role
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role'
    });
  }
});

// @desc    Toggle user account activation status
// @route   PUT /api/users/:id/toggle-activation
// @access  Private (super_admin only)
router.put('/:id/toggle-activation', [
  protect,
  canManageUsers,
  param('id').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Prevent super_admin from deactivating their own account
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status'
      });
    }

    // Find the user
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Toggle user status
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Toggle user activation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling user activation status'
    });
  }
});

// @desc    Activate/Deactivate user account
// @route   PUT /api/users/:id/status
// @access  Private (super_admin only)
router.put('/:id/status', [
  protect,
  canManageUsers,
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { isActive } = req.body;

    // Prevent super_admin from deactivating their own account
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status'
      });
    }

    // Find the user
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user status
    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
});

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Private (super_admin only)
router.get('/role/:role', [
  protect,
  superAdminOnly,
  param('role')
    .isIn(['user', 'admin', 'super_admin'])
    .withMessage('Role must be user, admin, or super_admin')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { role } = req.params;

    const users = await User.getUsersByRole(role);

    res.status(200).json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users by role'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats/overview
// @access  Private (super_admin only)
router.get('/stats/overview', [
  protect,
  superAdminOnly
], async (req, res) => {
  try {
    // Get user counts by role
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { 
            $sum: { 
              $cond: [{ $eq: ['$isActive', true] }, 1, 0] 
            } 
          }
        }
      }
    ]);

    // Get total users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get total items
    const totalItems = await Item.countDocuments({ isActive: true });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Format role stats
    const roleStats = {
      user: { count: 0, active: 0 },
      admin: { count: 0, active: 0 },
      super_admin: { count: 0, active: 0 }
    };

    userStats.forEach(stat => {
      if (roleStats[stat._id]) {
        roleStats[stat._id] = {
          count: stat.count,
          active: stat.active
        };
      }
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          totalItems,
          recentRegistrations
        },
        roleStats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
});

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (super_admin only)
router.delete('/:id', [
  protect,
  canManageUsers,
  param('id').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Prevent super_admin from deleting their own account
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Find the user
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete (deactivate account)
    user.isActive = false;
    await user.save();

    // Also soft delete all items created by this user
    await Item.updateMany(
      { createdBy: user._id },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

// @desc    Bulk update user roles
// @route   PUT /api/users/bulk/roles
// @access  Private (super_admin only)
router.put('/bulk/roles', [
  protect,
  canManageUsers,
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('userIds must be a non-empty array'),
  body('userIds.*')
    .isMongoId()
    .withMessage('Each userId must be a valid MongoDB ID'),
  body('role')
    .isIn(['user', 'admin', 'super_admin'])
    .withMessage('Role must be user, admin, or super_admin')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userIds, role } = req.body;

    // Prevent super_admin from changing their own role
    if (userIds.includes(req.user._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role in bulk operations'
      });
    }

    // Update users
    const result = await User.updateMany(
      { 
        _id: { $in: userIds },
        _id: { $ne: req.user._id } // Extra safety check
      },
      { role }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} user roles updated to ${role} successfully`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user roles'
    });
  }
});

module.exports = router;