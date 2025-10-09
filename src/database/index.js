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
  synchronize: true, // Set to true for dev, false for prod
  entities: [ConfigEntity],
});

module.exports = {
  AppDataSource
};
