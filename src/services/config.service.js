const configRepository = require('../repositories/config.repository');
const { NotFoundError, ConflictError, ValidationError, DatabaseError } = require('../utils/errors');

class ConfigService {

  /**
   * Get all configurations
   */
  async getAllConfigurations() {
    try {
      return await configRepository.findAll();
    } catch (error) {
      throw new DatabaseError(`Failed to retrieve configurations: ${error.message}`);
    }
  }

  /**
   * Get configuration by ID
   */
  async getConfigurationById(id) {
    try {
      const config = await configRepository.findById(id);
      if (!config) {
        throw new NotFoundError(`Configuration with ID ${id} not found`);
      }
      return config;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to retrieve configuration: ${error.message}`);
    }
  }

  /**
   * Get default configuration (returns first available config or creates a basic one)
   */
  async getDefaultConfiguration() {
    try {
      const configs = await configRepository.findAll();
      
      if (configs && configs.length > 0) {
        return configs[0];
      }

      return {
        id: null,
        name: 'Basic Configuration',
        logo_position: 'bottom-right',
        logo_scale: 0.2,
        logo_image: null
      };
    } catch (error) {
      throw new DatabaseError(`Failed to retrieve default configuration: ${error.message}`);
    }
  }

  /**
   * Create new configuration
   */
  async createConfiguration(configData) {
    try {
      const count = await configRepository.count();
      if (count >= 3) {
        throw new ConflictError('Maximum of 3 configurations allowed. Delete an existing configuration first.');
      }

      return await configRepository.create(configData);
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create configuration: ${error.message}`);
    }
  }

  /**
   * Update existing configuration
   */
  async updateConfiguration(id, configData) {
    try {
      const existingConfig = await configRepository.findById(id);
      if (!existingConfig) {
        throw new NotFoundError(`Configuration with ID ${id} not found`);
      }

      const updatedConfig = await configRepository.update(id, configData);
      if (!updatedConfig) {
        throw new NotFoundError(`Configuration with ID ${id} not found`);
      }

      return updatedConfig;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update configuration: ${error.message}`);
    }
  }

  /**
   * Delete configuration
   */
  async deleteConfiguration(id) {
    try {
      const existingConfig = await configRepository.findById(id);
      if (!existingConfig) {
        throw new NotFoundError(`Configuration with ID ${id} not found`);
      }

      const deleted = await configRepository.delete(id);
      if (!deleted) {
        throw new NotFoundError(`Configuration with ID ${id} not found`);
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete configuration: ${error.message}`);
    }
  }


}

module.exports = new ConfigService();