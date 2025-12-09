const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const userRoutes = require('./routes/users');

// Connect to database
connectDB();

const app = express();

// Security middleware with custom configuration
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Apply rate limiting to all requests
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 10, // More permissive in development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from localhost and network during development
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://192.168.1.56:3000',
      'http://192.168.1.56:3001',
      // Add Vercel deployment URLs
      'https://current-details-notq-k08hw4wc-dill027s-projects.vercel.app',
      'https://current-details-notq.vercel.app'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check if origin ends with .vercel.app or is in allowed list
    if (origin && (origin.endsWith('.vercel.app') || allowedOrigins.indexOf(origin) !== -1)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in production for now
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running properly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RBAC System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/password',
        verifyToken: 'POST /api/auth/verify-token'
      },
      items: {
        getAllItems: 'GET /api/items',
        getItem: 'GET /api/items/:id',
        createItem: 'POST /api/items',
        updateItem: 'PUT /api/items/:id',
        deleteItem: 'DELETE /api/items/:id',
        getMyItems: 'GET /api/items/my/items'
      },
      users: {
        getAllUsers: 'GET /api/users (super_admin only)',
        getUser: 'GET /api/users/:id (super_admin only)',
        updateUserRole: 'PUT /api/users/:id/role (super_admin only)',
        updateUserStatus: 'PUT /api/users/:id/status (super_admin only)',
        getUsersByRole: 'GET /api/users/role/:role (super_admin only)',
        getUserStats: 'GET /api/users/stats/overview (super_admin only)',
        deleteUser: 'DELETE /api/users/:id (super_admin only)',
        bulkUpdateRoles: 'PUT /api/users/bulk/roles (super_admin only)'
      }
    },
    roles: {
      user: 'Read-only access to items',
      admin: 'Full CRUD access to items',
      super_admin: 'Full access including user management'
    }
  });
});

// Error handling for 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Enhanced Global Error Handler
app.use((err, req, res, next) => {
  console.error('=== ERROR CAUGHT BY GLOBAL HANDLER ===');
  console.error('Request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    user: req.user ? { id: req.user._id, role: req.user.role } : 'Not authenticated'
  });
  console.error('Error Details:', err);

  if (process.env.NODE_ENV === 'development') {
    console.error('Stack Trace:', err.stack);
  }

  // Initialize error response
  let error = {
    success: false,
    message: err.message || 'Server Error',
    statusCode: err.statusCode || 500
  };

  // Add error details in development mode
  if (process.env.NODE_ENV === 'development') {
    error.error = err.message;
    error.stack = err.stack;
  }

  // Handle specific error types

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    error.message = `Invalid ${err.path}: ${err.value}`;
    error.statusCode = 400;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = `Validation Error: ${messages.join(', ')}`;
    error.statusCode = 400;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error.message = `Duplicate value for ${field}: ${value}. This value already exists.`;
    error.statusCode = 400;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token. Please log in again.';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired. Please log in again.';
    error.statusCode = 401;
  }

  // Multer Upload Errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File too large. Maximum size is 5MB.';
    error.statusCode = 400;
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error.message = 'Too many files. Only 1 file is allowed.';
    error.statusCode = 400;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Unexpected file field. Please check your form data.';
    error.statusCode = 400;
  }

  // Handle multer errors
  if (err.message && err.message.includes('Only image files are allowed')) {
    error.statusCode = 400;
  }

  // Rate limiting error
  if (err.message && err.message.includes('Too many requests')) {
    error.statusCode = 429;
    error.message = 'Too many requests from this IP. Please try again later.';
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError') {
    error.message = 'Database connection error. Please try again.';
    error.statusCode = 503;
  }

  if (err.name === 'MongoTimeoutError') {
    error.message = 'Database operation timed out. Please try again.';
    error.statusCode = 503;
  }

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    error.statusCode = 403;
    error.message = 'Cross-origin request blocked by CORS policy.';
  }

  console.error('Final error response:', {
    statusCode: error.statusCode,
    message: error.message,
    timestamp: new Date().toISOString()
  });

  res.status(error.statusCode).json(error);
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`
🚀 Server is running on port ${PORT}
📊 Environment: ${process.env.NODE_ENV || 'development'}
🔗 API URL: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/health
📁 Uploads: http://localhost:${PORT}/uploads
🌐 Network: http://192.168.1.56:${PORT}/api
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err.message);
  console.log('Shutting down the server due to uncaught exception');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;