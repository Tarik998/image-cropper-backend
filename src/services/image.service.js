const path = require('path');
const imageRepository = require('../repositories/image.repository');
const configService = require('./config.service');
const { ProcessingError, ValidationError } = require('../utils/errors');

class ImageService {

  async processImage(imageFile, cropParams, configId = null, isHighQuality = false) {
    try {
      let config;
      if (configId) {
        config = await configService.getConfigurationById(configId);
      } else {
        config = {
          id: null,
          name: 'No Configuration',
          logo_position: 'bottom-right',
          logo_scale: 0.15,
          logo_image: null
        };
      }

      const processedImageBuffer = await imageRepository.processImage(imageFile, cropParams, config, isHighQuality);
      
      return {
        imageBuffer: processedImageBuffer,
        config: config,
        originalFileName: imageFile.originalname
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw new ProcessingError(`Image processing failed: ${error.message}`);
    }
  }

  /**
   * Get supported image formats
   */
  getSupportedFormats() {
    return [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/tiff',
      'image/bmp'
    ];
  }


}

module.exports = new ImageService();