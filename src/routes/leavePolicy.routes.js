/**
 * Leave Policy Routes
 */

const express = require('express');
const router = express.Router();
const leavePolicyController = require('../controllers/leavePolicy.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Leave policy CRUD routes
router.post('/create', leavePolicyController.createLeavePolicy);
router.post('/update', leavePolicyController.updateLeavePolicy);
router.get('/', leavePolicyController.getLeavePolicies);
router.get('/:id', leavePolicyController.getLeavePolicyById);
router.delete('/:id', leavePolicyController.deleteLeavePolicy);

// Toggle leave type in policy (activate/deactivate without deleting)
router.patch('/:policyId/leave-types/:leaveTypeId/toggle', leavePolicyController.toggleLeaveTypeInPolicy);

module.exports = router;
