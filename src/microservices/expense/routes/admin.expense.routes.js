/**
 * Admin Expense Routes
 * Main router that combines all expense admin route modules
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middlewares/auth.middleware');

// Import route modules
const locationGroupRoutes = require('./admin/locationGroup.routes');
const expenseCategoryRoutes = require('./admin/expenseCategory.routes');
const currencyRoutes = require('./admin/currency.routes');
const expenseWorkflowRoutes = require('./admin/expenseWorkflow.routes');
const expensePolicyRoutes = require('./admin/expensePolicy.routes');
const expenseSettingsRoutes = require('./admin/expenseSettings.routes');

// Apply authentication middleware to all routes
router.use(authenticate);

// Mount route modules
router.use('/location-groups', locationGroupRoutes);
router.use('/categories', expenseCategoryRoutes);
router.use('/currencies', currencyRoutes);
router.use('/workflows', expenseWorkflowRoutes);
router.use('/policies', expensePolicyRoutes);
router.use('/settings', expenseSettingsRoutes);

module.exports = router;
