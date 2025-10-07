const configService = require('../services/config.service');
const status = require('http-status');

class ConfigController {
  
  /**
   * GET /api/configs - Get all configurations
   */
  async getAll(req, res) {
    const configs = await configService.getAllConfigurations();
    res.json({ success: true, data: configs });
  }

  /**
   * POST /api/configs - Create new configuration
   */
  async create(req, res) {
    const config = await configService.createConfiguration(req.body);
    res.status(status.CREATED).json({ success: true, data: config });
  }

  /**
   * PUT /api/configs/:id - Update configuration
   */
  async update(req, res) {
    const config = await configService.updateConfiguration(req.params.id, req.body);
    res.json({ success: true, data: config });
  }

  /**
   * DELETE /api/configs/:id - Delete configuration
   */
  async delete(req, res) {
    await configService.deleteConfiguration(req.params.id);
    res.json({ success: true, data: { message: 'Configuration deleted successfully' } });
  }
}

module.exports = new ConfigController();