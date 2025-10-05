const { executeQuery } = require('../services/database.service');

class ConfigRepository {
  
  /**
   * Get all configurations from database
   */
  async findAll() {
    const query = 'SELECT * FROM configs ORDER BY created_at DESC';
    const result = await executeQuery(query);
    return result.rows;
  }

  /**
   * Find configuration by ID
   */
  async findById(id) {
    const query = 'SELECT * FROM configs WHERE id = $1';
    const result = await executeQuery(query, [id]);
    return result.rows[0] || null;
  }



  /**
   * Create new configuration
   */
  async create(configData) {
    const {
      name,
      logo_position,
      logo_scale,
      logo_image
    } = configData;

    const query = `
      INSERT INTO configs (name, logo_position, logo_scale, logo_image)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [name, logo_position, logo_scale, logo_image];
    const result = await executeQuery(query, values);
    return result.rows[0];
  }

  /**
   * Update existing configuration
   */
  async update(id, configData) {
    const {
      name,
      logo_position,
      logo_scale,
      logo_image
    } = configData;

    const query = `
      UPDATE configs 
      SET name = $1, logo_position = $2, logo_scale = $3, logo_image = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    
    const values = [name, logo_position, logo_scale, logo_image, id];
    const result = await executeQuery(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete configuration by ID
   */
  async delete(id) {
    const query = 'DELETE FROM configs WHERE id = $1 RETURNING id';
    const result = await executeQuery(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Count total configurations
   */
  async count() {
    const query = 'SELECT COUNT(*) as count FROM configs';
    const result = await executeQuery(query);
    return parseInt(result.rows[0].count);
  }


}

module.exports = new ConfigRepository();