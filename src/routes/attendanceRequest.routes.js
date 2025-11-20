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

// Middleware
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

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
 * @route   POST /api/attendance/employee/requests/my-requests
 * @desc    Get employee's own requests (all types)
 * @body    request_type: 1=leave, 2=onduty, 3=wfh, 4=regularization, 5=short-leave (optional)
 * @body    status: pending, approved, rejected, withdrawn (optional)
 * @body    from_date: YYYY-MM-DD (optional)
 * @body    to_date: YYYY-MM-DD (optional)
 * @body    limit: number (optional, default: 20)
 * @body    offset: number (optional, default: 0)
 * @access  Employee
 */
router.post('/employee/requests/my-requests', employeeController.getMyRequests);

/**
 * @route   POST /api/attendance/employee/requests/details
 * @desc    Get request details
 * @body    request_id: number (required)
 * @access  Employee
 */
router.post('/employee/requests/details', employeeController.getRequestDetails);

/**
 * @route   POST /api/attendance/employee/requests/withdraw
 * @desc    Withdraw a request
 * @body    request_id: number (required)
 * @body    withdrawal_reason: string (optional)
 * @access  Employee
 */
router.post('/employee/requests/withdraw', employeeController.withdrawRequest);

/**
 * @route   POST /api/attendance/employee/leave/balance
 * @desc    Get employee's leave balance
 * @body    {} (empty body - uses logged-in employee)
 * @access  Employee
 */
router.post('/employee/leave/balance', employeeController.getLeaveBalance);

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
 * @route   POST /api/attendance/admin/requests/list
 * @desc    Get all requests (unified API for all types)
 * @body    request_type: 1=leave, 2=onduty, 3=wfh, 4=regularization, 5=short-leave (optional)
 * @body    status: pending, approved, rejected, withdrawn (optional)
 * @body    employee_id: number (optional)
 * @body    department_id: number (optional)
 * @body    manager_id: number (optional)
 * @body    leave_type: string (optional, for leave requests)
 * @body    from_date: YYYY-MM-DD (optional)
 * @body    to_date: YYYY-MM-DD (optional)
 * @body    applied_by_role: employee, manager, admin (optional)
 * @body    search: string (optional - searches request_number, employee_name)
 * @body    limit: number (optional, default: 50)
 * @body    offset: number (optional, default: 0)
 * @body    sort_by: applied_date, from_date, status (optional)
 * @body    sort_order: asc, desc (optional)
 * @access  Admin
 */
router.post('/admin/requests/list', adminController.getAllRequests);

/**
 * @route   POST /api/attendance/admin/requests/details
 * @desc    Get request details (any type)
 * @body    request_id: number (required)
 * @access  Admin
 */
router.post('/admin/requests/details', adminController.getRequestDetails);

/**
 * @route   POST /api/attendance/admin/requests/action
 * @desc    Approve or reject a request (admin override)
 * @body    request_id: number (required)
 * @body    action: "approve" or "reject" (required)
 * @body    remarks: string (optional for approve, required for reject)
 * @access  Admin
 */
router.post('/admin/requests/action', adminController.adminActionOnRequest);

/**
 * @route   POST /api/attendance/admin/requests/dashboard
 * @desc    Get dashboard statistics for all request types
 * @body    from_date: YYYY-MM-DD (optional)
 * @body    to_date: YYYY-MM-DD (optional)
 * @access  Admin
 */
router.post('/admin/requests/dashboard', adminController.getDashboardStats);

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
 * @route   POST /api/attendance/manager/leave/balance
 * @desc    Manager gets leave balance for an employee
 * @body    employee_id: number (required)
 * @access  Manager
 */
router.post('/manager/leave/balance', managerController.getEmployeeLeaveBalance);

/**
 * @route   POST /api/attendance/admin/leave/balance
 * @desc    Admin gets leave balance for an employee
 * @body    employee_id: number (required)
 * @access  Admin
 */
router.post('/admin/leave/balance', managerController.getEmployeeLeaveBalance);

module.exports = router;
