/**
 * Attendance Request Routes
 * Employee and Admin APIs for Leave, On Duty, WFH, Short Leave, and Regularization
 */

const express = require('express');
const router = express.Router();

// Controllers
const employeeController = require('../controllers/employee/employeeAttendanceRequest.controller');
const adminController = require('../controllers/admin/adminAttendanceRequest.controller');
const managerController = require('../controllers/manager/managerAttendanceRequest.controller');
const calendarController = require('../controllers/employee/attendanceCalendar.controller');

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

/**
 * @route   POST /api/attendance/calendar
 * @desc    Get attendance calendar with derived status (Common for Employee/Manager/Admin)
 * @body    employee_id: Employee ID (optional - for manager/admin, if not provided uses req.user.employee_id)
 * @body    from_date: Start date (YYYY-MM-DD) - default: first day of current month
 * @body    to_date: End date (YYYY-MM-DD) - default: last day of current month
 * @access  Employee/Manager/Admin
 *
 * @example POST /api/attendance/calendar with {} (Employee viewing own calendar)
 * @example POST /api/attendance/calendar with {"employee_id": 5} (Manager/Admin viewing employee 5's calendar)
 * @example POST /api/attendance/calendar with {"from_date": "2025-11-01", "to_date": "2025-11-30"}
 */
router.post('/calendar', calendarController.getAttendanceCalendar);

/**
 * @route   POST /api/attendance/calendar/summary
 * @desc    Get attendance summary (Common for Employee/Manager/Admin)
 * @body    employee_id: Employee ID (optional - for manager/admin, if not provided uses req.user.employee_id)
 * @body    from_date: Start date (YYYY-MM-DD)
 * @body    to_date: End date (YYYY-MM-DD)
 * @access  Employee/Manager/Admin
 *
 * @example POST /api/attendance/calendar/summary with {} (Employee viewing own summary)
 * @example POST /api/attendance/calendar/summary with {"employee_id": 5} (Manager/Admin viewing employee 5's summary)
 */
router.post('/calendar/summary', calendarController.getAttendanceSummary);

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

// ============================================
// MANAGER/ADMIN ROUTES - APPLY ON BEHALF
// ============================================

/**
 * @route   POST /api/attendance/manager/leave/apply
 * @desc    Manager applies for leave on behalf of employee
 * @body    target_employee_id: employee ID (required)
 * @body    leave_type, from_date, to_date, reason, etc.
 * @access  Manager
 */
router.post('/manager/leave/apply', managerController.applyLeave);

/**
 * @route   POST /api/attendance/admin/leave/apply
 * @desc    Admin applies for leave on behalf of employee
 * @body    target_employee_id: employee ID (required)
 * @body    leave_type, from_date, to_date, reason, etc.
 * @access  Admin
 */
router.post('/admin/leave/apply', managerController.applyLeave);

/**
 * @route   POST /api/attendance/manager/onduty/apply
 * @desc    Manager applies for on duty on behalf of employee
 * @body    target_employee_id: employee ID (required)
 * @body    from_date, to_date, from_time, to_time, purpose, location, etc.
 * @access  Manager
 */
router.post('/manager/onduty/apply', managerController.applyOnDuty);

/**
 * @route   POST /api/attendance/admin/onduty/apply
 * @desc    Admin applies for on duty on behalf of employee
 * @body    target_employee_id: employee ID (required)
 * @access  Admin
 */
router.post('/admin/onduty/apply', managerController.applyOnDuty);

/**
 * @route   POST /api/attendance/manager/wfh/apply
 * @desc    Manager applies for WFH on behalf of employee
 * @body    target_employee_id: employee ID (required)
 * @body    from_date, to_date, day_type, reason, work_plan, etc.
 * @access  Manager
 */
router.post('/manager/wfh/apply', managerController.applyWFH);

/**
 * @route   POST /api/attendance/admin/wfh/apply
 * @desc    Admin applies for WFH on behalf of employee
 * @body    target_employee_id: employee ID (required)
 * @access  Admin
 */
router.post('/admin/wfh/apply', managerController.applyWFH);

/**
 * @route   POST /api/attendance/manager/short-leave/apply
 * @desc    Manager applies for short leave on behalf of employee
 * @body    target_employee_id: employee ID (required)
 * @body    leave_date, from_time, to_time, reason, etc.
 * @access  Manager
 */
router.post('/manager/short-leave/apply', managerController.applyShortLeave);

/**
 * @route   POST /api/attendance/admin/short-leave/apply
 * @desc    Admin applies for short leave on behalf of employee
 * @body    target_employee_id: employee ID (required)
 * @access  Admin
 */
router.post('/admin/short-leave/apply', managerController.applyShortLeave);

/**
 * @route   POST /api/attendance/manager/regularization/apply
 * @desc    Manager applies for regularization on behalf of employee
 * @body    target_employee_id: employee ID (required)
 * @body    attendance_date, punch_in, punch_out, reason, etc.
 * @access  Manager
 */
router.post('/manager/regularization/apply', managerController.applyRegularization);

/**
 * @route   POST /api/attendance/admin/regularization/apply
 * @desc    Admin applies for regularization on behalf of employee
 * @body    target_employee_id: employee ID (required)
 * @access  Admin
 */
router.post('/admin/regularization/apply', managerController.applyRegularization);

/**
 * @route   GET /api/attendance/manager/leave/balance/:employee_id
 * @desc    Manager gets leave balance for an employee
 * @param   employee_id: employee ID
 * @access  Manager
 */
router.get('/manager/leave/balance/:employee_id', managerController.getEmployeeLeaveBalance);

/**
 * @route   GET /api/attendance/admin/leave/balance/:employee_id
 * @desc    Admin gets leave balance for an employee
 * @param   employee_id: employee ID
 * @access  Admin
 */
router.get('/admin/leave/balance/:employee_id', managerController.getEmployeeLeaveBalance);

module.exports = router;
