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
 * Recursively load all model files from a directory
 * @param {string} dir - Directory path to scan
 */
const loadModelsFromDirectory = (dir) => {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively load models from subdirectories
      loadModelsFromDirectory(fullPath);
    } else if (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
    ) {
      // Load the model file
      const modelModule = require(fullPath);

      // Get the model name (e.g., HrmsCompany, HrmsUserDetails)
      const modelNames = Object.keys(modelModule).filter(key =>
        key !== 'syncModel' && typeof modelModule[key] === 'function'
      );

      modelNames.forEach(modelName => {
        models[modelName] = modelModule[modelName];
      });
    }
  });
};

// Load all models from the models directory and subdirectories
loadModelsFromDirectory(__dirname);

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

    // Sync disabled - tables already exist in database
    // If you need to sync models, use migrations instead
    // await sequelize.sync({ alter: false });

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
