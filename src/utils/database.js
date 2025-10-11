/**
 * Database Connection Utility
 * Initializes and manages Sequelize instance for MySQL connection
 * Provides centralized MySqlUtil instance
 */

const { Sequelize } = require('sequelize');
const envConfig = require('../configs/env.config');
const MySqlUtil = require('./MySqlUtil');

// Initialize Sequelize with MySQL configuration
const sequelize = new Sequelize(
  envConfig.database.name,
  envConfig.database.user,
  envConfig.database.password,
  {
    host: envConfig.database.host,
    port: envConfig.database.port,
    dialect: envConfig.database.dialect,
    pool: envConfig.database.pool,
    logging: envConfig.database.logging,
    timezone: '+00:00', // Store as UTC
    dialectOptions: {
      timezone: '+00:00', // Read as UTC
      dateStrings: true, // Return dates as strings
      typeCast: true, // Enable type casting
      multipleStatements: true // Allow multiple SQL statements in a single query
    }
  }
);

// Create centralized MySqlUtil instance
const db = new MySqlUtil(sequelize);

/**
 * Test database connection
 * @returns {Promise<boolean>} - Returns true if connection is successful
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to database:', error.message);
    return false;
  }
};

/**
 * Execute raw SQL query
 * Example of using sequelize.query for raw MySQL queries
 * @param {string} query - Raw SQL query
 * @param {object} options - Query options
 * @returns {Promise} - Query results
 */
const executeRawQuery = async (query, options = {}) => {
  try {
    const [results, metadata] = await sequelize.query(query, options);
    return { results, metadata };
  } catch (error) {
    console.error('Raw query execution error:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  db, // Centralized MySqlUtil instance
  testConnection,
  executeRawQuery
};
