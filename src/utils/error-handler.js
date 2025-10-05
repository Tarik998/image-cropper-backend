
class ErrorHandler {

  /**
   * Standard error types with consistent status codes
   */
  static ERROR_TYPES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
    FILE_ERROR: 'FILE_ERROR',
    PROCESSING_ERROR: 'PROCESSING_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
  };

  /**
   * Create standardized error with type and message
   */
  static createError(type, message, details = null) {
    const error = new Error(message);
    error.type = type;
    error.details = details;
    return error;
  }

  /**
   * Validation error helper
   */
  static validationError(message, details = null) {
    return ErrorHandler.createError(ErrorHandler.ERROR_TYPES.VALIDATION_ERROR, message, details);
  }

  /**
   * Not found error helper
   */
  static notFoundError(message, details = null) {
    return ErrorHandler.createError(ErrorHandler.ERROR_TYPES.NOT_FOUND, message, details);
  }

  /**
   * Processing error helper (for image processing, etc.)
   */
  static processingError(message, details = null) {
    return ErrorHandler.createError(ErrorHandler.ERROR_TYPES.PROCESSING_ERROR, message, details);
  }

  /**
   * File error helper (for file operations)
   */
  static fileError(message, details = null) {
    return ErrorHandler.createError(ErrorHandler.ERROR_TYPES.FILE_ERROR, message, details);
  }

  /**
   * Database error helper
   */
  static databaseError(message, details = null) {
    return ErrorHandler.createError(ErrorHandler.ERROR_TYPES.DATABASE_ERROR, message, details);
  }

  /**
   * Express error handler middleware
   */
  static handleControllerError(error, req, res, next) {
    console.error('Controller Error:', error.message);
    
    let statusCode = 500;
    let response = { success: false, error: 'Internal server error' };

    switch (error.type) {
      case ErrorHandler.ERROR_TYPES.VALIDATION_ERROR:
        statusCode = 400;
        response.error = error.message;
        break;
      
      case ErrorHandler.ERROR_TYPES.NOT_FOUND:
        statusCode = 404;
        response.error = error.message;
        break;
        
      case ErrorHandler.ERROR_TYPES.DUPLICATE_ENTRY:
        statusCode = 409;
        response.error = error.message;
        break;
        
      case ErrorHandler.ERROR_TYPES.FILE_ERROR:
      case ErrorHandler.ERROR_TYPES.PROCESSING_ERROR:
        statusCode = 400;
        response.error = error.message;
        break;
        
      case ErrorHandler.ERROR_TYPES.DATABASE_ERROR:
        statusCode = 500;
        response.error = 'Database operation failed';
        break;
        
      default:
        if (error.message.includes('not found')) {
          statusCode = 404;
          response.error = error.message;
        } else if (error.message.includes('required') || 
                   error.message.includes('Invalid') || 
                   error.message.includes('must be') ||
                   error.message.includes('Maximum')) {
          statusCode = 400;
          response.error = error.message;
        } else {
          response.error = error.message || 'Internal server error';
        }
    }

    if (error.details) {
      response.details = error.details;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Async wrapper for controllers to automatically handle errors
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Wrap service method calls with consistent error handling
   */
  static async handleServiceCall(operation, errorContext = 'Operation') {
    try {
      return await operation();
    } catch (error) {
      if (error.type) {
        throw error;
      }
      
      if (error.message.includes('not found')) {
        throw ErrorHandler.notFoundError(error.message);
      }
      
      if (error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('must be')) {
        throw ErrorHandler.validationError(error.message);
      }
      
      throw ErrorHandler.processingError(`${errorContext} failed: ${error.message}`);
    }
  }
}

module.exports = ErrorHandler;