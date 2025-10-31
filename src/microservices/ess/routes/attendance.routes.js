/**
 * ESS Attendance Routes
 * Employee Self Service - Clock IN/OUT operations
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

/**
 * Push Biometric Punch (No Authentication)
 * POST /api/ess/attendance/biometric-push
 * Biometric device pushes punch data
 * Only saves to HrmsPunchLog (does not update daily attendance)
 */
router.post('/biometric-push', attendanceController.pushBiometricPunch);

/**
 * Process Punch Logs - Cron Job (No Authentication)
 * POST /api/ess/attendance/process-punches
 * Processes unlinked biometric punches and updates daily attendance
 * Note: This should be called by cron job or admin
 */
router.post('/process-punches', attendanceController.processPunchLogs);

// Apply authentication middleware to remaining routes
router.use(authenticate);

/**
 * Web Punch (Clock IN/OUT)
 * POST /api/ess/attendance/web-punch
 * Auto-detects IN/OUT based on daily attendance entry
 * No location validation required
 */
router.post('/web-punch', attendanceController.handleWebPunch);

/**
 * Mobile Punch (Clock IN/OUT)
 * POST /api/ess/attendance/mobile-punch
 * Auto-detects IN/OUT based on daily attendance entry
 * Requires location (latitude, longitude)
 */
router.post('/mobile-punch', attendanceController.handleMobilePunch);

/**
 * Get Today's Punch Status
 * POST /api/ess/attendance/today
 * Returns current status, punches, and next action
 */
router.post('/today', attendanceController.getTodayPunchStatus);

/**
 * Get Punch History
 * POST /api/ess/attendance/history
 * Returns punch log with date range filter
 */
router.post('/history', attendanceController.getPunchHistory);

module.exports = router;
