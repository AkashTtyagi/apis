/**
 * Rotating Shift Service
 *
 * Purpose: Manage frequency-based shift rotation patterns
 * Admin creates rotation pattern with shift order and frequency
 * Pattern applies to employees based on applicability rules
 */

const { HrmsRotatingShift } = require('../../models/HrmsRotatingShift');
const { HrmsRotatingShiftApplicability } = require('../../models/HrmsRotatingShiftApplicability');
const { HrmsShiftMaster } = require('../../models/HrmsShiftMaster');
const { HrmsCompany } = require('../../models/HrmsCompany');
const { Op } = require('sequelize');
const { sequelize } = require('../../utils/database');

/**
 * Create rotating shift pattern
 * @param {Object} data - Pattern data
 * @param {number} user_id - User creating the pattern
 * @returns {Object} Created pattern with applicability
 *
 * Input format:
 * {
 *   company_id: 1,
 *   pattern_name: "Day-Evening-Night Rotation",
 *   pattern_description: "Weekly rotation for production team",
 *   shift_order: [1, 2, 3],
 *   frequency: "weekly",
 *   start_date: "2025-01-01",
 *   end_date: "2025-12-31",
 *   applicability_rules: [
 *     {
 *       applicability_type: "department",
 *       applicability_value: "1,2,3",
 *       is_excluded: false,
 *       advanced_applicability_type: "branch",
 *       advanced_applicability_value: "1",
 *       priority: 1
 *     }
 *   ]
 * }
 */
