/**
 * Holiday Policy Service
 * Manages holiday policies (calendars) for companies
 */

const { HrmsHolidayPolicy } = require('../../models/holiday/HrmsHolidayPolicy');
const { HrmsHolidayPolicyMapping } = require('../../models/holiday/HrmsHolidayPolicyMapping');
const { HrmsHolidayPolicyApplicability } = require('../../models/holiday/HrmsHolidayPolicyApplicability');
const { HrmsHolidayBank } = require('../../models/holiday/HrmsHolidayBank');
const { HrmsCompany } = require('../../models/HrmsCompany');
const { sequelize } = require('../../utils/database');

/**
 * Get all holiday policies
 */
const getAllPolicies = async (filters = {}) => {
    const where = { is_active: 1 };

    // Filter by company
    if (filters.company_id) {
        where.company_id = filters.company_id;
    }

    // Filter by year
    if (filters.year) {
        where.year = filters.year;
    }

    const policies = await HrmsHolidayPolicy.findAll({
        where,
        include: [
            {
                model: HrmsCompany,
                as: 'company',
                attributes: ['id', 'org_name']
            },
            {
                model: HrmsHolidayPolicyMapping,
                as: 'holidayMappings',
                where: { is_active: 1 },
                required: false,
                include: [
                    {
                        model: HrmsHolidayBank,
                        as: 'holiday',
                        attributes: ['id', 'holiday_name', 'holiday_date', 'is_national_holiday', 'description']
                    }
                ]
            },
            {
                model: HrmsHolidayPolicyApplicability,
                as: 'applicability',
                where: { is_active: 1 },
                required: false,
                attributes: [
                    'id',
                    'applicability_type',
                    'applicability_value',
                    'advanced_applicability_type',
                    'advanced_applicability_value',
                    'is_excluded',
                    'priority'
                ]
            }
        ],
        order: [['year', 'DESC'], ['calendar_name', 'ASC']]
    });

    return policies;
};

/**
 * Get holiday policy by ID
 */
const getPolicyById = async (id) => {
    const policy = await HrmsHolidayPolicy.findByPk(id, {
        include: [
            {
                model: HrmsCompany,
                as: 'company',
                attributes: ['id', 'org_name']
            },
            {
                model: HrmsHolidayPolicyMapping,
                as: 'holidayMappings',
                where: { is_active: 1 },
                required: false,
                include: [
                    {
                        model: HrmsHolidayBank,
                        as: 'holiday',
                        attributes: ['id', 'holiday_name', 'holiday_date', 'is_national_holiday', 'description']
                    }
                ]
            },
            {
                model: HrmsHolidayPolicyApplicability,
                as: 'applicability',
                where: { is_active: 1 },
                required: false
            }
        ]
    });

    if (!policy) {
        throw new Error('Holiday policy not found');
    }

    return policy;
};

/**
 * Create new holiday policy
 */
