/**
 * ESS Policy Routes
 * API routes for policy management by employees (Employee Self Service)
 */

const express = require('express');
const router = express.Router();
const essPolicyController = require('../../controllers/policy/ess.policy.controller');

// =====================================================
// EMPLOYEE POLICY VIEWING ROUTES
// =====================================================

// Get employee's assigned policies (all)
router.post('/list', essPolicyController.getEmployeeAssignedPolicies);

// Get employee's pending policies
router.post('/pending', essPolicyController.getEmployeePendingPolicies);

// Get employee's acknowledged policies
router.post('/acknowledged', essPolicyController.getEmployeeAcknowledgedPolicies);

// Get single policy details
router.post('/details', essPolicyController.getEmployeePolicyDetails);

// =====================================================
// POLICY ACKNOWLEDGMENT ROUTES
// =====================================================

// Acknowledge policy
router.post('/acknowledge', essPolicyController.acknowledgePolicyByEmployee);

// =====================================================
// ESS ACCESS CHECKING ROUTES
// =====================================================

// Check if employee ESS is blocked
router.post('/check-block', essPolicyController.checkEmployeeESSBlocked);

// Get employee's ESS access summary
router.post('/access-summary', essPolicyController.getEmployeeESSAccessSummary);

// =====================================================
// POLICY CATEGORIES ROUTES (ESS VIEW)
// =====================================================

// Get active policy categories
router.post('/categories/list', essPolicyController.getActivePolicyCategories);

module.exports = router;
