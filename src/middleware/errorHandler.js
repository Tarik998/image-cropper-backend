
const { MulterError } = require('multer');

function globalErrorHandler(error, req, res, next) {
  console.error('Error:', error.message);
  
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let details = error.details || null;

  if (error instanceof MulterError) {
    statusCode = 400;
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 10MB';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(error.errors).map(e => e.message);
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  if (error.code === '23505') { 
    statusCode = 409;
    message = 'Resource already exists';
  }

  const response = {
    success: false,
    error: message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      type: error.name 
    })
  };

  return res.status(statusCode).json(response);
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
}

module.exports = {
  globalErrorHandler,
  notFoundHandler
};