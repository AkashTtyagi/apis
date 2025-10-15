/**
 * Server Entry Point
 * Initializes database, Redis, and starts the Express server
 */

const app = require('./app');
const envConfig = require('./configs/env.config');
const { testConnection, sequelize } = require('./utils/database');
const { connectRedis, disconnectRedis } = require('./utils/redis');
const { initializeModels } = require('./models');
const { startLeaveCreditScheduler, stopLeaveCreditScheduler } = require('./crons/leaveCreditScheduler');
const { logError } = require('./utils/errorLogger');

const PORT = envConfig.port;
let leaveCreditCronTask = null; // Store cron task reference

/**
 * Initialize application
 * Connects to database and Redis, then starts the server
 */
const startServer = async () => {
  try {
    console.log('🚀 Starting HRMS Backend Server...\n');

    // Test database connection
    console.log('📊 Connecting to MySQL database...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Initialize models and sync with database
    console.log('\n📦 Initializing database models...');
    await initializeModels();

    // Connect to Redis
    console.log('\n🔴 Connecting to Redis...');
    await connectRedis();

    // Start leave credit cron scheduler
    console.log('\n⏰ Starting leave credit cron scheduler...');
    //leaveCreditCronTask = startLeaveCreditScheduler();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`\n✅ Server is running successfully!`);
      console.log(`📍 Environment: ${envConfig.node_env}`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`\n💡 Ready to accept requests!\n`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      // Close server
      server.close(async () => {
        console.log('✓ HTTP server closed');

        try {
          // Stop cron scheduler
          if (leaveCreditCronTask) {
            stopLeaveCreditScheduler(leaveCreditCronTask);
            console.log('✓ Cron scheduler stopped');
          }

          // Close database connection
          await sequelize.close();
          console.log('✓ Database connection closed');

          // Disconnect Redis
          await disconnectRedis();
          console.log('✓ Redis connection closed');

          console.log('✓ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logError(error, 'Graceful Shutdown');
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logError(error, 'Server Startup');
    process.exit(1);
  }
};

// Start the server
startServer();
