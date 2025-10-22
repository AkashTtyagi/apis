/**
 * Admin Policy Service
 * Business logic for policy management by administrators
 */

const { Op } = require('sequelize');
const { sequelize } = require('../../utils/database');
const {
    HrmsPolicyCategory,
    HrmsPolicy,
    HrmsPolicyVersion,
    HrmsPolicyAttachment,
    HrmsPolicyApplicability,
    HrmsEmployeePolicyAcknowledgment,
    HrmsPolicyAcknowledgmentAudit,
    HrmsPolicyNotification
} = require('../../models/policy');

// =====================================================
// POLICY CATEGORY MANAGEMENT
// =====================================================

/**
 * Create policy category
 */
const createPolicyCategory = async (categoryData) => {
    const { company_id, category_name, category_slug, category_description, display_order, user_id } = categoryData;

    // Check if category_slug already exists for this company
    const existingCategory = await HrmsPolicyCategory.findOne({
        where: { company_id, category_slug }
    });

    if (existingCategory) {
        throw new Error('Category slug already exists for this company');
    }

    const category = await HrmsPolicyCategory.create({
        company_id,
        category_name,
        category_slug,
        category_description,
        display_order: display_order || 0,
        is_active: true,
        created_by: user_id
    });

    return category;
};

/**
 * Get all categories for a company
 */
const getCategoriesByCompany = async (company_id, includeInactive = false) => {
    const whereClause = { company_id };
    if (!includeInactive) {
        whereClause.is_active = true;
    }

    const categories = await HrmsPolicyCategory.findAll({
        where: whereClause,
        order: [['display_order', 'ASC'], ['category_name', 'ASC']]
    });

    return categories;
};

/**
 * Update policy category
 */
const updatePolicyCategory = async (category_id, updateData) => {
    const { category_name, category_description, display_order, is_active, user_id } = updateData;

    const category = await HrmsPolicyCategory.findByPk(category_id);
    if (!category) {
        throw new Error('Category not found');
    }

    await category.update({
        ...(category_name && { category_name }),
        ...(category_description !== undefined && { category_description }),
        ...(display_order !== undefined && { display_order }),
        ...(is_active !== undefined && { is_active }),
        updated_by: user_id
    });

    return category;
};

/**
 * Delete policy category (soft delete)
 */
const deletePolicyCategory = async (category_id, user_id) => {
    const category = await HrmsPolicyCategory.findByPk(category_id);
    if (!category) {
        throw new Error('Category not found');
    }

    category.updated_by = user_id;
    await category.save();
    await category.destroy();

    return { message: 'Category deleted successfully' };
};

// =====================================================
// POLICY MANAGEMENT (CRUD)
// =====================================================

/**
 * Create new policy
 */
const createPolicy = async (policyData, transaction = null) => {
    const {
        company_id,
        category_id,
        policy_title,
        policy_slug,
        policy_description,
        requires_acknowledgment,
        force_acknowledgment,
        grace_period_days,
        send_notifications,
        notification_channels,
        reminder_frequency_days,
        effective_from,
        expires_on,
        user_id
    } = policyData;

    const t = transaction || await sequelize.transaction();

    try {
        // Check if policy_slug already exists
        const existingPolicy = await HrmsPolicy.findOne({
            where: { company_id, policy_slug },
            transaction: t
        });

        if (existingPolicy) {
            throw new Error('Policy slug already exists for this company');
        }

        // Create policy
        const policy = await HrmsPolicy.create({
            company_id,
            category_id,
            policy_title,
            policy_slug,
            policy_description,
            current_version_number: 1,
            requires_acknowledgment: requires_acknowledgment || false,
            force_acknowledgment: force_acknowledgment || false,
            grace_period_days: grace_period_days || 0,
            send_notifications: send_notifications !== false,
            notification_channels: notification_channels || ['email', 'in_app'],
            reminder_frequency_days: reminder_frequency_days || 3,
            effective_from,
            expires_on,
            is_active: true,
            created_by: user_id
        }, { transaction: t });

        if (!transaction) await t.commit();
        return policy;
    } catch (error) {
        if (!transaction) await t.rollback();
        throw error;
    }
};

/**
 * Get policies by company with filters
 */
