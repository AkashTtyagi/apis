/**
 * ESS Policy Service
 * Business logic for policy management by employees (Employee Self Service)
 */

const { Op } = require('sequelize');
const { sequelize } = require('../../utils/database');
const {
    HrmsPolicyCategory,
    HrmsPolicy,
    HrmsPolicyVersion,
    HrmsPolicyAttachment,
    HrmsEmployeePolicyAcknowledgment,
    HrmsPolicyAcknowledgmentAudit
} = require('../../models/policy');

// =====================================================
// EMPLOYEE POLICY VIEWING
// =====================================================

/**
 * Get employee's assigned policies (all)
 */
const getEmployeeAssignedPolicies = async (employee_id, filters = {}) => {
    const { category_id, is_acknowledged, page = 1, limit = 50 } = filters;

    const whereClause = { employee_id };
    if (is_acknowledged !== undefined) {
        whereClause.is_acknowledged = is_acknowledged;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await HrmsEmployeePolicyAcknowledgment.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: HrmsPolicy,
                as: 'policy',
                required: true,
                where: {
                    is_active: true,
                    ...(category_id && { category_id })
                },
                include: [
                    {
                        model: HrmsPolicyCategory,
                        as: 'category',
                        attributes: ['id', 'category_name', 'category_slug']
                    }
                ]
            },
            {
                model: HrmsPolicyVersion,
                as: 'version',
                attributes: ['id', 'version_number', 'version_title', 'policy_content', 'published_at']
            }
        ],
        order: [['assigned_at', 'DESC']],
        limit,
        offset
    });

    return {
        total: count,
        page,
        limit,
        policies: rows
    };
};

/**
 * Get employee's pending policies (not acknowledged)
 */
const getEmployeePendingPolicies = async (employee_id) => {
    const pendingPolicies = await HrmsEmployeePolicyAcknowledgment.findAll({
        where: {
            employee_id,
            is_acknowledged: false
        },
        include: [
            {
                model: HrmsPolicy,
                as: 'policy',
                required: true,
                where: { is_active: true },
                include: [
                    {
                        model: HrmsPolicyCategory,
                        as: 'category',
                        attributes: ['id', 'category_name', 'category_slug']
                    }
                ]
            },
            {
                model: HrmsPolicyVersion,
                as: 'version',
                attributes: ['id', 'version_number', 'version_title', 'version_description', 'policy_content', 'published_at']
            }
        ],
        order: [
            ['due_date', 'ASC'],
            ['assigned_at', 'DESC']
        ]
    });

    return pendingPolicies;
};

/**
 * Get employee's acknowledged policies
 */
const getEmployeeAcknowledgedPolicies = async (employee_id, page = 1, limit = 50) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await HrmsEmployeePolicyAcknowledgment.findAndCountAll({
        where: {
            employee_id,
            is_acknowledged: true
        },
        include: [
            {
                model: HrmsPolicy,
                as: 'policy',
                include: [
                    {
                        model: HrmsPolicyCategory,
                        as: 'category',
                        attributes: ['id', 'category_name', 'category_slug']
                    }
                ]
            },
            {
                model: HrmsPolicyVersion,
                as: 'version',
                attributes: ['id', 'version_number', 'version_title', 'published_at']
            }
        ],
        order: [['acknowledged_at', 'DESC']],
        limit,
        offset
    });

    return {
        total: count,
        page,
        limit,
        policies: rows
    };
};

/**
 * Get single policy details for employee
 */
const getEmployeePolicyDetails = async (employee_id, acknowledgment_id) => {
    const acknowledgment = await HrmsEmployeePolicyAcknowledgment.findOne({
        where: {
            id: acknowledgment_id,
            employee_id
        },
        include: [
            {
                model: HrmsPolicy,
                as: 'policy',
                include: [
                    {
                        model: HrmsPolicyCategory,
                        as: 'category'
                    },
                    {
                        model: HrmsPolicyAttachment,
                        as: 'attachments',
                        where: { deleted_at: null },
                        required: false
                    }
                ]
            },
            {
                model: HrmsPolicyVersion,
                as: 'version'
            }
        ]
    });

    if (!acknowledgment) {
        throw new Error('Policy not found or not assigned to this employee');
    }

    // Log view event
    await HrmsPolicyAcknowledgmentAudit.create({
        acknowledgment_id: acknowledgment.id,
        policy_id: acknowledgment.policy_id,
        version_id: acknowledgment.version_id,
        employee_id,
        event_type: 'viewed',
        event_description: 'Employee viewed policy',
        performed_by: employee_id,
        performed_at: new Date()
    });

    return acknowledgment;
};

// =====================================================
// POLICY ACKNOWLEDGMENT
// =====================================================

