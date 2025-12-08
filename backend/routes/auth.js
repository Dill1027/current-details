const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, asyncHandler } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  if (!id) {
    throw new Error('User ID is required for token generation');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Helper function to send error response
const sendErrorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, 'Validation failed', errors.array());
  }

  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return sendErrorResponse(res, 400, 'Name, email, and password are required');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendErrorResponse(res, 400, 'User already exists with this email');
  }

  // Create user (role defaults to 'user')
  const user = await User.create({
    name,
    email,
    password
  });

  if (!user) {
    return sendErrorResponse(res, 500, 'Failed to create user');
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, 'Validation failed', errors.array());
  }

  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return sendErrorResponse(res, 400, 'Email and password are required');
  }

  // Check if user exists and get password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return sendErrorResponse(res, 401, 'Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    return sendErrorResponse(res, 401, 'Your account has been deactivated. Please contact administrator.');
  }

  // Check password
  const isPasswordCorrect = await user.correctPassword(password);
  if (!isPasswordCorrect) {
    return sendErrorResponse(res, 401, 'Invalid email or password');
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    }
  });
}));

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendErrorResponse(res, 401, 'User not authenticated');
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    }
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', [
  protect,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, 'Validation failed', errors.array());
  }

  if (!req.user) {
    return sendErrorResponse(res, 401, 'User not authenticated');
  }

  const { name, email } = req.body;
  const updateData = {};

  // Only update provided fields
  if (name) updateData.name = name;
  if (email) {
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: req.user._id } 
    });
    
    if (existingUser) {
      return sendErrorResponse(res, 400, 'Email is already taken by another user');
    }
    
    updateData.email = email;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!user) {
    return sendErrorResponse(res, 404, 'User not found');
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
}));// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', [
  protect,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, 'Validation failed', errors.array());
  }

  if (!req.user) {
    return sendErrorResponse(res, 401, 'User not authenticated');
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return sendErrorResponse(res, 404, 'User not found');
  }

    // Check current password
    const isCurrentPasswordCorrect = await user.correctPassword(currentPassword);
    if (!isCurrentPasswordCorrect) {
      return sendErrorResponse(res, 400, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
}));

// @desc    Verify token (GET method with auth middleware)
// @route   GET /api/auth/verify
// @access  Private
router.get('/verify', protect, asyncHandler(async (req, res) => {
  // If we reach here, the protect middleware has already verified the token
  const user = await User.findById(req.user.id).select('-password');

  if (!user || !user.isActive) {
    return sendErrorResponse(res, 401, 'User not found or inactive');
  }

  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
}));

// @desc    Verify token
// @route   POST /api/auth/verify-token
// @access  Public
router.post('/verify-token', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return sendErrorResponse(res, 400, 'Token is required');
  }

  if (!process.env.JWT_SECRET) {
    return sendErrorResponse(res, 500, 'JWT secret not configured');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return sendErrorResponse(res, 401, 'Invalid token');
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (jwtError) {
    return sendErrorResponse(res, 401, 'Invalid token');
  }
}));

module.exports = router;