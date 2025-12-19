/**
 * Leave Balance Routes
 */

const express = require('express');
const router = express.Router();
const leaveBalanceController = require('../controllers/leaveBalance.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get saved leave balance from HrmsEmployeeLeaveBalance table
router.get('/saved/:employeeId', leaveBalanceController.getSavedLeaveBalance);

// Get leave ledger history
router.get('/ledger/:employeeId', leaveBalanceController.getLeaveLedger);

// Get employee leave balance (calculated from ledger)
router.get('/:employeeId', leaveBalanceController.getEmployeeLeaveBalance);

// Process leave transaction (credit, debit, reverse, etc.)
router.post('/transaction', leaveBalanceController.processLeaveTransaction);

module.exports = router;
