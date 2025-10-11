/**
 * Redis Connection Utility
 * Manages Redis client connection and provides helper functions
 */

const redis = require('redis');
const redisConfig = require('../configs/redis.config');

// Create Redis client
const redisClient = redis.createClient(redisConfig);

// Redis connection event handlers
redisClient.on('connect', () => {
  console.log('✓ Redis client connecting...');
});

redisClient.on('ready', () => {
  console.log('✓ Redis client connected successfully');
});

redisClient.on('error', (error) => {
  console.error('✗ Redis client error:', error.message);
});

redisClient.on('end', () => {
  console.log('Redis client disconnected');
});

/**
 * Connect to Redis
 * @returns {Promise<void>}
 */
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('✗ Failed to connect to Redis:', error.message);
    throw error;
  }
};

/**
 * Set key-value pair in Redis with optional expiration
 * @param {string} key - Redis key
 * @param {any} value - Value to store (will be JSON stringified)
 * @param {number} expiryInSeconds - Optional expiration time in seconds
 * @returns {Promise<string>} - Redis response
 */
const setCache = async (key, value, expiryInSeconds = null) => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    if (expiryInSeconds) {
      return await redisClient.setEx(key, expiryInSeconds, stringValue);
    } else {
      return await redisClient.set(key, stringValue);
    }
  } catch (error) {
    console.error('Redis SET error:', error.message);
    throw error;
  }
};

/**
 * Get value from Redis by key
 * @param {string} key - Redis key
 * @returns {Promise<any>} - Parsed value or null if not found
 */
const getCache = async (key) => {
  try {
    const value = await redisClient.get(key);

    if (!value) {
      return null;
    }

    // Try to parse JSON, return as-is if parsing fails
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error('Redis GET error:', error.message);
    throw error;
  }
};

/**
 * Delete key from Redis
 * @param {string} key - Redis key
 * @returns {Promise<number>} - Number of keys deleted
 */
const deleteCache = async (key) => {
  try {
    return await redisClient.del(key);
  } catch (error) {
    console.error('Redis DEL error:', error.message);
    throw error;
  }
};

/**
 * Check if key exists in Redis
 * @param {string} key - Redis key
 * @returns {Promise<boolean>} - True if key exists
 */
const existsCache = async (key) => {
  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    console.error('Redis EXISTS error:', error.message);
    throw error;
  }
};

/**
 * Set expiration on existing key
 * @param {string} key - Redis key
 * @param {number} seconds - Expiration time in seconds
 * @returns {Promise<boolean>} - True if expiration was set
 */
const expireCache = async (key, seconds) => {
  try {
    const result = await redisClient.expire(key, seconds);
    return result === 1;
  } catch (error) {
    console.error('Redis EXPIRE error:', error.message);
    throw error;
  }
};

/**
 * Disconnect Redis client
 * @returns {Promise<void>}
 */
const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log('✓ Redis client disconnected gracefully');
    }
  } catch (error) {
    console.error('✗ Error disconnecting Redis:', error.message);
    throw error;
  }
};

module.exports = {
  redisClient,
  connectRedis,
  disconnectRedis,
  setCache,
  getCache,
  deleteCache,
  existsCache,
  expireCache
};
