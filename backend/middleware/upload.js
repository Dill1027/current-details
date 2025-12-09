const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper function for error responses
const sendUploadError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    type: 'upload_error'
  });
};

// Ensure upload directory exists with proper error handling
// Use /tmp for serverless environments like Vercel
const uploadDir = process.env.UPLOAD_PATH || (process.env.NODE_ENV === 'production' ? '/tmp/uploads/' : './uploads/');

const createUploadDirectory = () => {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`Upload directory created: ${uploadDir}`);
    }
    
    // Check if directory is writable
    fs.accessSync(uploadDir, fs.constants.W_OK);
    console.log(`Upload directory is writable: ${uploadDir}`);
  } catch (error) {
    console.error('Error with upload directory:', error);
    // In serverless, don't throw - just log and continue
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Upload directory error: ${error.message}`);
    }
  }
};

// Initialize upload directory
try {
  createUploadDirectory();
} catch (error) {
  console.error('Failed to create upload directory:', error);
}

// Enhanced storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // Verify directory exists before each upload
      if (!fs.existsSync(uploadDir)) {
        createUploadDirectory();
      }
      cb(null, uploadDir);
    } catch (error) {
      console.error('Storage destination error:', error);
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    try {
      // Sanitize original filename
      const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      // Create unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(originalName);
      const baseName = path.basename(originalName, extension);
      
      const filename = `${file.fieldname}-${baseName}-${uniqueSuffix}${extension}`;
      
      console.log(`Generated filename: ${filename}`);
      cb(null, filename);
    } catch (error) {
      console.error('Filename generation error:', error);
      cb(error, null);
    }
  }
});

// Enhanced file filter with detailed validation
const fileFilter = (req, file, cb) => {
  try {
    console.log('File upload attempt:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Check if file exists
    if (!file) {
      return cb(new Error('No file provided'), false);
    }

    // Validate file properties
    if (!file.originalname) {
      return cb(new Error('File must have a name'), false);
    }

    if (!file.mimetype) {
      return cb(new Error('File type cannot be determined'), false);
    }

    // Check if file is an image
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }

    // Allow specific image formats
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'image/bmp',
      'image/tiff'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, WebP, BMP, and TIFF images are allowed.`), false);
    }

    // Additional file extension validation
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error(`Invalid file extension: ${fileExtension}. Allowed extensions: ${allowedExtensions.join(', ')}`), false);
    }

    console.log('File validation passed:', file.originalname);
    cb(null, true);
  } catch (error) {
    console.error('File filter error:', error);
    cb(error, false);
  }
};

// Configure multer with enhanced error handling
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only allow 1 file
    fieldSize: 1024 * 1024, // 1MB field size limit
    fieldNameSize: 100 // Field name size limit
  },
  fileFilter: fileFilter
});

// Middleware for single image upload
const uploadSingleImage = upload.single('image');

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one image is allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "image" field for file upload.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type') || error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Other errors
  return res.status(500).json({
    success: false,
    message: 'File upload error: ' + error.message
  });
};

// Middleware to handle image upload with error handling
const processImageUpload = (req, res, next) => {
  uploadSingleImage(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please select an image to upload.'
      });
    }

    // Add file info to request for easy access
    req.uploadedFile = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    };

    next();
  });
};

// Function to delete uploaded file (cleanup on error or item deletion)
const deleteUploadedFile = (filename) => {
  try {
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Middleware to validate image file exists (for update operations)
const validateImageFile = (req, res, next) => {
  // This is for update operations where image might be optional
  if (req.file) {
    // If file is being uploaded, process it
    return processImageUpload(req, res, next);
  }
  
  // If no file uploaded, continue (image update is optional)
  next();
};

// Function to get file URL
const getFileUrl = (req, filename) => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
};

module.exports = {
  uploadSingleImage,
  processImageUpload,
  validateImageFile,
  handleUploadError,
  deleteUploadedFile,
  getFileUrl
};