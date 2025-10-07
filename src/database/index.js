const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });require('reflect-metadata');
const { DataSource } = require('typeorm');
const ConfigEntity = require('../entities/Config');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'image_cropper',
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev, use migrations in prod
  logging: process.env.NODE_ENV === 'development',
  entities: [ConfigEntity],
});

module.exports = {
  AppDataSource
};
