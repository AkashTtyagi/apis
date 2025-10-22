/**
 * Admin Policy Routes
 * API routes for policy management by administrators
 */

const express = require('express');
const router = express.Router();
const adminPolicyController = require('../../controllers/policy/admin.policy.controller');

// =====================================================
// POLICY CATEGORY ROUTES
// =====================================================

// Create policy category
router.post('/categories/create', adminPolicyController.createPolicyCategory);

// Get categories by company
router.post('/categories/list', adminPolicyController.getCategoriesByCompany);

// Update policy category
router.post('/categories/update', adminPolicyController.updatePolicyCategory);

// Delete policy category
router.post('/categories/delete', adminPolicyController.deletePolicyCategory);

// =====================================================
// POLICY MANAGEMENT ROUTES
// =====================================================

// Create policy
router.post('/create', adminPolicyController.createPolicy);

// Get policies by company
router.post('/list', adminPolicyController.getPoliciesByCompany);

// Get policy details
router.post('/details', adminPolicyController.getPolicyById);

// Update policy
router.post('/update', adminPolicyController.updatePolicy);

// Delete policy
router.post('/delete', adminPolicyController.deletePolicy);

// =====================================================
// POLICY VERSION ROUTES
// =====================================================

// Create policy version
router.post('/version/create', adminPolicyController.createPolicyVersion);

// Publish policy version
router.post('/version/publish', adminPolicyController.publishPolicyVersion);

// Rollback policy version
router.post('/version/rollback', adminPolicyController.rollbackPolicyVersion);

// Get all versions for a policy
router.post('/version/list', adminPolicyController.getPolicyVersions);

// =====================================================
// POLICY APPLICABILITY ROUTES
// =====================================================

// Set policy applicability rules
router.post('/applicability/set', adminPolicyController.setPolicyApplicability);

// Get policy applicability rules
router.post('/applicability/get', adminPolicyController.getPolicyApplicability);

// =====================================================
// POLICY ASSIGNMENT ROUTES
// =====================================================

// Assign policy to employees
router.post('/assign', adminPolicyController.assignPolicyToEmployees);

// =====================================================
// ANALYTICS & REPORTS ROUTES
// =====================================================

// Get policy acknowledgment statistics
router.post('/analytics/stats', adminPolicyController.getPolicyAcknowledgmentStats);

// Get employees with pending acknowledgments
router.post('/analytics/pending-employees', adminPolicyController.getEmployeesWithPendingAcknowledgments);

// Send manual reminder
router.post('/send-reminder', adminPolicyController.sendManualReminder);

module.exports = router;
