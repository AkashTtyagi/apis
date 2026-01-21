/**
 * Expense Policy Routes
 * Routes for expense policy management
 */

const express = require('express');
const router = express.Router();
const expensePolicyController = require('../../controllers/admin/expensePolicy.controller');

/**
 * Create a new expense policy
 * POST /api/expense/admin/policies/create
 */
router.post('/create', expensePolicyController.createPolicy);

/**
 * Get all policies with filters
 * POST /api/expense/admin/policies/list
 */
router.post('/list', expensePolicyController.getAllPolicies);

/**
 * Get policy details
 * POST /api/expense/admin/policies/details
 */
router.post('/details', expensePolicyController.getPolicyDetails);

/**
 * Update policy
 * POST /api/expense/admin/policies/update
 */
router.post('/update', expensePolicyController.updatePolicy);

/**
 * Delete policy (soft delete)
 * POST /api/expense/admin/policies/delete
 */
router.post('/delete', expensePolicyController.deletePolicy);

/**
 * Check policy usage before deletion
 * POST /api/expense/admin/policies/check-usage
 */
router.post('/check-usage', expensePolicyController.checkUsage);

/**
 * Toggle policy status (active/inactive)
 * POST /api/expense/admin/policies/toggle-status
 */
router.post('/toggle-status', expensePolicyController.toggleStatus);

/**
 * Set a policy as the default policy
 * POST /api/expense/admin/policies/set-default
 */
router.post('/set-default', expensePolicyController.setDefaultPolicy);

// ==================== APPLICABILITY ROUTES ====================

/**
 * Manage policy applicability rules
 * POST /api/expense/admin/policies/manage-applicability
 *
 * Body:
 * {
 *   "policy_id": 1,
 *   "applicability": [
 *     {
 *       "applicability_type": "department",       // company, entity, department, sub_department, designation, grade, level, location, employee_type, employee
 *       "applicability_value": "1,2,3",           // comma-separated IDs or null for all
 *       "advanced_applicability_type": "none",    // none, employee_type, branch, region, cost_center, project, grade, joining_date_range
 *       "advanced_applicability_value": null,
 *       "is_excluded": false,                     // true = exclude these from policy
 *       "priority": 0,
 *       "is_active": true
 *     }
 *   ]
 * }
 */
router.post('/manage-applicability', expensePolicyController.manageApplicability);

// ==================== EMPLOYEE POLICY LOOKUP ROUTES ====================

/**
 * Find applicable policy for an employee
 * POST /api/expense/admin/policies/find-for-employee
 *
 * Body:
 * {
 *   "employee_id": 1,
 *   "department_id": 2,
 *   "designation_id": 3,
 *   "grade_id": 4,
 *   "level_id": 5,
 *   "location_id": 6,
 *   "entity_id": 7,
 *   "employee_type_id": 8
 * }
 */
router.post('/find-for-employee', expensePolicyController.findPolicyForEmployee);

/**
 * Get allowed categories for an employee based on their policy
 * POST /api/expense/admin/policies/allowed-categories
 *
 * Body: Same as find-for-employee
 *
 * Response:
 * {
 *   "allowed_categories": [1, 2, 3] or null,
 *   "all_categories_allowed": true/false
 * }
 */
router.post('/allowed-categories', expensePolicyController.getAllowedCategories);

module.exports = router;
