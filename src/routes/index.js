/**
 * Routes Index
 * Central router configuration that combines all route modules
 */

const express = require('express');
const router = express.Router();

const onboardingRoutes = require('./onboarding.routes');
const authRoutes = require('./auth.routes');
const employeeRoutes = require('./employee.routes');
const templateRoutes = require('./template.routes');
const departmentRoutes = require('./department.routes');
const subDepartmentRoutes = require('./subDepartment.routes');
const leaveTypeRoutes = require('./leaveType.routes');
const leavePolicyRoutes = require('./leavePolicy.routes');
const leaveBalanceRoutes = require('./leaveBalance.routes');
const leaveCreditCronRoutes = require('./cron/leaveCreditCron.routes');

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

// Employee routes
router.use('/employees', employeeRoutes);

// Template routes
router.use('/templates', templateRoutes);

// Department routes (organization department mappings - all POST)
router.use('/departments', departmentRoutes);

// Sub-department routes (all POST)
router.use('/sub-departments', subDepartmentRoutes);

// Leave management routes
router.use('/leave-types', leaveTypeRoutes);
router.use('/leave-policies', leavePolicyRoutes);
router.use('/leave-balance', leaveBalanceRoutes);
router.use('/cron/leave-credit', leaveCreditCronRoutes);

module.exports = router;