/**
 * Acknowledge policy by employee
 */
const acknowledgePolicyByEmployee = async (acknowledgmentData) => {
    const {
        acknowledgment_id,
        employee_id,
        acknowledgment_comments,
        ip_address,
        user_agent
    } = acknowledgmentData;

    const t = await sequelize.transaction();

    try {
        const acknowledgment = await HrmsEmployeePolicyAcknowledgment.findOne({
            where: {
                id: acknowledgment_id,
                employee_id
            },
            transaction: t
        });

        if (!acknowledgment) {
            throw new Error('Acknowledgment record not found');
        }

        if (acknowledgment.is_acknowledged) {
            throw new Error('Policy already acknowledged');
        }

        // Update acknowledgment
        await acknowledgment.update({
            is_acknowledged: true,
            acknowledged_at: new Date(),
            acknowledgment_ip: ip_address,
            acknowledgment_device: user_agent,
            acknowledgment_comments,
            is_ess_blocked: false,
            ess_blocked_since: null
        }, { transaction: t });

        // Create audit log
        await HrmsPolicyAcknowledgmentAudit.create({
            acknowledgment_id: acknowledgment.id,
            policy_id: acknowledgment.policy_id,
            version_id: acknowledgment.version_id,
            employee_id,
            event_type: 'acknowledged',
            event_description: 'Employee acknowledged policy',
            performed_by: employee_id,
            performed_at: new Date(),
            ip_address,
            user_agent
        }, { transaction: t });

        await t.commit();
        return acknowledgment;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// =====================================================
// ESS ACCESS CHECKING
// =====================================================

/**
 * Check if employee's ESS is blocked
 */
const checkEmployeeESSBlocked = async (employee_id) => {
    const blockedPolicies = await HrmsEmployeePolicyAcknowledgment.findAll({
        where: {
            employee_id,
            is_ess_blocked: true
        },
        include: [
            {
                model: HrmsPolicy,
                as: 'policy',
                attributes: ['id', 'policy_title', 'force_acknowledgment']
            }
        ]
    });

    return {
        is_blocked: blockedPolicies.length > 0,
        blocked_count: blockedPolicies.length,
        blocked_policies: blockedPolicies.map(bp => ({
            acknowledgment_id: bp.id,
            policy_id: bp.policy_id,
            policy_title: bp.policy.policy_title,
            assigned_at: bp.assigned_at,
            due_date: bp.due_date,
            grace_period_ends_at: bp.grace_period_ends_at
        }))
    };
};

/**
 * Get employee's ESS access summary
 */
const getEmployeeESSAccessSummary = async (employee_id) => {
    // Count pending policies
    const pendingCount = await HrmsEmployeePolicyAcknowledgment.count({
        where: {
            employee_id,
            is_acknowledged: false
        }
    });

    // Count force acknowledgment policies
    const forceAcknowledgmentCount = await HrmsEmployeePolicyAcknowledgment.count({
        where: {
            employee_id,
            is_acknowledged: false
        },
        include: [
            {
                model: HrmsPolicy,
                as: 'policy',
                where: { force_acknowledgment: true },
                required: true
            }
        ]
    });

    // Check if blocked
    const blockStatus = await checkEmployeeESSBlocked(employee_id);

    // Count overdue policies
    const overdueCount = await HrmsEmployeePolicyAcknowledgment.count({
        where: {
            employee_id,
            is_acknowledged: false,
            due_date: {
                [Op.lt]: new Date()
            }
        }
    });

    return {
        pending_policies: pendingCount,
        force_acknowledgment_pending: forceAcknowledgmentCount,
        overdue_policies: overdueCount,
        is_ess_blocked: blockStatus.is_blocked,
        blocked_policies_count: blockStatus.blocked_count,
        blocked_policies: blockStatus.blocked_policies
    };
};

// =====================================================
// POLICY CATEGORIES (ESS VIEW)
// =====================================================

/**
 * Get active policy categories
 */
const getActivePolicyCategories = async (company_id) => {
    const categories = await HrmsPolicyCategory.findAll({
        where: {
            company_id,
            is_active: true
        },
        attributes: ['id', 'category_name', 'category_slug', 'category_description'],
        order: [['display_order', 'ASC'], ['category_name', 'ASC']]
    });

    return categories;
};

module.exports = {
    // Policy viewing
    getEmployeeAssignedPolicies,
    getEmployeePendingPolicies,
    getEmployeeAcknowledgedPolicies,
    getEmployeePolicyDetails,

    // Acknowledgment
    acknowledgePolicyByEmployee,

    // ESS access
    checkEmployeeESSBlocked,
    getEmployeeESSAccessSummary,

    // Categories
    getActivePolicyCategories
};