async function createRotatingShiftPattern(data, user_id) {
    const transaction = await sequelize.transaction();

    try {
        const {
            company_id,
            pattern_name,
            pattern_description,
            shift_order,
            frequency,
            start_date,
            end_date,
            applicability_rules
        } = data;

        // Validate shift_order is array
        if (!Array.isArray(shift_order) || shift_order.length === 0) {
            throw new Error('shift_order must be a non-empty array of shift IDs');
        }

        // Validate frequency
        const validFrequencies = ['daily', 'weekly', 'bi-weekly', 'monthly'];
        if (!validFrequencies.includes(frequency)) {
            throw new Error('frequency must be one of: daily, weekly, bi-weekly, monthly');
        }

        // Validate all shifts exist
        const shifts = await HrmsShiftMaster.findAll({
            where: {
                id: { [Op.in]: shift_order },
                company_id: company_id,
                is_active: 1
            }
        });

        if (shifts.length !== shift_order.length) {
            throw new Error('One or more shifts not found or inactive');
        }

        // Create rotating shift pattern
        const pattern = await HrmsRotatingShift.create({
            company_id,
            pattern_name,
            pattern_description,
            shift_order,
            frequency,
            start_date,
            end_date,
            is_active: true,
            created_by: user_id
        }, { transaction });

        // Create applicability rules
        if (applicability_rules && applicability_rules.length > 0) {
            for (const rule of applicability_rules) {
                await HrmsRotatingShiftApplicability.create({
                    pattern_id: pattern.id,
                    applicability_type: rule.applicability_type,
                    applicability_value: rule.applicability_value,
                    company_id: company_id,
                    is_excluded: rule.is_excluded || false,
                    priority: rule.priority || 1,
                    is_active: true,
                    created_by: user_id
                }, { transaction });
            }
        }

        await transaction.commit();

        // Fetch complete data
        const completePattern = await HrmsRotatingShift.findByPk(pattern.id, {
            include: [
                {
                    model: HrmsCompany,
                    as: 'company',
                    attributes: ['id', 'org_name']
                },
                {
                    model: HrmsRotatingShiftApplicability,
                    as: 'applicability'
                }
            ]
        });

        // Get shift details
        const shiftDetails = await HrmsShiftMaster.findAll({
            where: { id: { [Op.in]: shift_order } },
            attributes: ['id', 'shift_name', 'shift_code', 'shift_start_time', 'shift_end_time']
        });

        return {
            success: true,
            message: 'Rotating shift pattern created successfully',
            data: {
                ...completePattern.toJSON(),
                shifts: shiftDetails
            }
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating rotating shift pattern:', error);
        throw error;
    }
}

/**
 * Update rotating shift pattern
 * @param {number} pattern_id - Pattern ID
 * @param {Object} updateData - Data to update
 * @param {number} user_id - User updating the pattern
 * @returns {Object} Updated pattern
 */
async function updateRotatingShiftPattern(pattern_id, updateData, user_id) {
    const transaction = await sequelize.transaction();

    try {
        const pattern = await HrmsRotatingShift.findByPk(pattern_id);

        if (!pattern) {
            throw new Error('Rotating shift pattern not found');
        }

        // Validate shift_order if being updated
        if (updateData.shift_order) {
            if (!Array.isArray(updateData.shift_order) || updateData.shift_order.length === 0) {
                throw new Error('shift_order must be a non-empty array of shift IDs');
            }

            const shifts = await HrmsShiftMaster.findAll({
                where: {
                    id: { [Op.in]: updateData.shift_order },
                    company_id: pattern.company_id,
                    is_active: 1
                }
            });

            if (shifts.length !== updateData.shift_order.length) {
                throw new Error('One or more shifts not found or inactive');
            }
        }

        // Validate frequency if being updated
        if (updateData.frequency) {
            const validFrequencies = ['daily', 'weekly', 'bi-weekly', 'monthly'];
            if (!validFrequencies.includes(updateData.frequency)) {
                throw new Error('frequency must be one of: daily, weekly, bi-weekly, monthly');
            }
        }

        // Update pattern
        await pattern.update({
            pattern_name: updateData.pattern_name !== undefined ? updateData.pattern_name : pattern.pattern_name,
            pattern_description: updateData.pattern_description !== undefined ? updateData.pattern_description : pattern.pattern_description,
            shift_order: updateData.shift_order || pattern.shift_order,
            frequency: updateData.frequency || pattern.frequency,
            start_date: updateData.start_date || pattern.start_date,
            end_date: updateData.end_date !== undefined ? updateData.end_date : pattern.end_date,
            is_active: updateData.is_active !== undefined ? updateData.is_active : pattern.is_active,
            updated_by: user_id
        }, { transaction });

        // Update applicability rules if provided
        if (updateData.applicability_rules) {
            // Delete existing applicability rules
            await HrmsRotatingShiftApplicability.destroy({
                where: { pattern_id: pattern_id },
                transaction,
                force: true
            });

            // Create new applicability rules
            for (const rule of updateData.applicability_rules) {
                await HrmsRotatingShiftApplicability.create({
                    pattern_id: pattern_id,
                    applicability_type: rule.applicability_type,
                    applicability_value: rule.applicability_value,
                    company_id: pattern.company_id,
                    is_excluded: rule.is_excluded || false,
                    priority: rule.priority || 1,
                    is_active: true,
                    created_by: user_id
                }, { transaction });
            }
        }

        await transaction.commit();

        // Fetch updated data
        const updatedPattern = await HrmsRotatingShift.findByPk(pattern_id, {
            include: [
                {
                    model: HrmsCompany,
                    as: 'company',
                    attributes: ['id', 'org_name']
                },
                {
                    model: HrmsRotatingShiftApplicability,
                    as: 'applicability'
                }
            ]
        });

        // Get shift details
        const shiftDetails = await HrmsShiftMaster.findAll({
            where: { id: { [Op.in]: updatedPattern.shift_order } },
            attributes: ['id', 'shift_name', 'shift_code', 'shift_start_time', 'shift_end_time']
        });

        return {
            success: true,
            message: 'Rotating shift pattern updated successfully',
            data: {
                ...updatedPattern.toJSON(),
                shifts: shiftDetails
            }
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error updating rotating shift pattern:', error);
        throw error;
    }
}

/**
 * Get rotating shift pattern by ID
 * @param {number} pattern_id - Pattern ID
 * @returns {Object} Pattern details
 */
async function getRotatingShiftPatternById(pattern_id) {
    try {
        const pattern = await HrmsRotatingShift.findByPk(pattern_id, {
            include: [
                {
                    model: HrmsCompany,
                    as: 'company',
                    attributes: ['id', 'org_name']
                },
                {
                    model: HrmsRotatingShiftApplicability,
                    as: 'applicability'
                }
            ]
        });

        if (!pattern) {
            throw new Error('Rotating shift pattern not found');
        }

        // Get shift details
        const shiftDetails = await HrmsShiftMaster.findAll({
            where: { id: { [Op.in]: pattern.shift_order } },
            attributes: ['id', 'shift_name', 'shift_code', 'shift_start_time', 'shift_end_time']
        });

        return {
            success: true,
            data: {
                ...pattern.toJSON(),
                shifts: shiftDetails
            }
        };

    } catch (error) {
        console.error('Error getting rotating shift pattern:', error);
        throw error;
    }
}

/**
 * Get rotating shift patterns with filters
 * @param {Object} filters - Filter criteria
 * @returns {Object} List of patterns
 */
async function getRotatingShiftPatterns(filters = {}) {
    try {
        const {
            company_id,
            frequency,
            is_active,
            active_on_date,
            search,
            page = 1,
            limit = 50
        } = filters;

        const where = {};

        if (company_id) where.company_id = company_id;
        if (frequency) where.frequency = frequency;
        if (is_active !== undefined) where.is_active = is_active;
        if (search) {
            where[Op.or] = [
                { pattern_name: { [Op.like]: `%${search}%` } },
                { pattern_description: { [Op.like]: `%${search}%` } }
            ];
        }

        if (active_on_date) {
            where.start_date = { [Op.lte]: active_on_date };
            where[Op.or] = [
                { end_date: { [Op.gte]: active_on_date } },
                { end_date: null }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await HrmsRotatingShift.findAndCountAll({
            where,
            include: [
                {
                    model: HrmsCompany,
                    as: 'company',
                    attributes: ['id', 'org_name']
                },
                {
                    model: HrmsRotatingShiftApplicability,
                    as: 'applicability'
                }
            ],
            order: [['id', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(count / limit)
            }
        };

    } catch (error) {
        console.error('Error getting rotating shift patterns:', error);
        throw error;
    }
}

/**
 * Delete rotating shift pattern (soft delete)
 * @param {number} pattern_id - Pattern ID
 * @param {number} user_id - User deleting the pattern
 * @returns {Object} Success message
 */
async function deleteRotatingShiftPattern(pattern_id, user_id) {
    try {
        const pattern = await HrmsRotatingShift.findByPk(pattern_id);

        if (!pattern) {
            throw new Error('Rotating shift pattern not found');
        }

        await pattern.update({
            is_active: false,
            updated_by: user_id
        });

        await pattern.destroy();

        return {
            success: true,
            message: 'Rotating shift pattern deleted successfully'
        };

    } catch (error) {
        console.error('Error deleting rotating shift pattern:', error);
        throw error;
    }
}

module.exports = {
    createRotatingShiftPattern,
    updateRotatingShiftPattern,
    getRotatingShiftPatternById,
    getRotatingShiftPatterns,
    deleteRotatingShiftPattern
};
