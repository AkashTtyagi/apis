/**
 * Leave Type Routes
 */

const express = require('express');
const router = express.Router();
const leaveTypeController = require('../controllers/leaveType.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Leave type CRUD routes
router.post('/', leaveTypeController.createLeaveType);
router.put('/:id', leaveTypeController.updateLeaveType);
router.get('/', leaveTypeController.getLeaveTypes);
router.get('/:id', leaveTypeController.getLeaveTypeById);
router.delete('/:id', leaveTypeController.deleteLeaveType);

// Audit log route
router.get('/:id/audit-logs', leaveTypeController.getLeaveTypeAuditLogs);

module.exports = router;
