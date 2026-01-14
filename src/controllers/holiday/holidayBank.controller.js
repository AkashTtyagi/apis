/**
 * Holiday Bank Controller
 * Handles HTTP requests for holiday bank operations
 */

const holidayBankService = require('../../services/holiday/holidayBank.service');

/**
 * Get all holidays
 * POST /api/holiday/bank/list
 */
const getAllHolidays = async (req, res) => {
    try {
        const { year, is_national_holiday, start_date, end_date } = req.body;

        const filters = {};
        if (year) filters.year = year;
        if (is_national_holiday !== undefined) filters.is_national_holiday = is_national_holiday;
        if (start_date && end_date) {
            filters.start_date = start_date;
            filters.end_date = end_date;
        }

        const holidays = await holidayBankService.getAllHolidays(filters);

        res.status(200).json({
            success: true,
            data: holidays,
            message: 'Holidays fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch holidays'
        });
    }
};

/**
 * Get holiday by ID
 * POST /api/holiday/bank/detail
 */
const getHolidayById = async (req, res) => {
    try {
        const { id } = req.body;
        const holiday = await holidayBankService.getHolidayById(id);

        res.status(200).json({
            success: true,
            data: holiday,
            message: 'Holiday fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching holiday:', error);
        res.status(error.message === 'Holiday not found' ? 404 : 500).json({
            success: false,
            message: error.message || 'Failed to fetch holiday'
        });
    }
};

/**
 * Create new holiday
 * POST /api/holiday-bank
 */
const createHoliday = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const holidayData = req.body;

        const holiday = await holidayBankService.createHoliday(holidayData, userId);

        res.status(201).json({
            success: true,
            data: holiday,
            message: 'Holiday created successfully'
        });
    } catch (error) {
        console.error('Error creating holiday:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create holiday'
        });
    }
};

/**
 * Update holiday
 * POST /api/holiday/bank/update
 */
const updateHoliday = async (req, res) => {
    try {
        const { id, ...holidayData } = req.body;
        const userId = req.user?.id || null;
        const holiday = await holidayBankService.updateHoliday(id, holidayData, userId);

        res.status(200).json({
            success: true,
            data: holiday,
            message: 'Holiday updated successfully'
        });
    } catch (error) {
        console.error('Error updating holiday:', error);
        res.status(error.message === 'Holiday not found' ? 404 : 400).json({
            success: false,
            message: error.message || 'Failed to update holiday'
        });
    }
};

/**
 * Delete holiday
 * POST /api/holiday/bank/delete
 */
const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.body;
        const result = await holidayBankService.deleteHoliday(id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error deleting holiday:', error);
        res.status(error.message === 'Holiday not found' ? 404 : 500).json({
            success: false,
            message: error.message || 'Failed to delete holiday'
        });
    }
};

/**
 * Bulk create holidays
 * POST /api/holiday/bank/bulk
 */
const bulkCreateHolidays = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const { holidays } = req.body;
        const createdHolidays = await holidayBankService.bulkCreateHolidays(holidays, userId);

        res.status(201).json({
            success: true,
            data: createdHolidays,
            message: `${createdHolidays.length} holidays created successfully`
        });
    } catch (error) {
        console.error('Error bulk creating holidays:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create holidays'
        });
    }
};

module.exports = {
    getAllHolidays,
    getHolidayById,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    bulkCreateHolidays
};
