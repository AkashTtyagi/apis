/**
 * Models Index
 * Automatically loads and initializes all models from the models directory
 */

const fs = require('fs');
const path = require('path');
const { sequelize } = require('../utils/database');

const basename = path.basename(__filename);
const models = {};

/**
 * Dynamically load all model files from the current directory
 * Skips index.js (this file)
 */
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const modelModule = require(path.join(__dirname, file));

    // Get the model name (e.g., HrmsCompany, HrmsUserDetails)
    const modelNames = Object.keys(modelModule).filter(key =>
      key !== 'syncModel' && typeof modelModule[key] === 'function'
    );

    modelNames.forEach(modelName => {
      models[modelName] = modelModule[modelName];
    });
  });

/**
 * Initialize all models
 * Syncs all models with database automatically
 */
const initializeModels = async () => {
  try {
    console.log('📦 Initializing database models...');

    // Initialize associations for all models
    Object.keys(models).forEach(modelName => {
      if (models[modelName].associate) {
        models[modelName].associate(models);
      }
    });

    console.log('✓ Model associations initialized');

    // Sync all models with the database
    // alter: false means it won't modify existing tables
    // Set to true in development if you want auto-schema updates
    await sequelize.sync({ alter: false });

    console.log('✓ All models initialized successfully');
    console.log(`✓ Total models loaded: ${Object.keys(models).length}`);
  } catch (error) {
    console.error('✗ Model initialization error:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  ...models, // Export all models dynamically
  initializeModels
};
