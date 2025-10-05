const configService = require('../services/config.service');
const ValidationUtils = require('../utils/validation');
const ErrorHandler = require('../utils/error-handler');

class ConfigController {
  
  /**
   * GET /api/configs - Get all configurations
   */
  getAll = ErrorHandler.asyncHandler(async (req, res) => {
    const configs = await configService.getAllConfigurations();
    res.json({ success: true, data: configs });
  });

  /**
   * POST /api/configs - Create new configuration
   */
  create = ErrorHandler.asyncHandler(async (req, res) => {
    ValidationUtils.validateRequestBody(req.body, ['name']);
    const config = await configService.createConfiguration(req.body);
    res.status(201).json({ success: true, data: config });
  });

  /**
   * PUT /api/configs/:id - Update configuration
   */
  update = ErrorHandler.asyncHandler(async (req, res) => {
    const validId = ValidationUtils.validateId(req.params.id, 'configuration ID');
    ValidationUtils.validateRequestBody(req.body);
    
    const config = await configService.updateConfiguration(validId, req.body);
    res.json({ success: true, data: config });
  });

  /**
   * DELETE /api/configs/:id - Delete configuration
   */
  delete = ErrorHandler.asyncHandler(async (req, res) => {
    const validId = ValidationUtils.validateId(req.params.id, 'configuration ID');
    await configService.deleteConfiguration(validId);
    res.json({ success: true, data: { message: 'Configuration deleted successfully' } });
  });
}

module.exports = new ConfigController();