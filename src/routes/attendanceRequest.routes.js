/**
 * Attendance Request Routes
 * Employee and Admin APIs for Leave, On Duty, WFH, Short Leave, and Regularization
 */

const express = require('express');
const router = express.Router();

// Controllers
const employeeController = require('../controllers/employee/employeeAttendanceRequest.controller');
const adminController = require('../controllers/admin/adminAttendanceRequest.controller');

// Middleware (uncomment when ready)
// const authMiddleware = require('../middleware/auth.middleware');
// const adminMiddleware = require('../middleware/admin.middleware');

// Apply authentication to all routes
// router.use(authMiddleware.authenticate);

// ============================================
// EMPLOYEE ROUTES
// ============================================

/**
 * @route   POST /api/attendance/employee/leave/apply
 * @desc    Employee applies for leave
 * @access  Employee
 */
router.post('/employee/leave/apply', employeeController.applyLeave);

/**
 * @route   POST /api/attendance/employee/onduty/apply
 * @desc    Employee applies for on duty
 * @access  Employee
 */
router.post('/employee/onduty/apply', employeeController.applyOnDuty);

/**
 * @route   POST /api/attendance/employee/wfh/apply
 * @desc    Employee applies for WFH
 * @access  Employee
 */
router.post('/employee/wfh/apply', employeeController.applyWFH);

/**
 * @route   POST /api/attendance/employee/short-leave/apply
 * @desc    Employee applies for short leave
 * @access  Employee
 */
router.post('/employee/short-leave/apply', employeeController.applyShortLeave);

/**
 * @route   POST /api/attendance/employee/regularization/apply
 * @desc    Employee applies for attendance regularization
 * @access  Employee
 */
router.post('/employee/regularization/apply', employeeController.applyRegularization);

/**
 * @route   GET /api/attendance/employee/requests/my-requests
 * @desc    Get employee's own requests (all types)
 * @query   type: leave, onduty, wfh, regularization, short-leave (optional)
 * @query   status: pending, approved, rejected, withdrawn (optional)
 * @access  Employee
 */
router.get('/employee/requests/my-requests', employeeController.getMyRequests);

/**
 * @route   GET /api/attendance/employee/requests/:requestId
 * @desc    Get request details
 * @access  Employee
 */
router.get('/employee/requests/:requestId', employeeController.getRequestDetails);

/**
 * @route   POST /api/attendance/employee/requests/:requestId/withdraw
 * @desc    Withdraw a request
 * @access  Employee
 */
router.post('/employee/requests/:requestId/withdraw', employeeController.withdrawRequest);

/**
 * @route   GET /api/attendance/employee/leave/balance
 * @desc    Get employee's leave balance
 * @access  Employee
 */
router.get('/employee/leave/balance', employeeController.getLeaveBalance);

// ============================================
// ADMIN ROUTES
// ============================================

// Apply admin middleware to all admin routes
// router.use('/admin', adminMiddleware.checkAdmin);

/**
 * @route   GET /api/attendance/admin/requests
 * @desc    Get all requests (unified API for all types)
 * @query   type: leave, onduty, wfh, regularization, short-leave (optional)
 * @query   status: pending, approved, rejected, withdrawn (optional)
 * @query   employee_id: filter by employee (optional)
 * @query   from_date, to_date: date range (optional)
 * @query   limit, offset: pagination (optional)
 * @access  Admin
 *
 * @example GET /api/attendance/admin/requests?type=leave&status=pending
 * @example GET /api/attendance/admin/requests?type=onduty&employee_id=123
 * @example GET /api/attendance/admin/requests?from_date=2024-12-01&to_date=2024-12-31
 * @example GET /api/attendance/admin/requests (get all types)
 */
router.get('/admin/requests', adminController.getAllRequests);

/**
 * @route   GET /api/attendance/admin/requests/:requestId
 * @desc    Get request details (any type)
 * @access  Admin
 */
router.get('/admin/requests/:requestId', adminController.getRequestDetails);

/**
 * @route   POST /api/attendance/admin/requests/:requestId/action
 * @desc    Approve or reject a request (admin override)
 * @body    action: "approve" or "reject"
 * @body    remarks: optional remarks
 * @access  Admin
 */
router.post('/admin/requests/:requestId/action', adminController.adminActionOnRequest);

/**
 * @route   GET /api/attendance/admin/requests/dashboard
 * @desc    Get dashboard statistics for all request types
 * @query   from_date, to_date: date range (optional)
 * @access  Admin
 */
router.get('/admin/requests/dashboard', adminController.getDashboardStats);

/**
 * @route   POST /api/attendance/admin/requests/bulk-approve
 * @desc    Bulk approve multiple requests
 * @body    request_ids: array of request IDs
 * @body    remarks: optional remarks
 * @access  Admin
 */
router.post('/admin/requests/bulk-approve', adminController.bulkApprove);

/**
 * @route   POST /api/attendance/admin/requests/bulk-reject
 * @desc    Bulk reject multiple requests
 * @body    request_ids: array of request IDs
 * @body    remarks: remarks (required)
 * @access  Admin
 */
router.post('/admin/requests/bulk-reject', adminController.bulkReject);

module.exports = router;
