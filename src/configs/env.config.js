/**
 * Environment Configuration
 * Centralizes all environment variables for easy access across the application
 */

require('dotenv').config();

module.exports = {
  // Server Configuration
  node_env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'hrms_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: process.env.DB_DIALECT || 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: process.env.REDIS_DB || 0
  },

  // Application Configuration
  api_version: process.env.API_VERSION || 'v1'
};
