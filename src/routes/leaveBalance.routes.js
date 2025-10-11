/**
 * Leave Balance Routes
 */

const express = require('express');
const router = express.Router();
const leaveBalanceController = require('../controllers/leaveBalance.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get employee leave balance
router.get('/:employeeId', leaveBalanceController.getEmployeeLeaveBalance);

// Process leave transaction (credit, debit, reverse, etc.)
router.post('/transaction', leaveBalanceController.processLeaveTransaction);

module.exports = router;
