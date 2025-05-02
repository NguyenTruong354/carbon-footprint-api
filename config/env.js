require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'carbon_footprint_db',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CLIMATIQ_API_KEY: process.env.CLIMATIQ_API_KEY,
  CARBON_INTENSITY_API_URL: process.env.CARBON_INTENSITY_API_URL || 'https://api.carbonintensity.org.uk'
};