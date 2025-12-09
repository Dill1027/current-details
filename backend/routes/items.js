const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const Item = require('../models/Item');
const { protect, canPerformCRUD, canDelete, authenticatedUser, asyncHandler } = require('../middleware/auth');
const { processImageUpload, validateImageFile, deleteUploadedFile, getFileUrl } = require('../middleware/upload');

const router = express.Router();

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

// @desc    Get all items (with pagination and filtering)
// @route   GET /api/items
// @access  Private (all authenticated users can read)
router.get('/', [
  protect,
  authenticatedUser,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot be more than 100 characters')
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
    const search = req.query.search || '';

    // Build filter
    let filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { note: { $regex: search, $options: 'i' } }
      ];
    }

    // Get items with pagination
    const items = await Item.getItemsWithPagination(page, limit, filter);
    const totalItems = await Item.getItemsCount(filter);
    const totalPages = Math.ceil(totalItems / limit);

    // Add image URLs to items
    const itemsWithUrls = items.map(item => {
      const itemObj = item.toObject();
      itemObj.imageUrl = getFileUrl(req, item.image);
      console.log('📸 GET /items - Item ID:', item._id, 'Image:', item.image, 'URL:', itemObj.imageUrl);
      return itemObj;
    });

    res.status(200).json({
      success: true,
      data: {
        items: itemsWithUrls,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching items'
    });
  }
});

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Private (all authenticated users can read)
router.get('/:id', [
  protect,
  authenticatedUser,
  param('id').isMongoId().withMessage('Invalid item ID')
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

    const item = await Item.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Add image URL
    const itemObj = item.toObject();
    if (process.env.NODE_ENV === 'production' && item.image.startsWith('data:')) {
      itemObj.imageUrl = item.image;
    } else {
      itemObj.imageUrl = getFileUrl(req, item.image);
    }

    res.status(200).json({
      success: true,
      data: {
        item: itemObj
      }
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching item'
    });
  }
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private (admin and super_admin only)
router.post('/', [
  protect,
  canPerformCRUD,
  processImageUpload,
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('note')
    .trim()
    .notEmpty()
    .withMessage('Note is required')
    .isLength({ max: 1000 })
    .withMessage('Note cannot be more than 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there's an uploaded file and validation fails, delete it
      if (req.uploadedFile) {
        deleteUploadedFile(req.uploadedFile.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { startDate, endDate, note } = req.body;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      // Delete uploaded file if validation fails
      if (req.uploadedFile) {
        deleteUploadedFile(req.uploadedFile.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Handle image storage based on environment
    let imageData;
    if (process.env.NODE_ENV === 'production' && req.file && req.file.buffer) {
      // Store as base64 in production (serverless)
      imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else {
      // Store filename in development
      imageData = req.uploadedFile.filename;
    }

    // Create item
    const item = await Item.create({
      image: imageData,
      dateRange: {
        start: start,
        end: end
      },
      note,
      createdBy: req.user._id
    });

    // Populate user information
    await item.populate('createdBy', 'name email role');

    // Add image URL
    const itemObj = item.toObject();
    if (process.env.NODE_ENV === 'production' && item.image.startsWith('data:')) {
      itemObj.imageUrl = item.image; // Return base64 directly
    } else {
      itemObj.imageUrl = getFileUrl(req, item.image);
    }

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: {
        item: itemObj
      }
    });
  } catch (error) {
    console.error('Create item error:', error);
    // Delete uploaded file if there's an error
    if (req.uploadedFile) {
      deleteUploadedFile(req.uploadedFile.filename);
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating item'
    });
  }
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (admin and super_admin only)
router.put('/:id', [
  protect,
  canPerformCRUD,
  param('id').isMongoId().withMessage('Invalid item ID'),
  validateImageFile, // Optional image upload
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Note cannot be more than 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there's an uploaded file and validation fails, delete it
      if (req.uploadedFile) {
        deleteUploadedFile(req.uploadedFile.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find the item
    const item = await Item.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!item) {
      // Delete uploaded file if item not found
      if (req.uploadedFile) {
        deleteUploadedFile(req.uploadedFile.filename);
      }
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Build update data
    const updateData = { updatedBy: req.user._id };
    const { startDate, endDate, note } = req.body;

    // Handle date range update
    if (startDate || endDate) {
      const currentStart = startDate ? new Date(startDate) : item.dateRange.start;
      const currentEnd = endDate ? new Date(endDate) : item.dateRange.end;
      
      if (currentEnd <= currentStart) {
        // Delete uploaded file if validation fails
        if (req.uploadedFile) {
          deleteUploadedFile(req.uploadedFile.filename);
        }
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
      
      updateData.dateRange = {
        start: currentStart,
        end: currentEnd
      };
    }

    // Handle note update
    if (note !== undefined) {
      updateData.note = note;
    }

    // Handle image update
    if (req.uploadedFile || (req.file && req.file.buffer)) {
      // Handle base64 in production
      if (process.env.NODE_ENV === 'production' && req.file && req.file.buffer) {
        updateData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      } else if (req.uploadedFile) {
        // Delete old image file in development
        if (item.image && !item.image.startsWith('data:')) {
          deleteUploadedFile(item.image);
        }
        updateData.image = req.uploadedFile.filename;
      }
    }

    // Update item
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email role');

    // Add image URL
    const itemObj = updatedItem.toObject();
    if (process.env.NODE_ENV === 'production' && updatedItem.image.startsWith('data:')) {
      itemObj.imageUrl = updatedItem.image;
    } else {
      itemObj.imageUrl = getFileUrl(req, updatedItem.image);
    }

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: {
        item: itemObj
      }
    });
  } catch (error) {
    console.error('Update item error:', error);
    // Delete uploaded file if there's an error
    if (req.uploadedFile) {
      deleteUploadedFile(req.uploadedFile.filename);
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating item'
    });
  }
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (super_admin only)
router.delete('/:id', [
  protect,
  canDelete,
  param('id').isMongoId().withMessage('Invalid item ID')
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

    // Find the item
    const item = await Item.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Soft delete (set isActive to false)
    await Item.findByIdAndUpdate(req.params.id, { 
      isActive: false,
      updatedBy: req.user._id 
    });

    // Optionally delete the image file (uncomment if you want to delete files immediately)
    // deleteUploadedFile(item.image);

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting item'
    });
  }
});

// @desc    Get items created by current user
// @route   GET /api/items/my-items
// @access  Private (admin and super_admin only)
router.get('/my/items', [
  protect,
  canPerformCRUD,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
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

    // Filter by current user
    const filter = { createdBy: req.user._id };

    // Get items with pagination
    const items = await Item.getItemsWithPagination(page, limit, filter);
    const totalItems = await Item.getItemsCount(filter);
    const totalPages = Math.ceil(totalItems / limit);

    // Add image URLs to all items
    const itemsWithUrls = items.map(item => {
      const itemObj = item.toObject();
      if (process.env.NODE_ENV === 'production' && item.image.startsWith('data:')) {
        itemObj.imageUrl = item.image;
      } else {
        itemObj.imageUrl = getFileUrl(req, item.image);
      }
      return itemObj;
    });

    res.status(200).json({
      success: true,
      data: {
        items: itemsWithUrls,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your items'
    });
  }
});

module.exports = router;