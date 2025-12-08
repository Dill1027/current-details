const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to send error response
const sendErrorResponse = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message
  };
  
  // Add error details in development
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message;
    response.stack = error.stack;
  }
  
  return res.status(statusCode).json(response);
};

// Middleware to protect routes (verify JWT token)
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
      } catch (splitError) {
        console.error('Error parsing authorization header:', splitError);
        return sendErrorResponse(res, 401, 'Invalid authorization header format');
      }
    }

    if (!token) {
      return sendErrorResponse(res, 401, 'Access denied. No token provided.');
    }

    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return sendErrorResponse(res, 500, 'Server configuration error');
    }

    let decoded;
    try {
      // Verify token
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return sendErrorResponse(res, 401, 'Invalid or expired token', jwtError);
    }

    // Validate decoded token structure
    if (!decoded || !decoded.id) {
      return sendErrorResponse(res, 401, 'Invalid token payload');
    }

    let user;
    try {
      // Get user from token
      user = await User.findById(decoded.id).select('-password');
    } catch (dbError) {
      console.error('Database error while fetching user:', dbError);
      return sendErrorResponse(res, 500, 'Database error during authentication', dbError);
    }
      
    if (!user) {
      return sendErrorResponse(res, 401, 'Token is not valid. User no longer exists.');
    }

    if (!user.isActive) {
      return sendErrorResponse(res, 401, 'User account is deactivated.');
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Unexpected error in protect middleware:', error);
    return sendErrorResponse(res, 500, 'Authentication error', error);
  }
};

// Middleware to check user roles with enhanced validation
const checkRole = (...roles) => {
  return (req, res, next) => {
    try {
      // Ensure user exists and has been authenticated
      if (!req.user) {
        console.error('checkRole: req.user is undefined - authentication middleware may have failed');
        return sendErrorResponse(res, 401, 'Authentication required. Please log in.');
      }

      // Validate user object structure
      if (typeof req.user !== 'object' || !req.user.role) {
        console.error('checkRole: Invalid user object structure:', req.user);
        return sendErrorResponse(res, 401, 'Invalid user session. Please log in again.');
      }

      // Validate roles parameter
      if (!roles || roles.length === 0) {
        console.error('checkRole: No roles specified in middleware');
        return sendErrorResponse(res, 500, 'Server configuration error: No roles specified');
      }

      // Check if user role is in allowed roles
      if (!roles.includes(req.user.role)) {
        console.log(`Access denied for user ${req.user._id} with role '${req.user.role}'. Required: [${roles.join(', ')}]`);
        return sendErrorResponse(res, 403, `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`);
      }

      console.log(`Access granted for user ${req.user._id} with role '${req.user.role}'`);
      next();
    } catch (error) {
      console.error('Unexpected error in checkRole middleware:', error);
      return sendErrorResponse(res, 500, 'Role validation error', error);
    }
  };
};

// Enhanced role-specific middleware
const superAdminOnly = (req, res, next) => {
  return checkRole('super_admin')(req, res, next);
};

const adminOrSuperAdmin = (req, res, next) => {
  return checkRole('admin', 'super_admin')(req, res, next);
};

const canPerformCRUD = (req, res, next) => {
  return checkRole('admin', 'super_admin')(req, res, next);
};

const canDelete = (req, res, next) => {
  return checkRole('super_admin')(req, res, next);
};

const canManageUsers = (req, res, next) => {
  return checkRole('super_admin')(req, res, next);
};

const authenticatedUser = (req, res, next) => {
  return checkRole('user', 'admin', 'super_admin')(req, res, next);
};

// Enhanced async wrapper for route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Async handler caught error:', error);
    
    // Send appropriate error response
    if (error.name === 'ValidationError') {
      return sendErrorResponse(res, 400, 'Validation Error', error);
    } else if (error.name === 'CastError') {
      return sendErrorResponse(res, 400, 'Invalid ID format', error);
    } else if (error.code === 11000) {
      return sendErrorResponse(res, 400, 'Duplicate entry', error);
    } else {
      return sendErrorResponse(res, 500, 'Server Error', error);
    }
  });
};

// Middleware to validate MongoDB ObjectId
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      const id = req.params[paramName];
      
      if (!id) {
        return sendErrorResponse(res, 400, `Missing ${paramName} parameter`);
      }

      // Check if it's a valid MongoDB ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return sendErrorResponse(res, 400, `Invalid ${paramName} format`);
      }

      next();
    } catch (error) {
      console.error('ObjectId validation error:', error);
      return sendErrorResponse(res, 500, 'ID validation error', error);
    }
  };
};

// Optional middleware to add user info to request if token is present
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Optional auth: Invalid token provided');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = {
  protect,
  checkRole,
  superAdminOnly,
  adminOrSuperAdmin,
  canPerformCRUD,
  canDelete,
  canManageUsers,
  authenticatedUser,
  asyncHandler,
  validateObjectId,
  optionalAuth,
  sendErrorResponse
};