const createPolicy = async (policyData, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            company_id,
            calendar_name,
            year,
            is_restricted_holiday_applicable,
            restricted_holiday_count,
            notes,
            holiday_ids, // Array of holiday IDs to map
            applicability // Applicability rules
        } = policyData;

        // Validate required fields
        if (!company_id || !calendar_name || !year) {
            throw new Error('Company ID, calendar name, and year are required');
        }

        // Validate restricted holiday settings
        if (is_restricted_holiday_applicable && !restricted_holiday_count) {
            throw new Error('Restricted holiday count is required when restricted holidays are applicable');
        }

        // Check if policy already exists for this company and year
        const existingPolicy = await HrmsHolidayPolicy.findOne({
            where: {
                company_id,
                calendar_name,
                year,
                is_active: 1
            },
            transaction
        });

        if (existingPolicy) {
            throw new Error('Holiday policy with same calendar name already exists for this year');
        }

        // Create holiday policy
        const policy = await HrmsHolidayPolicy.create({
            company_id,
            calendar_name,
            year,
            is_restricted_holiday_applicable: is_restricted_holiday_applicable || 0,
            restricted_holiday_count: is_restricted_holiday_applicable ? restricted_holiday_count : null,
            notes: notes || null,
            is_active: 1,
            created_by: userId,
            updated_by: userId
        }, { transaction });

        // Map holidays to policy if provided
        if (holiday_ids && holiday_ids.length > 0) {
            const mappings = holiday_ids.map(holiday_id => ({
                policy_id: policy.id,
                holiday_id,
                is_active: 1
            }));

            await HrmsHolidayPolicyMapping.bulkCreate(mappings, { transaction });
        }

        // Create applicability rules if provided
        if (applicability && applicability.length > 0) {
            const applicabilityRules = applicability.map(rule => ({
                policy_id: policy.id,
                applicability_type: rule.applicability_type,
                applicability_value: rule.applicability_value,
                company_id,
                advanced_applicability_type: rule.advanced_applicability_type || 'none',
                advanced_applicability_value: rule.advanced_applicability_value || null,
                is_excluded: rule.is_excluded || 0,
                priority: rule.priority || 1,
                is_active: 1,
                created_by: userId
            }));

            await HrmsHolidayPolicyApplicability.bulkCreate(applicabilityRules, { transaction });
        }

        await transaction.commit();

        // Fetch complete policy with associations
        return await getPolicyById(policy.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Update holiday policy
 */
const updatePolicy = async (id, policyData, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const policy = await HrmsHolidayPolicy.findByPk(id, { transaction });

        if (!policy) {
            throw new Error('Holiday policy not found');
        }

        const {
            calendar_name,
            year,
            is_restricted_holiday_applicable,
            restricted_holiday_count,
            notes,
            holiday_ids, // Array of holiday IDs to update mappings
            applicability // Applicability rules to update
        } = policyData;

        // Validate restricted holiday settings
        if (is_restricted_holiday_applicable && !restricted_holiday_count) {
            throw new Error('Restricted holiday count is required when restricted holidays are applicable');
        }

        // Update policy basic info
        await policy.update({
            calendar_name: calendar_name || policy.calendar_name,
            year: year || policy.year,
            is_restricted_holiday_applicable: is_restricted_holiday_applicable !== undefined ? is_restricted_holiday_applicable : policy.is_restricted_holiday_applicable,
            restricted_holiday_count: is_restricted_holiday_applicable ? restricted_holiday_count : null,
            notes: notes !== undefined ? notes : policy.notes,
            updated_by: userId
        }, { transaction });

        // Update holiday mappings if provided
        if (holiday_ids !== undefined) {
            // Deactivate existing mappings
            await HrmsHolidayPolicyMapping.update(
                { is_active: 0 },
                {
                    where: { policy_id: id },
                    transaction
                }
            );

            // Create new mappings
            if (holiday_ids.length > 0) {
                const mappings = holiday_ids.map(holiday_id => ({
                    policy_id: id,
                    holiday_id,
                    is_active: 1
                }));

                await HrmsHolidayPolicyMapping.bulkCreate(mappings, {
                    transaction,
                    updateOnDuplicate: ['is_active', 'updated_at']
                });
            }
        }

        // Update applicability rules if provided
        if (applicability !== undefined) {
            // Deactivate existing rules
            await HrmsHolidayPolicyApplicability.update(
                { is_active: 0 },
                {
                    where: { policy_id: id },
                    transaction
                }
            );

            // Create new rules
            if (applicability.length > 0) {
                const applicabilityRules = applicability.map(rule => ({
                    policy_id: id,
                    applicability_type: rule.applicability_type,
                    applicability_value: rule.applicability_value,
                    company_id: policy.company_id,
                    advanced_applicability_type: rule.advanced_applicability_type || 'none',
                    advanced_applicability_value: rule.advanced_applicability_value || null,
                    is_excluded: rule.is_excluded || 0,
                    priority: rule.priority || 1,
                    is_active: 1,
                    created_by: userId
                }));

                await HrmsHolidayPolicyApplicability.bulkCreate(applicabilityRules, { transaction });
            }
        }

        await transaction.commit();

        // Fetch complete policy with associations
        return await getPolicyById(id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Delete holiday policy (soft delete)
 */
const deletePolicy = async (id) => {
    const transaction = await sequelize.transaction();

    try {
        const policy = await HrmsHolidayPolicy.findByPk(id, { transaction });

        if (!policy) {
            throw new Error('Holiday policy not found');
        }

        // Soft delete policy
        await policy.update({ is_active: 0 }, { transaction });

        // Deactivate all mappings and applicability rules
        await HrmsHolidayPolicyMapping.update(
            { is_active: 0 },
            { where: { policy_id: id }, transaction }
        );

        await HrmsHolidayPolicyApplicability.update(
            { is_active: 0 },
            { where: { policy_id: id }, transaction }
        );

        await transaction.commit();

        return { message: 'Holiday policy deleted successfully' };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Add holidays to policy
 */
const addHolidaysToPolicy = async (policyId, holidayIds) => {
    const transaction = await sequelize.transaction();

    try {
        const policy = await HrmsHolidayPolicy.findByPk(policyId, { transaction });

        if (!policy) {
            throw new Error('Holiday policy not found');
        }

        const mappings = holidayIds.map(holiday_id => ({
            policy_id: policyId,
            holiday_id,
            is_active: 1
        }));

        await HrmsHolidayPolicyMapping.bulkCreate(mappings, {
            transaction,
            ignoreDuplicates: true
        });

        await transaction.commit();

        return { message: 'Holidays added to policy successfully' };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Remove holiday from policy
 */
const removeHolidayFromPolicy = async (policyId, holidayId) => {
    const transaction = await sequelize.transaction();

    try {
        const mapping = await HrmsHolidayPolicyMapping.findOne({
            where: {
                policy_id: policyId,
                holiday_id: holidayId
            },
            transaction
        });

        if (!mapping) {
            throw new Error('Holiday mapping not found');
        }

        await mapping.update({ is_active: 0 }, { transaction });

        await transaction.commit();

        return { message: 'Holiday removed from policy successfully' };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    getAllPolicies,
    getPolicyById,
    createPolicy,
    updatePolicy,
    deletePolicy,
    addHolidaysToPolicy,
    removeHolidayFromPolicy
};
