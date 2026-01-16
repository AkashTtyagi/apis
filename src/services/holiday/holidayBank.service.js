/**
 * Holiday Bank Service
 * Manages master list of all holidays
 */

const { HrmsHolidayBank } = require('../../models/holiday/HrmsHolidayBank');
const { HrmsHolidayPolicyMapping } = require('../../models/holiday/HrmsHolidayPolicyMapping');
const { sequelize } = require('../../utils/database');

/**
 * Get all holidays from holiday bank
 */
const getAllHolidays = async (filters = {}) => {
    const where = { is_active: 1 };

    // Filter by year
    if (filters.year) {
        where.holiday_date = sequelize.where(
            sequelize.fn('YEAR', sequelize.col('holiday_date')),
            filters.year
        );
    }

    // Filter by holiday type
    if (filters.is_national_holiday !== undefined) {
        where.is_national_holiday = filters.is_national_holiday;
    }

    // Filter by date range
    if (filters.start_date && filters.end_date) {
        where.holiday_date = {
            [sequelize.Sequelize.Op.between]: [filters.start_date, filters.end_date]
        };
    }

    const holidays = await HrmsHolidayBank.findAll({
        where,
        order: [['holiday_date', 'ASC']]
    });

    return holidays;
};

/**
 * Get holiday by ID
 */
const getHolidayById = async (id) => {
    const holiday = await HrmsHolidayBank.findByPk(id);

    if (!holiday) {
        throw new Error('Holiday not found');
    }

    return holiday;
};

/**
 * Create new holiday
 */
const createHoliday = async (holidayData, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            holiday_name,
            holiday_date,
            is_national_holiday,
            day_type,
            description
        } = holidayData;

        // Validate required fields
        if (!holiday_name || !holiday_date) {
            throw new Error('Holiday name and date are required');
        }

        // Check if holiday already exists on same date
        const existingHoliday = await HrmsHolidayBank.findOne({
            where: {
                holiday_date,
                holiday_name,
                is_active: 1
            },
            transaction
        });

        if (existingHoliday) {
            throw new Error('Holiday with same name and date already exists');
        }

        // Create holiday
        const holiday = await HrmsHolidayBank.create({
            holiday_name,
            holiday_date,
            is_national_holiday: is_national_holiday || 0,
            day_type: day_type || 'full_day',
            description: description || null,
            is_active: 1,
            created_by: userId
        }, { transaction });

        await transaction.commit();

        return holiday;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Update holiday
 */
const updateHoliday = async (id, holidayData, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const holiday = await HrmsHolidayBank.findByPk(id, { transaction });

        if (!holiday) {
            throw new Error('Holiday not found');
        }

        const {
            holiday_name,
            holiday_date,
            is_national_holiday,
            day_type,
            description
        } = holidayData;

        // Check if updating to a date that already has this holiday name
        if (holiday_date && holiday_name) {
            const existingHoliday = await HrmsHolidayBank.findOne({
                where: {
                    holiday_date,
                    holiday_name,
                    is_active: 1,
                    id: { [sequelize.Sequelize.Op.ne]: id }
                },
                transaction
            });

            if (existingHoliday) {
                throw new Error('Holiday with same name and date already exists');
            }
        }

        // Update holiday
        await holiday.update({
            holiday_name: holiday_name || holiday.holiday_name,
            holiday_date: holiday_date || holiday.holiday_date,
            is_national_holiday: is_national_holiday !== undefined ? is_national_holiday : holiday.is_national_holiday,
            day_type: day_type || holiday.day_type,
            description: description !== undefined ? description : holiday.description
        }, { transaction });

        await transaction.commit();

        return holiday;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Delete holiday (soft delete)
 * Only allows deletion if holiday is not mapped to any active holiday policy
 */
const deleteHoliday = async (id) => {
    const transaction = await sequelize.transaction();

    try {
        const holiday = await HrmsHolidayBank.findByPk(id, { transaction });

        if (!holiday) {
            throw new Error('Holiday not found');
        }

        // Check if holiday is mapped to any active policy
        const activeMappings = await HrmsHolidayPolicyMapping.findAll({
            where: {
                holiday_id: id,
                is_active: 1
            },
            transaction
        });

        if (activeMappings && activeMappings.length > 0) {
            throw new Error('Cannot delete holiday. It is currently mapped to one or more active holiday policies. Please remove it from all policies first.');
        }

        // Soft delete
        await holiday.update({
            is_active: 0
        }, { transaction });

        await transaction.commit();

        return { message: 'Holiday deleted successfully' };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Bulk create holidays
 */
const bulkCreateHolidays = async (holidaysData, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const holidays = holidaysData.map(holiday => ({
            holiday_name: holiday.holiday_name,
            holiday_date: holiday.holiday_date,
            is_national_holiday: holiday.is_national_holiday || 0,
            day_type: holiday.day_type || 'full_day',
            description: holiday.description || null,
            is_active: 1,
            created_by: userId
        }));

        const createdHolidays = await HrmsHolidayBank.bulkCreate(holidays, {
            transaction,
            validate: true
        });

        await transaction.commit();

        return createdHolidays;
    } catch (error) {
        await transaction.rollback();
        throw error;
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