const getPoliciesByCompany = async (filters) => {
    const {
        company_id,
        category_id,
        requires_acknowledgment,
        force_acknowledgment,
        is_active,
        search,
        page = 1,
        limit = 50
    } = filters;

    const whereClause = { company_id };

    if (category_id) whereClause.category_id = category_id;
    if (requires_acknowledgment !== undefined) whereClause.requires_acknowledgment = requires_acknowledgment;
    if (force_acknowledgment !== undefined) whereClause.force_acknowledgment = force_acknowledgment;
    if (is_active !== undefined) whereClause.is_active = is_active;

    if (search) {
        whereClause[Op.or] = [
            { policy_title: { [Op.like]: `%${search}%` } },
            { policy_slug: { [Op.like]: `%${search}%` } }
        ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await HrmsPolicy.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: HrmsPolicyCategory,
                as: 'category',
                attributes: ['id', 'category_name', 'category_slug']
            }
        ],
        order: [['created_at', 'DESC']],
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
 * Get policy by ID with details
 */
const getPolicyById = async (policy_id) => {
    const policy = await HrmsPolicy.findByPk(policy_id, {
        include: [
            {
                model: HrmsPolicyCategory,
                as: 'category'
            },
            {
                model: HrmsPolicyVersion,
                as: 'versions',
                order: [['version_number', 'DESC']]
            },
            {
                model: HrmsPolicyApplicability,
                as: 'applicability',
                where: { is_active: true },
                required: false
            }
        ]
    });

    if (!policy) {
        throw new Error('Policy not found');
    }

    return policy;
};

/**
 * Update policy
 */
const updatePolicy = async (policy_id, updateData) => {
    const {
        policy_title,
        policy_description,
        category_id,
        requires_acknowledgment,
        force_acknowledgment,
        grace_period_days,
        send_notifications,
        notification_channels,
        reminder_frequency_days,
        effective_from,
        expires_on,
        is_active,
        user_id
    } = updateData;

    const policy = await HrmsPolicy.findByPk(policy_id);
    if (!policy) {
        throw new Error('Policy not found');
    }

    await policy.update({
        ...(policy_title && { policy_title }),
        ...(policy_description !== undefined && { policy_description }),
        ...(category_id && { category_id }),
        ...(requires_acknowledgment !== undefined && { requires_acknowledgment }),
        ...(force_acknowledgment !== undefined && { force_acknowledgment }),
        ...(grace_period_days !== undefined && { grace_period_days }),
        ...(send_notifications !== undefined && { send_notifications }),
        ...(notification_channels && { notification_channels }),
        ...(reminder_frequency_days !== undefined && { reminder_frequency_days }),
        ...(effective_from !== undefined && { effective_from }),
        ...(expires_on !== undefined && { expires_on }),
        ...(is_active !== undefined && { is_active }),
        updated_by: user_id
    });

    return policy;
};

/**
 * Delete policy (soft delete)
 */
const deletePolicy = async (policy_id, user_id) => {
    const policy = await HrmsPolicy.findByPk(policy_id);
    if (!policy) {
        throw new Error('Policy not found');
    }

    policy.updated_by = user_id;
    await policy.save();
    await policy.destroy(); // Soft delete

    return { message: 'Policy deleted successfully' };
};

// =====================================================
// POLICY VERSION MANAGEMENT
// =====================================================

/**
 * Create new policy version
 */
const createPolicyVersion = async (versionData, transaction = null) => {
    const {
        policy_id,
        version_title,
        version_description,
        policy_content,
        change_summary,
        user_id,
        publish_immediately = false
    } = versionData;

    const t = transaction || await sequelize.transaction();

    try {
        const policy = await HrmsPolicy.findByPk(policy_id, { transaction: t });
        if (!policy) {
            throw new Error('Policy not found');
        }

        // Get previous version
        const previousVersion = await HrmsPolicyVersion.findOne({
            where: { policy_id, is_current_version: true },
            transaction: t
        });

        const newVersionNumber = policy.current_version_number + 1;

        // Create new version
        const version = await HrmsPolicyVersion.create({
            policy_id,
            version_number: newVersionNumber,
            version_title,
            version_description,
            policy_content,
            change_summary,
            is_current_version: publish_immediately,
            published_at: publish_immediately ? new Date() : null,
            published_by: publish_immediately ? user_id : null,
            previous_version_id: previousVersion ? previousVersion.id : null,
            created_by: user_id
        }, { transaction: t });

        // If publishing immediately, update current version
        if (publish_immediately) {
            if (previousVersion) {
                await previousVersion.update({
                    is_current_version: false
                }, { transaction: t });
            }

            await policy.update({
                current_version_number: newVersionNumber
            }, { transaction: t });
        }

        if (!transaction) await t.commit();
        return version;
    } catch (error) {
        if (!transaction) await t.rollback();
        throw error;
    }
};

/**
 * Publish a version (make it current)
 */
const publishPolicyVersion = async (version_id, user_id) => {
    const t = await sequelize.transaction();

    try {
        const version = await HrmsPolicyVersion.findByPk(version_id, { transaction: t });
        if (!version) {
            throw new Error('Version not found');
        }

        const policy = await HrmsPolicy.findByPk(version.policy_id, { transaction: t });

        // Unpublish current version
        await HrmsPolicyVersion.update(
            { is_current_version: false },
            {
                where: {
                    policy_id: version.policy_id,
                    is_current_version: true
                },
                transaction: t
            }
        );

        // Publish this version
        await version.update({
            is_current_version: true,
            published_at: new Date(),
            published_by: user_id
        }, { transaction: t });

        // Update policy current version
        await policy.update({
            current_version_number: version.version_number
        }, { transaction: t });

        await t.commit();
        return version;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

/**
 * Rollback to previous version
 */
const rollbackPolicyVersion = async (policy_id, target_version_number, user_id) => {
    const t = await sequelize.transaction();

    try {
        const targetVersion = await HrmsPolicyVersion.findOne({
            where: { policy_id, version_number: target_version_number },
            transaction: t
        });

        if (!targetVersion) {
            throw new Error('Target version not found');
        }

        await HrmsPolicyVersion.update(
            { is_current_version: false },
            {
                where: { policy_id, is_current_version: true },
                transaction: t
            }
        );

        await targetVersion.update({
            is_current_version: true,
            published_at: new Date(),
            published_by: user_id
        }, { transaction: t });

        const policy = await HrmsPolicy.findByPk(policy_id, { transaction: t });
        await policy.update({
            current_version_number: target_version_number
        }, { transaction: t });

        await t.commit();
        return targetVersion;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

/**
 * Get all versions for a policy
 */
const getPolicyVersions = async (policy_id) => {
    const versions = await HrmsPolicyVersion.findAll({
        where: { policy_id },
        order: [['version_number', 'DESC']]
    });

    return versions;
};

// =====================================================
// POLICY APPLICABILITY MANAGEMENT
// =====================================================

/**
 * Set policy applicability rules
 */
const setPolicyApplicability = async (policy_id, applicabilityRules, user_id) => {
    const t = await sequelize.transaction();

    try {
        const policy = await HrmsPolicy.findByPk(policy_id, { transaction: t });
        if (!policy) {
            throw new Error('Policy not found');
        }

        // Delete existing applicability rules
        await HrmsPolicyApplicability.destroy({
            where: { policy_id },
            transaction: t
        });

        // Create new rules
        const rules = applicabilityRules.map(rule => ({
            policy_id,
            applicability_type: rule.applicability_type,
            applicability_value: rule.applicability_value,
            company_id: policy.company_id,
            is_excluded: rule.is_excluded || false,
            advanced_applicability_type: rule.advanced_applicability_type || 'none',
            advanced_applicability_value: rule.advanced_applicability_value || null,
            priority: rule.priority || 1,
            is_active: true,
            created_by: user_id
        }));

        const createdRules = await HrmsPolicyApplicability.bulkCreate(rules, { transaction: t });

        await t.commit();
        return createdRules;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

/**
 * Get policy applicability rules
 */
const getPolicyApplicability = async (policy_id) => {
    const rules = await HrmsPolicyApplicability.findAll({
        where: { policy_id, is_active: true },
        order: [['priority', 'ASC']]
    });

    return rules;
};

// =====================================================
// POLICY ASSIGNMENT
// =====================================================

/**
 * Assign policy to employees based on applicability rules
 */
const assignPolicyToEmployees = async (policy_id, user_id) => {
    const t = await sequelize.transaction();

    try {
        const policy = await HrmsPolicy.findByPk(policy_id, {
            include: [
                {
                    model: HrmsPolicyVersion,
                    as: 'versions',
                    where: { is_current_version: true },
                    required: true
                },
                {
                    model: HrmsPolicyApplicability,
                    as: 'applicability',
                    where: { is_active: true },
                    required: true
                }
            ],
            transaction: t
        });

        if (!policy) {
            throw new Error('Policy not found or no active version/applicability');
        }

        const currentVersion = policy.versions[0];

        // TODO: Implement employee matching logic based on applicability rules
        // This would query hrms_employees and match against applicability_type and applicability_value
        const employeeIds = []; // Placeholder

        // Create acknowledgment records
        const acknowledgments = [];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // 30 days to acknowledge

        for (const employee_id of employeeIds) {
            const gracePeriodEndsAt = policy.force_acknowledgment && policy.grace_period_days > 0
                ? new Date(Date.now() + policy.grace_period_days * 24 * 60 * 60 * 1000)
                : null;

            acknowledgments.push({
                policy_id,
                version_id: currentVersion.id,
                employee_id,
                assigned_at: new Date(),
                assigned_by: user_id,
                is_acknowledged: false,
                due_date: dueDate,
                grace_period_ends_at: gracePeriodEndsAt,
                is_ess_blocked: false
            });
        }

        const createdAcknowledgments = await HrmsEmployeePolicyAcknowledgment.bulkCreate(
            acknowledgments,
            { transaction: t, ignoreDuplicates: true }
        );

        await t.commit();
        return {
            message: `Policy assigned to ${createdAcknowledgments.length} employees`,
            count: createdAcknowledgments.length
        };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// =====================================================
// POLICY ANALYTICS & REPORTS
// =====================================================

/**
 * Get policy acknowledgment statistics
 */
const getPolicyAcknowledgmentStats = async (policy_id) => {
    const stats = await HrmsEmployeePolicyAcknowledgment.findOne({
        where: { policy_id },
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'total_assigned'],
            [sequelize.fn('SUM', sequelize.literal('CASE WHEN is_acknowledged = 1 THEN 1 ELSE 0 END')), 'acknowledged'],
            [sequelize.fn('SUM', sequelize.literal('CASE WHEN is_acknowledged = 0 THEN 1 ELSE 0 END')), 'pending'],
            [sequelize.fn('SUM', sequelize.literal('CASE WHEN is_ess_blocked = 1 THEN 1 ELSE 0 END')), 'blocked']
        ],
        raw: true
    });

    return stats;
};

/**
 * Get employees with pending acknowledgments
 */
const getEmployeesWithPendingAcknowledgments = async (policy_id, page = 1, limit = 50) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await HrmsEmployeePolicyAcknowledgment.findAndCountAll({
        where: {
            policy_id,
            is_acknowledged: false
        },
        attributes: ['id', 'employee_id', 'assigned_at', 'due_date', 'reminder_count', 'is_ess_blocked'],
        limit,
        offset,
        order: [['assigned_at', 'DESC']]
    });

    return {
        total: count,
        page,
        limit,
        employees: rows
    };
};

/**
 * Send manual reminder for pending acknowledgments
 */
const sendManualReminder = async (acknowledgment_id, user_id) => {
    const acknowledgment = await HrmsEmployeePolicyAcknowledgment.findByPk(acknowledgment_id);
    if (!acknowledgment) {
        throw new Error('Acknowledgment record not found');
    }

    if (acknowledgment.is_acknowledged) {
        throw new Error('Policy already acknowledged');
    }

    // Update reminder count
    await acknowledgment.update({
        reminder_count: acknowledgment.reminder_count + 1,
        last_reminder_sent_at: new Date()
    });

    // Create notification
    await HrmsPolicyNotification.create({
        policy_id: acknowledgment.policy_id,
        acknowledgment_id: acknowledgment.id,
        employee_id: acknowledgment.employee_id,
        notification_type: 'reminder',
        notification_channel: 'email',
        subject: 'Reminder: Pending Policy Acknowledgment',
        message_body: 'Please acknowledge the pending policy',
        status: 'pending',
        scheduled_at: new Date()
    });

    // Create audit log
    await HrmsPolicyAcknowledgmentAudit.create({
        acknowledgment_id: acknowledgment.id,
        policy_id: acknowledgment.policy_id,
        version_id: acknowledgment.version_id,
        employee_id: acknowledgment.employee_id,
        event_type: 'reminder_sent',
        event_description: 'Manual reminder sent by admin',
        performed_by: user_id,
        performed_at: new Date()
    });

    return { message: 'Reminder sent successfully' };
};

module.exports = {
    // Category
    createPolicyCategory,
    getCategoriesByCompany,
    updatePolicyCategory,
    deletePolicyCategory,

    // Policy CRUD
    createPolicy,
    getPoliciesByCompany,
    getPolicyById,
    updatePolicy,
    deletePolicy,

    // Version management
    createPolicyVersion,
    publishPolicyVersion,
    rollbackPolicyVersion,
    getPolicyVersions,

    // Applicability
    setPolicyApplicability,
    getPolicyApplicability,

    // Assignment
    assignPolicyToEmployees,

    // Analytics & Reports
    getPolicyAcknowledgmentStats,
    getEmployeesWithPendingAcknowledgments,
    sendManualReminder
};
