const sharp = require('sharp');
const path = require('path');

class ImageRepository {

  /**
   * Process and crop image with optional logo overlay
   * Returns cropped image with logo overlay from config in specified quality
   */
  async processImage(imageFile, cropParams, config, isHighQuality = false) {
    try {
      const { logo_position, logo_scale, logo_image } = config;
      const { x, y, width, height } = cropParams;

      let imageProcessor = sharp(imageFile.buffer)
        .extract({
          left: x,
          top: y,
          width: width,
          height: height
        });

      if (logo_image && logo_image.trim()) {
        const logoBuffer = await this.loadLogoFromBase64(logo_image, width, height, logo_scale);
        const position = await this.calculateLogoPosition(logo_position, width, height, logoBuffer);
        
        imageProcessor = imageProcessor.composite([{
          input: logoBuffer,
          top: position.top,
          left: position.left
        }]);
      }

      if (isHighQuality) {
        return await imageProcessor
          .png({ 
            quality: 100, 
            compressionLevel: 0,
            adaptiveFiltering: false
          })
          .toBuffer();
      } else {
        return await imageProcessor.jpeg({ quality: 90 }).toBuffer();
      }
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  /**
    * Load and resize logo from file path
   */
  async loadLogoImage(logoPath, canvasWidth, canvasHeight, scale) {
    try {
      const maxScale = Math.min(scale, 0.25);
      
      const baseDimension = Math.max(canvasWidth, canvasHeight);
      const logoSize = Math.round(baseDimension * maxScale);
      
      return await sharp(logoPath)
        .resize(logoSize, logoSize, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png()
        .toBuffer();
    } catch (error) {
      throw new Error(`Logo processing failed: ${error.message}`);
    }
  }

  /**
   * Load and resize logo from base64 string
   */
  async loadLogoFromBase64(logoBase64, canvasWidth, canvasHeight, scale) {
    try {
      let base64Data = logoBase64;
      if (logoBase64.includes(',')) {
        base64Data = logoBase64.split(',')[1];
      }
      
      const logoBuffer = Buffer.from(base64Data, 'base64');
      
      const maxScale = Math.min(scale, 0.25);
      
      const baseDimension = Math.max(canvasWidth, canvasHeight);
      const logoSize = Math.round(baseDimension * maxScale);
      
      return await sharp(logoBuffer)
        .resize(logoSize, logoSize, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png()
        .toBuffer();
    } catch (error) {
      throw new Error(`Logo base64 processing failed: ${error.message}`);
    }
  }

  /**
   * Calculate logo position based on configuration
   */
  async calculateLogoPosition(position, canvasWidth, canvasHeight, logoBuffer) {
    const logoMetadata = await sharp(logoBuffer).metadata();
    const logoWidth = logoMetadata.width || 100;
    const logoHeight = logoMetadata.height || 100;
    
    const padding = 20;

    const positions = {
      'top-left': { top: padding, left: padding },
      'top-right': { top: padding, left: canvasWidth - logoWidth - padding },
      'bottom-left': { top: canvasHeight - logoHeight - padding, left: padding },
      'bottom-right': { top: canvasHeight - logoHeight - padding, left: canvasWidth - logoWidth - padding },
      'center': { 
        top: Math.floor((canvasHeight - logoHeight) / 2), 
        left: Math.floor((canvasWidth - logoWidth) / 2) 
      }
    };

    return positions[position] || positions['bottom-right'];
  }


}

module.exports = new ImageRepository();