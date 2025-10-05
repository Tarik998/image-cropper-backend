const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });


async function runMigrations() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'image_cropper_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Starting database migrations');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64),
        execution_time_ms INTEGER
      );
    `);
    console.log('Schema migrations table ready');

    const migrationDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationDir)) {
      console.log('No migrations directory found');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('No migration files found');
      return;
    }

    const appliedResult = await pool.query('SELECT version FROM schema_migrations ORDER BY version');
    const appliedVersions = new Set(appliedResult.rows.map(row => row.version));

    let appliedCount = 0;

    for (const filename of migrationFiles) {
      const version = filename.replace('.sql', '');
      
      if (appliedVersions.has(version)) {
        console.log(`Skipping applied migration: ${filename}`);
        continue;
      }

      const startTime = Date.now();
      const content = fs.readFileSync(path.join(migrationDir, filename), 'utf8');
      const checksum = crypto.createHash('sha256').update(content).digest('hex');

      console.log(`Applying migration: ${filename}`);

      await pool.query('BEGIN');
      try {
        await pool.query(content);
        const executionTime = Date.now() - startTime;
        await pool.query(
          'INSERT INTO schema_migrations (version, checksum, execution_time_ms) VALUES ($1, $2, $3)',
          [version, checksum, executionTime]
        );
        await pool.query('COMMIT');
        console.log(`Applied migration: ${filename} (${executionTime}ms)`);
        appliedCount++;
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    }

    if (appliedCount === 0) {
      console.log('Database is up to date (no new migrations)');
    } else {
      console.log(`Applied ${appliedCount} new migration(s)`);
    }

  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

module.exports = { runMigrations };
