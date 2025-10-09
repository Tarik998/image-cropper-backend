const { body, param, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    throw new ValidationError('Validation failed', errorDetails);
  }
  next();
};


const validateImageProcess = [
  body('x')
    .isInt({ min: 0 })
    .withMessage('X coordinate must be a non-negative integer'),
  
  body('y')
    .isInt({ min: 0 })
    .withMessage('Y coordinate must be a non-negative integer'),
  
  body('width')
    .isInt({ min: 1 })
    .withMessage('Width must be a positive integer'),
  
  body('height')
    .isInt({ min: 1 })
    .withMessage('Height must be a positive integer'),
  
    body('configId')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
        return true;
      }
      if (typeof value === 'string' && !isNaN(parseInt(value))) {
        if (parseInt(value) >= 1) return true;
      }
      if (typeof value === 'number' && value >= 1) {
        return true;
      }
      throw new Error('Config ID must be a positive integer or omitted');
    }),
  
  body('quality')
    .optional()
    .isIn(['preview', 'high'])
    .withMessage('Quality must be either "preview" or "high"'),
  
  handleValidationErrors
];


const validateConfigData = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Configuration name must be 1-100 characters'),
  
  body('logo_position')
    .isIn(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'])
    .withMessage('Logo position must be one of: top-left, top-right, bottom-left, bottom-right, center'),
  
  body('logo_scale')
    .isFloat({ min: 0.01, max: 0.25 })
    .withMessage('Logo scale must be between 0.01 and 0.25'),
  
  body('logo_image')
    .optional()
    .custom((value) => {
      if (value && !value.startsWith('data:image/')) {
        throw new Error('Logo image must be a valid base64 data URL');
      }
      return true;
    }),
  
  handleValidationErrors
];


const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  
  handleValidationErrors
];

const validateImageFile = (req, res, next) => {
  if (!req.file) {
    throw new ValidationError('No image file provided');
  }
  
  if (!req.file.buffer || req.file.buffer.length === 0) {
    throw new ValidationError('Invalid image file - no data');
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    throw new ValidationError(`Unsupported file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  next();
};

module.exports = {
  validateImageProcess,
  validateConfigData,
  validateId,
  validateImageFile,
  handleValidationErrors
};