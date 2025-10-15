/**
 * Timezone Service
 * Handles timezone master operations
 */

const { HrmsTimezoneMaster } = require('../models/HrmsTimezoneMaster');

/**
 * Get all active timezones for dropdown
 * @returns {Array} List of active timezones
 */
const getAllTimezones = async () => {
    try {
        const timezones = await HrmsTimezoneMaster.findAll({
            where: {
                is_active: 1
            },
            attributes: [
                'id',
                'timezone_name',
                'timezone_offset',
                'timezone_offset_minutes',
                'country_code',
                'timezone_abbr',
                'display_name'
            ],
            order: [['timezone_offset_minutes', 'ASC']],
            raw: true
        });

        return timezones;
    } catch (error) {
        throw error;
    }
};

/**
 * Get timezone by ID
 * @param {number} timezone_id - Timezone ID
 * @returns {Object} Timezone details
 */
const getTimezoneById = async (timezone_id) => {
    try {
        const timezone = await HrmsTimezoneMaster.findOne({
            where: {
                id: timezone_id,
                is_active: 1
            },
            raw: true
        });

        if (!timezone) {
            throw new Error('Timezone not found');
        }

        return timezone;
    } catch (error) {
        throw error;
    }
};

/**
 * Search timezones by name or country
 * @param {string} searchTerm - Search term
 * @returns {Array} List of matching timezones
 */
const searchTimezones = async (searchTerm) => {
    try {
        const { Op } = require('sequelize');

        const timezones = await HrmsTimezoneMaster.findAll({
            where: {
                is_active: 1,
                [Op.or]: [
                    { timezone_name: { [Op.like]: `%${searchTerm}%` } },
                    { display_name: { [Op.like]: `%${searchTerm}%` } },
                    { country_code: { [Op.like]: `%${searchTerm}%` } },
                    { timezone_abbr: { [Op.like]: `%${searchTerm}%` } }
                ]
            },
            attributes: [
                'id',
                'timezone_name',
                'timezone_offset',
                'timezone_offset_minutes',
                'country_code',
                'timezone_abbr',
                'display_name'
            ],
            order: [['timezone_offset_minutes', 'ASC']],
            raw: true
        });

        return timezones;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllTimezones,
    getTimezoneById,
    searchTimezones
};
