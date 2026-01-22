/**
 * Expense Settings Controller
 * Admin endpoints for managing expense module settings
 */

const expenseSettingsService = require('../../services/expenseSettings.service');

// ==================== GENERAL SETTINGS ====================

/**
 * Get expense settings for company
 */
const getSettings = async (req, res) => {
    try {
        const { company_id } = req.user;

        const settings = await expenseSettingsService.getSettings(company_id);

        res.status(200).json({
            success: true,
            message: 'Settings retrieved successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error in getSettings:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve settings'
        });
    }
};

/**
 * Update expense settings
 */
const updateSettings = async (req, res) => {
    try {
        const { company_id, user_id } = req.user;
        const settingsData = req.body;

        const settings = await expenseSettingsService.updateSettings(
            company_id,
            settingsData,
            user_id
        );

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error in updateSettings:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update settings'
        });
    }
};

/**
 * Update specific settings section
 */
const updateSettingsSection = async (req, res) => {
    try {
        const { company_id, user_id } = req.user;
        const { section } = req.params;
        const sectionData = req.body;

        const validSections = [
            'general',
            'submission_window',
            'date_time',
            'mileage',
            'per_diem',
            'receipt',
            'violation',
            'payment',
            'notification',
            'audit',
            'integration',
            'ui'
        ];

        if (!validSections.includes(section)) {
            return res.status(400).json({
                success: false,
                message: `Invalid section. Valid sections are: ${validSections.join(', ')}`
            });
        }

        const settings = await expenseSettingsService.updateSettingsSection(
            company_id,
            section,
            sectionData,
            user_id
        );

        res.status(200).json({
            success: true,
            message: `${section} settings updated successfully`,
            data: settings
        });
    } catch (error) {
        console.error('Error in updateSettingsSection:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update settings section'
        });
    }
};

// ==================== MILEAGE RATES ====================

/**
 * Get all mileage rates
 */
const getMileageRates = async (req, res) => {
    try {
        const { company_id } = req.user;
        const filters = {
            vehicle_type: req.query.vehicle_type,
            is_active: req.query.is_active !== undefined ? parseInt(req.query.is_active) : undefined
        };

        const rates = await expenseSettingsService.getMileageRates(company_id, filters);

        res.status(200).json({
            success: true,
            message: 'Mileage rates retrieved successfully',
            data: rates,
            count: rates.length
        });
    } catch (error) {
        console.error('Error in getMileageRates:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve mileage rates'
        });
    }
};

/**
 * Create mileage rate
 */
const createMileageRate = async (req, res) => {
    try {
        const { company_id, user_id } = req.user;
        const rateData = req.body;

        // Validate required fields
        const requiredFields = ['rate_name', 'rate_code', 'rate_per_unit', 'effective_from'];
        const missingFields = requiredFields.filter(field => !rateData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const rate = await expenseSettingsService.createMileageRate(
            company_id,
            rateData,
            user_id
        );

        res.status(201).json({
            success: true,
            message: 'Mileage rate created successfully',
            data: rate
        });
    } catch (error) {
        console.error('Error in createMileageRate:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create mileage rate'
        });
    }
};

/**
 * Update mileage rate
 */
const updateMileageRate = async (req, res) => {
    try {
        const { company_id, user_id } = req.user;
        const { id } = req.params;
        const rateData = req.body;

        const rate = await expenseSettingsService.updateMileageRate(
            parseInt(id),
            company_id,
            rateData,
            user_id
        );

        res.status(200).json({
            success: true,
            message: 'Mileage rate updated successfully',
            data: rate
        });
    } catch (error) {
        console.error('Error in updateMileageRate:', error);

        if (error.message === 'Mileage rate not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update mileage rate'
        });
    }
};

/**
 * Delete mileage rate
 */
const deleteMileageRate = async (req, res) => {
    try {
        const { company_id } = req.user;
        const { id } = req.params;

        await expenseSettingsService.deleteMileageRate(parseInt(id), company_id);

        res.status(200).json({
            success: true,
            message: 'Mileage rate deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteMileageRate:', error);

        if (error.message === 'Mileage rate not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete mileage rate'
        });
    }
};

/**
 * Get applicable mileage rate for an employee
 */
const getApplicableMileageRate = async (req, res) => {
    try {
        const { company_id } = req.user;
        const { employee_id } = req.params;
        const { vehicle_type, date } = req.query;

        if (!vehicle_type) {
            return res.status(400).json({
                success: false,
                message: 'vehicle_type is required'
            });
        }

        const rate = await expenseSettingsService.getApplicableMileageRate(
            company_id,
            parseInt(employee_id),
            vehicle_type,
            date || new Date().toISOString().split('T')[0]
        );

        res.status(200).json({
            success: true,
            message: rate ? 'Applicable rate found' : 'No applicable rate found',
            data: rate
        });
    } catch (error) {
        console.error('Error in getApplicableMileageRate:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get applicable mileage rate'
        });
    }
};

