/**
 * ESS Attendance Controller
 * Handles HTTP requests for employee attendance operations
 * Microservice: ESS (Employee Self Service)
 */

const attendanceService = require('../services/attendance.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

/**
 * Handle Web Punch (Clock IN/OUT)
 * POST /api/ess/attendance/web-punch
 *
 * Body: {
 *   device_id: string (optional),
 *   device_name: string (optional),
 *   device_info: object (optional),
 *   photo_url: string (optional),
 *   photo_verified: boolean (optional)
 * }
 */
const handleWebPunch = async (req, res, next) => {
    try {
        const employee_id = req.user.employee_id;  // From auth middleware
        const company_id = req.user.company_id;

        const punchData = {
            device_id: req.body.device_id || null,
            device_name: req.body.device_name || null,
            device_info: req.body.device_info || null,
            ip_address: req.ip || req.connection.remoteAddress || null,
            user_agent: req.headers['user-agent'] || null,
            photo_url: req.body.photo_url || null,
            photo_verified: req.body.photo_verified || false
        };

        const result = await attendanceService.handleWebPunch(employee_id, company_id, punchData);

        if (result.action === 'in') {
            return sendCreated(res, result.message, result.data);
        } else {
            return sendSuccess(res, result.message, result.data);
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Handle Mobile Punch (Clock IN/OUT)
 * POST /api/ess/attendance/mobile-punch
 *
 * Body: {
 *   location: { latitude, longitude, accuracy, address } (required),
 *   device_id: string (optional),
 *   device_name: string (optional),
 *   device_info: object (optional),
 *   photo_url: string (optional),
 *   photo_verified: boolean (optional),
 *   is_outside_geofence: boolean (optional)
 * }
 */
const handleMobilePunch = async (req, res, next) => {
    try {
        const employee_id = req.user.employee_id;  // From auth middleware
        const company_id = req.user.company_id;

        const punchData = {
            location: req.body.location,  // Required for mobile
            device_id: req.body.device_id || null,
            device_name: req.body.device_name || null,
            device_info: req.body.device_info || null,
            ip_address: req.ip || req.connection.remoteAddress || null,
            user_agent: req.headers['user-agent'] || null,
            photo_url: req.body.photo_url || null,
            photo_verified: req.body.photo_verified || false,
            is_outside_geofence: req.body.is_outside_geofence || false
        };

        const result = await attendanceService.handleMobilePunch(employee_id, company_id, punchData);

        if (result.action === 'in') {
            return sendCreated(res, result.message, result.data);
        } else {
            return sendSuccess(res, result.message, result.data);
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Get Today's Punch Status
 * POST /api/ess/attendance/today
 *
 * Returns current punch status, all punches, and next action
 */
const getTodayPunchStatus = async (req, res, next) => {
    try {
        const employee_id = req.user.employee_id;
        const company_id = req.user.company_id;

        const status = await attendanceService.getTodayPunchStatus(employee_id, company_id);

        return sendSuccess(res, 'Today\'s punch status retrieved successfully', status);
    } catch (error) {
        next(error);
    }
};

/**
 * Get Punch History
 * POST /api/ess/attendance/history
 *
 * Body: {
 *   from_date: 'YYYY-MM-DD',  // optional, default: 30 days ago
 *   to_date: 'YYYY-MM-DD',    // optional, default: today
 *   limit: number,            // optional, default: 50
 *   offset: number            // optional, default: 0
 * }
 */
const getPunchHistory = async (req, res, next) => {
    try {
        const employee_id = req.user.employee_id;
        const company_id = req.user.company_id;

        const filters = {
            from_date: req.body.from_date,
            to_date: req.body.to_date,
            limit: req.body.limit,
            offset: req.body.offset
        };

        const history = await attendanceService.getPunchHistory(employee_id, company_id, filters);

        return sendSuccess(res, 'Punch history retrieved successfully', history);
    } catch (error) {
        next(error);
    }
};

/**
 * Push Biometric Punch
 * POST /api/ess/attendance/biometric-push
 *
 * Body: {
 *   biometric_device_id: string (required) - Client's unique biometric ID,
 *   punch_datetime: Date (required) - Punch timestamp,
 *   is_utc: boolean (optional) - Is datetime in UTC?,
 *   device_id: string (optional) - Biometric device ID,
 *   device_name: string (optional) - Biometric device name,
 *   company_id: number (required) - Company ID
 * }
 */
const pushBiometricPunch = async (req, res, next) => {
    try {
        const biometricData = {
            biometric_device_id: req.body.biometric_device_id,
            punch_datetime: req.body.punch_datetime,
            is_utc: req.body.is_utc || false,
            device_id: req.body.device_id || null,
            device_name: req.body.device_name || null,
            company_id: req.body.company_id
        };

        const result = await attendanceService.pushBiometricPunch(biometricData);

        return sendCreated(res, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

/**
 * Process Punch Logs (Cron Job)
 * POST /api/ess/attendance/process-punches
 *
 * Body: {
 *   company_id: number (optional),
 *   employee_id: number (optional),
 *   date_from: 'YYYY-MM-DD' (optional, default: yesterday),
 *   date_to: 'YYYY-MM-DD' (optional, default: today)
 * }
 */
const processPunchLogs = async (req, res, next) => {
    try {
        const filters = {
            company_id: req.body.company_id || null,
            employee_id: req.body.employee_id || null,
            date_from: req.body.date_from || null,
            date_to: req.body.date_to || null
        };

        const result = await attendanceService.processPunchLogs(filters);

        return sendSuccess(res, result.message, {
            processed_count: result.processed_count,
            total_punches: result.total_punches
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    handleWebPunch,
    handleMobilePunch,
    pushBiometricPunch,
    processPunchLogs,
    getTodayPunchStatus,
    getPunchHistory
};
