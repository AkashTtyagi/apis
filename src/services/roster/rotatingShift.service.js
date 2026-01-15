/**
 * Rotating Shift Service
 *
 * Purpose: Frequency-based shift rotation pattern
 * Admin creates rotation pattern with shift order and frequency
 * Pattern applies to employees based on applicability rules (like workflow)
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

        // Validate all shifts exist
        const shifts = await HrmsShiftMaster.findAll({
            where: {
                id: { [Op.in]: shift_order },
                company_id: company_id,
                is_active: true
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
        const applicabilityRecords = [];
        if (applicability_rules && applicability_rules.length > 0) {
            for (const rule of applicability_rules) {
                const applicability = await HrmsRotatingShiftApplicability.create({
                    pattern_id: pattern.id,
                    applicability_type: rule.applicability_type,
                    applicability_value: rule.applicability_value,
                    company_id: company_id,
                    is_excluded: rule.is_excluded || false,
                    advanced_applicability_type: rule.advanced_applicability_type || 'none',
                    advanced_applicability_value: rule.advanced_applicability_value || null,
                    priority: rule.priority || 1,
                    is_active: true,
                    created_by: user_id
                }, { transaction });

                applicabilityRecords.push(applicability);
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

        return {
            success: true,
            message: 'Rotating shift pattern created successfully',
            data: completePattern
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating rotating shift pattern:', error);
        throw error;
    }
}

/**
 * Get rotating shift pattern by ID
 * @param {number} id - Pattern ID
 * @returns {Object} Pattern details
 */
async function getRotatingShiftPatternById(id) {
    try {
        const pattern = await HrmsRotatingShift.findByPk(id, {
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

        // Get shift details for shift_order
        const shiftDetails = await HrmsShiftMaster.findAll({
            where: {
                id: { [Op.in]: pattern.shift_order }
            },
            attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
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
            page = 1,
            limit = 50
        } = filters;

        const where = {};

        if (company_id) where.company_id = company_id;
        if (frequency) where.frequency = frequency;
        if (is_active !== undefined) where.is_active = is_active;

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
            order: [['start_date', 'DESC'], ['id', 'DESC']],
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
 * Update rotating shift pattern
 * @param {number} id - Pattern ID
 * @param {Object} updateData - Data to update
 * @param {number} user_id - User updating the pattern
 * @returns {Object} Updated pattern
 */
async function updateRotatingShiftPattern(id, updateData, user_id) {
    const transaction = await sequelize.transaction();

    try {
        const pattern = await HrmsRotatingShift.findByPk(id);

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
                    is_active: true
                }
            });

            if (shifts.length !== updateData.shift_order.length) {
                throw new Error('One or more shifts not found or inactive');
            }
        }

        // Update pattern
        await pattern.update({
            ...updateData,
            updated_by: user_id
        }, { transaction });

        // Update applicability rules if provided
        if (updateData.applicability_rules) {
            // Delete existing applicability rules
            await HrmsRotatingShiftApplicability.destroy({
                where: { pattern_id: id },
                transaction
            });

            // Create new applicability rules
            for (const rule of updateData.applicability_rules) {
                await HrmsRotatingShiftApplicability.create({
                    pattern_id: id,
                    applicability_type: rule.applicability_type,
                    applicability_value: rule.applicability_value,
                    company_id: pattern.company_id,
                    is_excluded: rule.is_excluded || false,
                    advanced_applicability_type: rule.advanced_applicability_type || 'none',
                    advanced_applicability_value: rule.advanced_applicability_value || null,
                    priority: rule.priority || 1,
                    is_active: true,
                    created_by: user_id
                }, { transaction });
            }
        }

        await transaction.commit();

        // Fetch updated data
        const updatedPattern = await HrmsRotatingShift.findByPk(id, {
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

        return {
            success: true,
            message: 'Rotating shift pattern updated successfully',
            data: updatedPattern
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error updating rotating shift pattern:', error);
        throw error;
    }
}

/**
 * Delete rotating shift pattern (soft delete)
 * @param {number} id - Pattern ID
 * @param {number} user_id - User deleting the pattern
 * @returns {Object} Success message
 */
async function deleteRotatingShiftPattern(id, user_id) {
    try {
        const pattern = await HrmsRotatingShift.findByPk(id);

        if (!pattern) {
            throw new Error('Rotating shift pattern not found');
        }

        // Soft delete pattern
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

/**
 * Add applicability rule to pattern
 * @param {number} pattern_id - Pattern ID
 * @param {Object} ruleData - Applicability rule data
 * @param {number} user_id - User creating the rule
 * @returns {Object} Created rule
 */
async function addApplicabilityRule(pattern_id, ruleData, user_id) {
    try {
        const pattern = await HrmsRotatingShift.findByPk(pattern_id);

        if (!pattern) {
            throw new Error('Rotating shift pattern not found');
        }

        const applicability = await HrmsRotatingShiftApplicability.create({
            pattern_id: pattern_id,
            applicability_type: ruleData.applicability_type,
            applicability_value: ruleData.applicability_value,
            company_id: pattern.company_id,
            is_excluded: ruleData.is_excluded || false,
            advanced_applicability_type: ruleData.advanced_applicability_type || 'none',
            advanced_applicability_value: ruleData.advanced_applicability_value || null,
            priority: ruleData.priority || 1,
            is_active: true,
            created_by: user_id
        });

        return {
            success: true,
            message: 'Applicability rule added successfully',
            data: applicability
        };

    } catch (error) {
        console.error('Error adding applicability rule:', error);
        throw error;
    }
}

/**
 * Update applicability rule
 * @param {number} rule_id - Rule ID
 * @param {Object} updateData - Data to update
 * @param {number} user_id - User updating the rule
 * @returns {Object} Updated rule
 */
async function updateApplicabilityRule(rule_id, updateData, user_id) {
    try {
        const rule = await HrmsRotatingShiftApplicability.findByPk(rule_id);

        if (!rule) {
            throw new Error('Applicability rule not found');
        }

        await rule.update({
            ...updateData,
            updated_by: user_id
        });

        return {
            success: true,
            message: 'Applicability rule updated successfully',
            data: rule
        };

    } catch (error) {
        console.error('Error updating applicability rule:', error);
        throw error;
    }
}

/**
 * Delete applicability rule (soft delete)
 * @param {number} rule_id - Rule ID
 * @param {number} user_id - User deleting the rule
 * @returns {Object} Success message
 */
async function deleteApplicabilityRule(rule_id, user_id) {
    try {
        const rule = await HrmsRotatingShiftApplicability.findByPk(rule_id);

        if (!rule) {
            throw new Error('Applicability rule not found');
        }

        await rule.update({
            is_active: false,
            updated_by: user_id
        });

        await rule.destroy();

        return {
            success: true,
            message: 'Applicability rule deleted successfully'
        };

    } catch (error) {
        console.error('Error deleting applicability rule:', error);
        throw error;
    }
}

module.exports = {
    createRotatingShiftPattern,
    getRotatingShiftPatternById,
    getRotatingShiftPatterns,
    updateRotatingShiftPattern,
    deleteRotatingShiftPattern,
    addApplicabilityRule,
    updateApplicabilityRule,
    deleteApplicabilityRule
};
