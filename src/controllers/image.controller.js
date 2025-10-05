const imageService = require('../services/image.service');
const ValidationUtils = require('../utils/validation');
const ErrorHandler = require('../utils/error-handler');

class ImageController {

  /**
   * POST /api/image/process
   */
  processImage = ErrorHandler.asyncHandler(async (req, res) => {
    ValidationUtils.validateImageFile(req.file);
    
    const { x, y, width, height, configId, quality = 'preview' } = req.body;
    
    const cropParams = ValidationUtils.validateCropParams({
      x: parseInt(x),
      y: parseInt(y), 
      width: parseInt(width),
      height: parseInt(height)
    });
    
    const parsedConfigId = configId && configId !== 'null' && configId !== 'undefined' 
      ? parseInt(configId) 
      : null;

    const isHighQuality = quality === 'high';
    
    const { imageBuffer, config, originalFileName } = await imageService.processImage(
      req.file, 
      cropParams, 
      parsedConfigId,
      isHighQuality
    );
    
    const headers = {
      'Content-Type': isHighQuality ? 'image/png' : 'image/jpeg',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'no-cache',
      'X-Original-Filename': originalFileName,
      'X-Config-Used': config.name,
      'X-Processed-At': new Date().toISOString(),
      'X-Quality-Mode': isHighQuality ? 'high' : 'preview'
    };

    if (isHighQuality) {
      headers['Content-Disposition'] = 'attachment; filename="cropped-image.png"';
    }

    res.set(headers);
    return res.send(imageBuffer);
  });

}

module.exports = new ImageController();