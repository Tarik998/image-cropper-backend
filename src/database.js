const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'image_cropper_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function executeQuery(query, params = []) {
  const client = await pool.connect();
  try {
    return await client.query(query, params);
  } finally {
    client.release();
  }
}

// Initialize database schema
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    await executeQuery(`
     CREATE TABLE IF NOT EXISTS cropping_configs (
        id SERIAL PRIMARY KEY,
        logo_position VARCHAR(50) NOT NULL DEFAULT 'bottom-right',
        scale_down DECIMAL(5,3) NOT NULL DEFAULT 0.25,
        logo_image TEXT,
        image_id INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
      } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
}

module.exports = {
  executeQuery,
  initializeDatabase
};