// ==================== PER DIEM RATES ====================

/**
 * Get all per diem rates
 */
const getPerDiemRates = async (req, res) => {
    try {
        const { company_id } = req.user;
        const filters = {
            city_tier: req.query.city_tier,
            is_active: req.query.is_active !== undefined ? parseInt(req.query.is_active) : undefined
        };

        const rates = await expenseSettingsService.getPerDiemRates(company_id, filters);

        res.status(200).json({
            success: true,
            message: 'Per diem rates retrieved successfully',
            data: rates,
            count: rates.length
        });
    } catch (error) {
        console.error('Error in getPerDiemRates:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve per diem rates'
        });
    }
};

/**
 * Create per diem rate
 */
const createPerDiemRate = async (req, res) => {
    try {
        const { company_id, user_id } = req.user;
        const rateData = req.body;

        // Validate required fields
        const requiredFields = ['rate_name', 'rate_code', 'full_day_rate', 'effective_from'];
        const missingFields = requiredFields.filter(field => !rateData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const rate = await expenseSettingsService.createPerDiemRate(
            company_id,
            rateData,
            user_id
        );

        res.status(201).json({
            success: true,
            message: 'Per diem rate created successfully',
            data: rate
        });
    } catch (error) {
        console.error('Error in createPerDiemRate:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create per diem rate'
        });
    }
};

/**
 * Update per diem rate
 */
const updatePerDiemRate = async (req, res) => {
    try {
        const { company_id, user_id } = req.user;
        const { id } = req.params;
        const rateData = req.body;

        const rate = await expenseSettingsService.updatePerDiemRate(
            parseInt(id),
            company_id,
            rateData,
            user_id
        );

        res.status(200).json({
            success: true,
            message: 'Per diem rate updated successfully',
            data: rate
        });
    } catch (error) {
        console.error('Error in updatePerDiemRate:', error);

        if (error.message === 'Per diem rate not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update per diem rate'
        });
    }
};

/**
 * Delete per diem rate
 */
const deletePerDiemRate = async (req, res) => {
    try {
        const { company_id } = req.user;
        const { id } = req.params;

        await expenseSettingsService.deletePerDiemRate(parseInt(id), company_id);

        res.status(200).json({
            success: true,
            message: 'Per diem rate deleted successfully'
        });
    } catch (error) {
        console.error('Error in deletePerDiemRate:', error);

        if (error.message === 'Per diem rate not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete per diem rate'
        });
    }
};

/**
 * Get applicable per diem rate for an employee
 */
const getApplicablePerDiemRate = async (req, res) => {
    try {
        const { company_id } = req.user;
        const { employee_id } = req.params;
        const { city_tier, date } = req.query;

        if (!city_tier) {
            return res.status(400).json({
                success: false,
                message: 'city_tier is required'
            });
        }

        const rate = await expenseSettingsService.getApplicablePerDiemRate(
            company_id,
            parseInt(employee_id),
            city_tier,
            date || new Date().toISOString().split('T')[0]
        );

        res.status(200).json({
            success: true,
            message: rate ? 'Applicable rate found' : 'No applicable rate found',
            data: rate
        });
    } catch (error) {
        console.error('Error in getApplicablePerDiemRate:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get applicable per diem rate'
        });
    }
};

// ==================== UTILITY ENDPOINTS ====================

/**
 * Check submission window status
 */
const checkSubmissionWindow = async (req, res) => {
    try {
        const { company_id } = req.user;
        const { date } = req.query;

        const windowStatus = await expenseSettingsService.checkSubmissionWindow(
            company_id,
            date || new Date().toISOString().split('T')[0]
        );

        res.status(200).json({
            success: true,
            message: 'Submission window status retrieved',
            data: windowStatus
        });
    } catch (error) {
        console.error('Error in checkSubmissionWindow:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to check submission window'
        });
    }
};

module.exports = {
    // General Settings
    getSettings,
    updateSettings,
    updateSettingsSection,

    // Mileage Rates
    getMileageRates,
    createMileageRate,
    updateMileageRate,
    deleteMileageRate,
    getApplicableMileageRate,

    // Per Diem Rates
    getPerDiemRates,
    createPerDiemRate,
    updatePerDiemRate,
    deletePerDiemRate,
    getApplicablePerDiemRate,

    // Utilities
    checkSubmissionWindow
};
