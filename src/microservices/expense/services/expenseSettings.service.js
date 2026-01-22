/**
 * Expense Settings Service
 * Business logic for company-wide expense settings management
 */

const { ExpenseSettings } = require('../../../models/expense');

// ==================== GENERAL SETTINGS ====================

/**
 * Get settings for a company (create with defaults if not exists)
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Settings
 */
const getSettings = async (companyId) => {
    let settings = await ExpenseSettings.findOne({
        where: { company_id: companyId }
    });

    // Create default settings if not exists
    if (!settings) {
        settings = await ExpenseSettings.create({
            company_id: companyId,
            created_by: 1 // System created
        });

        // Reload
        settings = await ExpenseSettings.findOne({
            where: { company_id: companyId }
        });
    }

    return settings;
};

/**
 * Update settings for a company
 * @param {number} companyId - Company ID
 * @param {Object} data - Settings data
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated settings
 */
const updateSettings = async (companyId, data, userId) => {
    let settings = await ExpenseSettings.findOne({
        where: { company_id: companyId }
    });

    if (!settings) {
        // Create with provided data
        settings = await ExpenseSettings.create({
            ...data,
            company_id: companyId,
            created_by: userId
        });
    } else {
        // Update existing
        await settings.update({
            ...data,
            updated_by: userId
        });
    }

    return await getSettings(companyId);
};

/**
 * Update a specific section of settings
 * @param {number} companyId - Company ID
 * @param {string} section - Section name
 * @param {Object} data - Section data
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated settings
 */
const updateSettingsSection = async (companyId, section, data, userId) => {
    const sectionFields = {
        general: [
            'expense_code_prefix', 'expense_code_format',
            'expense_code_sequence_length', 'auto_generate_expense_code'
        ],
        violation: [
            'policy_violation_action', 'over_limit_action', 'suspicious_pattern_detection',
            'round_amount_threshold', 'weekend_expense_flag', 'holiday_expense_flag'
        ],
        audit: [
            'audit_trail_enabled', 'audit_log_retention_days', 'log_all_views', 'log_field_changes',
            'ip_tracking_enabled', 'device_tracking_enabled', 'geo_location_tracking'
        ]
    };

    const allowedFields = sectionFields[section];
    if (!allowedFields) {
        throw new Error(`Invalid section: ${section}`);
    }

    // Filter data to only include allowed fields
    const filteredData = {};
    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            filteredData[field] = data[field];
        }
    }

    return await updateSettings(companyId, filteredData, userId);
};

module.exports = {
    getSettings,
    updateSettings,
    updateSettingsSection
};
