class ValidationUtils {

  /**
   * Validate if ID parameter is valid (not null, not undefined, and is a valid number)
   */
  static validateId(id, paramName = 'ID') {
    if (!id || isNaN(id)) {
      throw new Error(`Invalid ${paramName}: ${id}`);
    }
    return parseInt(id);
  }

  /**
   * Validate request body is not empty
   */
  static validateRequestBody(body, requiredFields = []) {
    if (!body || Object.keys(body).length === 0) {
      throw new Error('Request body is required');
    }

    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
        throw new Error(`Required field missing: ${field}`);
      }
    }

    return body;
  }

  /**
   * Validate image file exists and has buffer
   */
  static validateImageFile(imageFile) {
    if (!imageFile) {
      throw new Error('No image file provided');
    }
    if (!imageFile.buffer) {
      throw new Error('Invalid image file');
    }
    return imageFile;
  }

  /**
   * Validate crop parameters (x, y, width, height)
   */
  static validateCropParams(cropParams) {
    if (!cropParams) {
      throw new Error('Crop parameters are required');
    }
    
    const { x, y, width, height } = cropParams;
    
    if (typeof x !== 'number' || x < 0) {
      throw new Error('Invalid x coordinate');
    }
    if (typeof y !== 'number' || y < 0) {
      throw new Error('Invalid y coordinate');
    }
    if (typeof width !== 'number' || width <= 0) {
      throw new Error('Invalid width');
    }
    if (typeof height !== 'number' || height <= 0) {
      throw new Error('Invalid height');
    }

    return { x, y, width, height };
  }

  /**
   * Validate configuration data
   */
  static validateConfigData(configData) {
    if (!configData.name || configData.name.trim().length === 0) {
      throw new Error('Configuration name is required');
    }

    if (configData.logo_scale !== undefined) {
      if (configData.logo_scale <= 0) {
        throw new Error('Logo scale must be greater than 0');
      }
      if (configData.logo_scale > 0.25) {
        throw new Error('Logo scale must not exceed 0.25 (task requirement)');
      }
    }



    return configData;
  }

  /**
   * Validate if value exists and is not null/undefined
   */
  static validateExists(value, fieldName) {
    if (!value) {
      throw new Error(`${fieldName} not found`);
    }
    return value;
  }

  /**
   * Validate numeric parameter
   */
  static validateNumber(value, fieldName, options = {}) {
    const { min = null, max = null, allowZero = true } = options;
    
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Invalid ${fieldName}: must be a number`);
    }
    
    if (!allowZero && value === 0) {
      throw new Error(`Invalid ${fieldName}: cannot be zero`);
    }
    
    if (min !== null && value < min) {
      throw new Error(`Invalid ${fieldName}: must be at least ${min}`);
    }
    
    if (max !== null && value > max) {
      throw new Error(`Invalid ${fieldName}: must not exceed ${max}`);
    }

    return value;
  }

  /**
   * Validate string parameter
   */
  static validateString(value, fieldName, options = {}) {
    const { required = true, minLength = 1, maxLength = null, trim = true } = options;
    
    if (required && (!value || (typeof value === 'string' && trim && value.trim().length === 0))) {
      throw new Error(`${fieldName} is required`);
    }
    
    if (value && typeof value !== 'string') {
      throw new Error(`Invalid ${fieldName}: must be a string`);
    }
    
    const processedValue = trim && typeof value === 'string' ? value.trim() : value;
    
    if (processedValue && minLength && processedValue.length < minLength) {
      throw new Error(`Invalid ${fieldName}: minimum length is ${minLength}`);
    }
    
    if (processedValue && maxLength && processedValue.length > maxLength) {
      throw new Error(`Invalid ${fieldName}: maximum length is ${maxLength}`);
    }

    return processedValue;
  }
}

module.exports = ValidationUtils;