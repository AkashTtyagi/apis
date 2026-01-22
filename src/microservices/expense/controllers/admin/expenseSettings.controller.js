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
            'violation',
            'audit'
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

module.exports = {
    getSettings,
    updateSettings,
    updateSettingsSection
};
