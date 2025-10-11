/**
 * Express Application Setup
 * Configures middleware and routes for the Express app
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

// Create Express application
const app = express();

// Security middleware - Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// CORS middleware - Enable Cross-Origin Resource Sharing
app.use(cors());

// Logging middleware - Morgan logs HTTP requests
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parsing middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to HRMS Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      onboard: 'POST /api/organization/onboard',
      organizations: 'GET /api/organization'
    }
  });
});

// 404 handler - Must be after all routes
app.use(notFoundHandler);

// Error handling middleware - Must be last
app.use(errorHandler);

module.exports = app;
