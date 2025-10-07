const { AppDataSource } = require('../database');
const ConfigEntity = require('../entities/Config');

class ConfigRepository {
  /**
   * Get all configurations
   */
  async findAll() {
    const repo = AppDataSource.getRepository('Config');
    return await repo.find({ order: { created_at: 'DESC' } });
  }

  /**
   * Find configuration by ID
   */
  async findById(id) {
    const repo = AppDataSource.getRepository('Config');
    return await repo.findOneBy({ id });
  }

  /**
   * Create new configuration
   */
  async create(configData) {
    const repo = AppDataSource.getRepository('Config');
    const config = repo.create(configData);
    return await repo.save(config);
  }

  /**
   * Update existing configuration
   */
  async update(id, configData) {
    const repo = AppDataSource.getRepository('Config');
    await repo.update(id, configData);
    return await repo.findOneBy({ id });
  }

  /**
   * Delete configuration by ID
   */
  async delete(id) {
    const repo = AppDataSource.getRepository('Config');
    const result = await repo.delete(id);
    return result.affected > 0;
  }

  /**
   * Count total configurations
   */
  async count() {
    const repo = AppDataSource.getRepository('Config');
    return await repo.count();
  }
}

module.exports = new ConfigRepository();