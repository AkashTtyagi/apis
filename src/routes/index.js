/**
 * Routes Index
 * Central router configuration that combines all route modules
 */

const express = require('express');
const router = express.Router();

const onboardingRoutes = require('./onboarding.routes');
const authRoutes = require('./auth.routes');
const companyRoutes = require('./company.routes');
const employeeRoutes = require('./employee.routes');
const templateRoutes = require('./template.routes');
const departmentRoutes = require('./department.routes');
const subDepartmentRoutes = require('./subDepartment.routes');
const gradeRoutes = require('./grade.routes');
const designationRoutes = require('./designation.routes');
const levelRoutes = require('./level.routes');
const leaveTypeRoutes = require('./leaveType.routes');
const leavePolicyRoutes = require('./leavePolicy.routes');
const leaveBalanceRoutes = require('./leaveBalance.routes');
const leaveCreditCronRoutes = require('./cron/leaveCreditCron.routes');
const masterRoutes = require('./master.routes');
const attendanceRequestRoutes = require('./attendanceRequest.routes');
const workflowRoutes = require('./workflow.routes');
const shiftRoutes = require('./shift.routes');
const holidayRoutes = require('./holiday.routes');
const rosterRoutes = require('./roster.routes');
const rotatingShiftRoutes = require('./rotatingShift.routes');
const shiftSwapRoutes = require('./shiftSwap.routes');

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'HRMS Backend API is running',
        timestamp: new Date().toISOString()
    });
});

// Authentication routes
router.use('/auth', authRoutes);

// Onboarding route (combined company + user creation)
router.use('/onboarding', onboardingRoutes);

// Company routes
router.use('/company', companyRoutes);

// Employee routes
router.use('/employees', employeeRoutes);

// Template routes
router.use('/templates', templateRoutes);

// Department routes (organization department mappings - all POST)
router.use('/departments', departmentRoutes);

// Sub-department routes (all POST)
router.use('/sub-departments', subDepartmentRoutes);

// Grade routes (all POST)
router.use('/grades', gradeRoutes);

// Designation routes (all POST)
router.use('/designations', designationRoutes);

// Level routes (all POST)
router.use('/levels', levelRoutes);

// Leave management routes
router.use('/leave-types', leaveTypeRoutes);
router.use('/leave-policies', leavePolicyRoutes);
router.use('/leave-balance', leaveBalanceRoutes);
router.use('/cron/leave-credit', leaveCreditCronRoutes);

// Master data routes (unified endpoint for all master_select fields)
router.use('/master', masterRoutes);

// Attendance request routes (Leave, On Duty, WFH, Short Leave, Regularization)
router.use('/attendance', attendanceRequestRoutes);

// Workflow configuration routes
router.use('/workflows', workflowRoutes);

// Shift management routes
router.use('/shifts', shiftRoutes);

// Holiday management routes (holiday bank + holiday policy)
router.use('/holiday', holidayRoutes);

// Roster management routes (roster creation and employee assignment)
router.use('/roster', rosterRoutes);

// Rotating shift routes (frequency-based rotation patterns)
router.use('/rotating-shift', rotatingShiftRoutes);

// Shift swap routes (employee-to-employee shift swap with workflow)
router.use('/shift-swap', shiftSwapRoutes);

module.exports = router;
