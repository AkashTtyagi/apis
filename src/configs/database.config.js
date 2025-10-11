/**
 * Database Configuration for Sequelize
 * Exports configuration object for Sequelize initialization
 */

const envConfig = require('./env.config');

module.exports = {
  development: {
    username: envConfig.database.user,
    password: envConfig.database.password,
    database: envConfig.database.name,
    host: envConfig.database.host,
    port: envConfig.database.port,
    dialect: envConfig.database.dialect,
    pool: envConfig.database.pool,
    logging: envConfig.database.logging
  },
  production: {
    username: envConfig.database.user,
    password: envConfig.database.password,
    database: envConfig.database.name,
    host: envConfig.database.host,
    port: envConfig.database.port,
    dialect: envConfig.database.dialect,
    pool: envConfig.database.pool,
    logging: false
  }
};
