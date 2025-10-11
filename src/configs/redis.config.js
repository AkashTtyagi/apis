/**
 * Redis Configuration
 * Defines Redis connection settings
 */

const envConfig = require('./env.config');

module.exports = {
  socket: {
    host: envConfig.redis.host,
    port: envConfig.redis.port
  },
  password: envConfig.redis.password || undefined,
  database: envConfig.redis.db
};
