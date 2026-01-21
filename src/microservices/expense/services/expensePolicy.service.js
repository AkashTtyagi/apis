/**
 * Expense Policy Service
 * Business logic for expense policy management
 *
 * POLICY DETERMINES:
 * 1. Which expense categories are available to employees
 * 2. Spending limits (per transaction, day, week, month, etc.)
 * 3. Submission controls (past/future dates, receipt requirements)
 * 4. Duplicate detection rules
 * 5. Policy violation handling
 * 6. Currency settings
 * 7. Advance integration settings
 */

const {
    ExpensePolicy,
    ExpensePolicyApplicability,
    ExpenseApprovalWorkflow,
    ExpenseCurrency
} = require('../../../models/expense');
const { HrmsEmployee } = require('../../../models/HrmsEmployee');
const { sequelize } = require('../../../utils/database');
const { Op } = require('sequelize');

/**
 * Create a new expense policy
 * @param {Object} data - Policy data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is creating
 * @returns {Promise<Object>} Created policy
 */
const createPolicy = async (data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            policy_name,
            policy_code,
            policy_description,
            allowed_categories,
            category_limits_override,
            overall_limit_per_transaction,
            overall_limit_per_day,
            overall_limit_per_week,
            overall_limit_per_month,
            overall_limit_per_quarter,
            overall_limit_per_year,
            allow_past_date_expense,
            max_past_days,
            allow_future_date_expense,
            max_future_days,
            submission_window_start_day,
            submission_window_end_day,
            require_receipt_above,
            allow_edit_after_submit,
            allow_withdraw_after_submit,
            allow_resubmit_rejected,
            max_resubmit_count,
            check_duplicates,
            duplicate_check_fields,
            duplicate_check_days,
            allow_policy_violation,
            require_justification_on_violation,
            auto_flag_violations,
            default_currency_id,
            allowed_currencies,
            allow_multi_currency,
            allow_advance_request,
            max_advance_percentage,
            auto_adjust_advance,
            workflow_id,
            is_default,
            is_active,
            priority,
            applicability
        } = data;

        // Validate required fields
        if (!policy_name || policy_name.trim() === '') {
            throw new Error('Policy name is required');
        }

        if (!policy_code || policy_code.trim() === '') {
            throw new Error('Policy code is required');
        }

        // Check for duplicate policy_code (excluding soft-deleted)
        const existingPolicy = await ExpensePolicy.findOne({
            where: {
                company_id: companyId,
                policy_code: policy_code.trim().toUpperCase(),
                deleted_at: null
            },
            transaction
        });

        if (existingPolicy) {
            throw new Error('A policy with this code already exists');
        }

        // If setting as default, unset other defaults
        if (is_default) {
            await ExpensePolicy.update(
                { is_default: 0, updated_by: userId },
                {
                    where: { company_id: companyId, is_default: 1, deleted_at: null },
                    transaction
                }
            );
        }

        // Create policy
        const policy = await ExpensePolicy.create({
            company_id: companyId,
            policy_name: policy_name.trim(),
            policy_code: policy_code.trim().toUpperCase(),
            policy_description: policy_description || null,
            allowed_categories: allowed_categories || null,
            category_limits_override: category_limits_override || null,
            overall_limit_per_transaction: overall_limit_per_transaction || null,
            overall_limit_per_day: overall_limit_per_day || null,
            overall_limit_per_week: overall_limit_per_week || null,
            overall_limit_per_month: overall_limit_per_month || null,
            overall_limit_per_quarter: overall_limit_per_quarter || null,
            overall_limit_per_year: overall_limit_per_year || null,
            allow_past_date_expense: allow_past_date_expense !== false ? 1 : 0,
            max_past_days: max_past_days || 30,
            allow_future_date_expense: allow_future_date_expense ? 1 : 0,
            max_future_days: max_future_days || 0,
            submission_window_start_day: submission_window_start_day || null,
            submission_window_end_day: submission_window_end_day || null,
            require_receipt_above: require_receipt_above || null,
            allow_edit_after_submit: allow_edit_after_submit ? 1 : 0,
            allow_withdraw_after_submit: allow_withdraw_after_submit !== false ? 1 : 0,
            allow_resubmit_rejected: allow_resubmit_rejected !== false ? 1 : 0,
            max_resubmit_count: max_resubmit_count || 3,
            check_duplicates: check_duplicates !== false ? 1 : 0,
            duplicate_check_fields: duplicate_check_fields || ['amount', 'date', 'category_id'],
            duplicate_check_days: duplicate_check_days || 7,
            allow_policy_violation: allow_policy_violation ? 1 : 0,
            require_justification_on_violation: require_justification_on_violation !== false ? 1 : 0,
            auto_flag_violations: auto_flag_violations !== false ? 1 : 0,
            default_currency_id: default_currency_id || null,
            allowed_currencies: allowed_currencies || null,
            allow_multi_currency: allow_multi_currency ? 1 : 0,
            allow_advance_request: allow_advance_request !== false ? 1 : 0,
            max_advance_percentage: max_advance_percentage || 80.00,
            auto_adjust_advance: auto_adjust_advance !== false ? 1 : 0,
            workflow_id: workflow_id || null,
            is_default: is_default ? 1 : 0,
            is_active: is_active !== false ? 1 : 0,
            priority: priority || 0,
            created_by: userId
        }, { transaction });

        // Create applicability rules if provided
        if (applicability && Array.isArray(applicability) && applicability.length > 0) {
            for (const rule of applicability) {
                await ExpensePolicyApplicability.create({
                    policy_id: policy.id,
                    company_id: companyId,
                    applicability_type: rule.applicability_type,
                    applicability_value: rule.applicability_value || null,
                    advanced_applicability_type: rule.advanced_applicability_type || 'none',
                    advanced_applicability_value: rule.advanced_applicability_value || null,
                    is_excluded: rule.is_excluded ? 1 : 0,
                    priority: rule.priority || 0,
                    is_active: rule.is_active !== false ? 1 : 0,
                    created_by: userId
                }, { transaction });
            }
        }

        await transaction.commit();

        // Fetch and return the created policy with applicability
        return await getPolicyDetails(policy.id, companyId);

    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        throw error;
    }
};

/**
 * Get all policies for a company
 * @param {number} companyId - Company ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} List of policies
 */
const getPolicies = async (companyId, filters = {}) => {
    const {
        is_active,
        is_default,
        search,
        page = 1,
        limit = 50,
        sort_by = 'priority',
        sort_order = 'DESC'
    } = filters;

    const where = {
        company_id: companyId,
        deleted_at: null
    };

    // Apply filters only if explicitly provided
    if (is_active !== undefined && is_active !== null) {
        where.is_active = is_active ? 1 : 0;
    }

    if (is_default !== undefined && is_default !== null) {
        where.is_default = is_default ? 1 : 0;
    }

    if (search && search.trim()) {
        where[Op.or] = [
            { policy_name: { [Op.like]: `%${search.trim()}%` } },
            { policy_code: { [Op.like]: `%${search.trim()}%` } }
        ];
    }

    const offset = (page - 1) * limit;

    // Get policies with count
    const { count, rows } = await ExpensePolicy.findAndCountAll({
        where,
        include: [
            {
                model: ExpensePolicyApplicability,
                as: 'applicability',
                where: { is_active: 1 },
                required: false
            },
            {
                model: ExpenseApprovalWorkflow,
                as: 'workflow',
                attributes: ['id', 'workflow_name', 'workflow_code'],
                required: false
            },
            {
                model: ExpenseCurrency,
                as: 'defaultCurrency',
                attributes: ['id', 'currency_code', 'currency_name', 'currency_symbol'],
                required: false
            }
        ],
        order: [[sort_by, sort_order.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    // Get creator names using raw query
    const policyIds = rows.map(p => p.id);
    if (policyIds.length > 0) {
        const [creatorInfo] = await sequelize.query(`
            SELECT
                p.id,
                CONCAT_WS(' ', ec.first_name, ec.middle_name, ec.last_name) as created_by_name,
                ec.employee_code as created_by_code,
                CONCAT_WS(' ', eu.first_name, eu.middle_name, eu.last_name) as updated_by_name,
                eu.employee_code as updated_by_code
            FROM hrms_expense_policies p
            LEFT JOIN hrms_employees ec ON ec.user_id = p.created_by
            LEFT JOIN hrms_employees eu ON eu.user_id = p.updated_by
            WHERE p.id IN (${policyIds.join(',')})
        `);

        const creatorMap = {};
        creatorInfo.forEach(c => {
            creatorMap[c.id] = c;
        });

        rows.forEach(policy => {
            const info = creatorMap[policy.id] || {};
            policy.dataValues.created_by_name = info.created_by_name || null;
            policy.dataValues.created_by_code = info.created_by_code || null;
            policy.dataValues.updated_by_name = info.updated_by_name || null;
            policy.dataValues.updated_by_code = info.updated_by_code || null;
        });
    }

    return {
        policies: rows,
        pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
        }
    };
};

/**
 * Get policy details by ID
 * @param {number} policyId - Policy ID
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Policy details
 */
const getPolicyDetails = async (policyId, companyId) => {
    const policy = await ExpensePolicy.findOne({
        where: {
            id: policyId,
            company_id: companyId,
            deleted_at: null
        },
        include: [
            {
                model: ExpensePolicyApplicability,
                as: 'applicability',
                required: false
            },
            {
                model: ExpenseApprovalWorkflow,
                as: 'workflow',
                attributes: ['id', 'workflow_name', 'workflow_code'],
                required: false
            },
            {
                model: ExpenseCurrency,
                as: 'defaultCurrency',
                attributes: ['id', 'currency_code', 'currency_name', 'currency_symbol'],
                required: false
            }
        ]
    });

    if (!policy) {
        return null;
    }

    // Get creator/updater names
    const [employeeInfo] = await sequelize.query(`
        SELECT
            CONCAT_WS(' ', ec.first_name, ec.middle_name, ec.last_name) as created_by_name,
            ec.employee_code as created_by_code,
            CONCAT_WS(' ', eu.first_name, eu.middle_name, eu.last_name) as updated_by_name,
            eu.employee_code as updated_by_code
        FROM hrms_expense_policies p
        LEFT JOIN hrms_employees ec ON ec.user_id = p.created_by
        LEFT JOIN hrms_employees eu ON eu.user_id = p.updated_by
        WHERE p.id = ${policyId}
    `);

    if (employeeInfo.length > 0) {
        policy.dataValues.created_by_name = employeeInfo[0].created_by_name || null;
        policy.dataValues.created_by_code = employeeInfo[0].created_by_code || null;
        policy.dataValues.updated_by_name = employeeInfo[0].updated_by_name || null;
        policy.dataValues.updated_by_code = employeeInfo[0].updated_by_code || null;
    }

    return policy;
};

/**
 * Update an existing policy
 * @param {number} policyId - Policy ID
 * @param {Object} data - Update data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is updating
 * @returns {Promise<Object>} Updated policy
 */
const updatePolicy = async (policyId, data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const policy = await ExpensePolicy.findOne({
            where: {
                id: policyId,
                company_id: companyId,
                deleted_at: null
            },
            transaction
        });

        if (!policy) {
            throw new Error('Policy not found');
        }

        const {
            policy_name,
            policy_code,
            policy_description,
            allowed_categories,
            category_limits_override,
            overall_limit_per_transaction,
            overall_limit_per_day,
            overall_limit_per_week,
            overall_limit_per_month,
            overall_limit_per_quarter,
            overall_limit_per_year,
            allow_past_date_expense,
            max_past_days,
            allow_future_date_expense,
            max_future_days,
            submission_window_start_day,
            submission_window_end_day,
            require_receipt_above,
            allow_edit_after_submit,
            allow_withdraw_after_submit,
            allow_resubmit_rejected,
            max_resubmit_count,
            check_duplicates,
            duplicate_check_fields,
            duplicate_check_days,
            allow_policy_violation,
            require_justification_on_violation,
            auto_flag_violations,
            default_currency_id,
            allowed_currencies,
            allow_multi_currency,
            allow_advance_request,
            max_advance_percentage,
            auto_adjust_advance,
            workflow_id,
            is_default,
            is_active,
            priority,
            applicability
        } = data;

        // Check for duplicate policy_code if changing
        if (policy_code && policy_code.trim().toUpperCase() !== policy.policy_code) {
            const existingPolicy = await ExpensePolicy.findOne({
                where: {
                    company_id: companyId,
                    policy_code: policy_code.trim().toUpperCase(),
                    deleted_at: null,
                    id: { [Op.ne]: policyId }
                },
                transaction
            });

            if (existingPolicy) {
                throw new Error('A policy with this code already exists');
            }
        }

        // If setting as default, unset other defaults
        if (is_default && !policy.is_default) {
            await ExpensePolicy.update(
                { is_default: 0, updated_by: userId },
                {
                    where: {
                        company_id: companyId,
                        is_default: 1,
                        deleted_at: null,
                        id: { [Op.ne]: policyId }
                    },
                    transaction
                }
            );
        }

        // Update policy
        await policy.update({
            policy_name: policy_name !== undefined ? policy_name.trim() : policy.policy_name,
            policy_code: policy_code !== undefined ? policy_code.trim().toUpperCase() : policy.policy_code,
            policy_description: policy_description !== undefined ? policy_description : policy.policy_description,
            allowed_categories: allowed_categories !== undefined ? allowed_categories : policy.allowed_categories,
            category_limits_override: category_limits_override !== undefined ? category_limits_override : policy.category_limits_override,
            overall_limit_per_transaction: overall_limit_per_transaction !== undefined ? overall_limit_per_transaction : policy.overall_limit_per_transaction,
            overall_limit_per_day: overall_limit_per_day !== undefined ? overall_limit_per_day : policy.overall_limit_per_day,
            overall_limit_per_week: overall_limit_per_week !== undefined ? overall_limit_per_week : policy.overall_limit_per_week,
            overall_limit_per_month: overall_limit_per_month !== undefined ? overall_limit_per_month : policy.overall_limit_per_month,
            overall_limit_per_quarter: overall_limit_per_quarter !== undefined ? overall_limit_per_quarter : policy.overall_limit_per_quarter,
            overall_limit_per_year: overall_limit_per_year !== undefined ? overall_limit_per_year : policy.overall_limit_per_year,
            allow_past_date_expense: allow_past_date_expense !== undefined ? (allow_past_date_expense ? 1 : 0) : policy.allow_past_date_expense,
            max_past_days: max_past_days !== undefined ? max_past_days : policy.max_past_days,
            allow_future_date_expense: allow_future_date_expense !== undefined ? (allow_future_date_expense ? 1 : 0) : policy.allow_future_date_expense,
            max_future_days: max_future_days !== undefined ? max_future_days : policy.max_future_days,
            submission_window_start_day: submission_window_start_day !== undefined ? submission_window_start_day : policy.submission_window_start_day,
            submission_window_end_day: submission_window_end_day !== undefined ? submission_window_end_day : policy.submission_window_end_day,
            require_receipt_above: require_receipt_above !== undefined ? require_receipt_above : policy.require_receipt_above,
            allow_edit_after_submit: allow_edit_after_submit !== undefined ? (allow_edit_after_submit ? 1 : 0) : policy.allow_edit_after_submit,
            allow_withdraw_after_submit: allow_withdraw_after_submit !== undefined ? (allow_withdraw_after_submit ? 1 : 0) : policy.allow_withdraw_after_submit,
            allow_resubmit_rejected: allow_resubmit_rejected !== undefined ? (allow_resubmit_rejected ? 1 : 0) : policy.allow_resubmit_rejected,
            max_resubmit_count: max_resubmit_count !== undefined ? max_resubmit_count : policy.max_resubmit_count,
            check_duplicates: check_duplicates !== undefined ? (check_duplicates ? 1 : 0) : policy.check_duplicates,
            duplicate_check_fields: duplicate_check_fields !== undefined ? duplicate_check_fields : policy.duplicate_check_fields,
            duplicate_check_days: duplicate_check_days !== undefined ? duplicate_check_days : policy.duplicate_check_days,
            allow_policy_violation: allow_policy_violation !== undefined ? (allow_policy_violation ? 1 : 0) : policy.allow_policy_violation,
            require_justification_on_violation: require_justification_on_violation !== undefined ? (require_justification_on_violation ? 1 : 0) : policy.require_justification_on_violation,
            auto_flag_violations: auto_flag_violations !== undefined ? (auto_flag_violations ? 1 : 0) : policy.auto_flag_violations,
            default_currency_id: default_currency_id !== undefined ? default_currency_id : policy.default_currency_id,
            allowed_currencies: allowed_currencies !== undefined ? allowed_currencies : policy.allowed_currencies,
            allow_multi_currency: allow_multi_currency !== undefined ? (allow_multi_currency ? 1 : 0) : policy.allow_multi_currency,
            allow_advance_request: allow_advance_request !== undefined ? (allow_advance_request ? 1 : 0) : policy.allow_advance_request,
            max_advance_percentage: max_advance_percentage !== undefined ? max_advance_percentage : policy.max_advance_percentage,
            auto_adjust_advance: auto_adjust_advance !== undefined ? (auto_adjust_advance ? 1 : 0) : policy.auto_adjust_advance,
            workflow_id: workflow_id !== undefined ? workflow_id : policy.workflow_id,
            is_default: is_default !== undefined ? (is_default ? 1 : 0) : policy.is_default,
            is_active: is_active !== undefined ? (is_active ? 1 : 0) : policy.is_active,
            priority: priority !== undefined ? priority : policy.priority,
            updated_by: userId
        }, { transaction });

        // Update applicability if provided
        if (applicability && Array.isArray(applicability)) {
            // Delete existing applicability rules
            await ExpensePolicyApplicability.destroy({
                where: { policy_id: policyId },
                transaction
            });

            // Create new applicability rules
            for (const rule of applicability) {
                await ExpensePolicyApplicability.create({
                    policy_id: policyId,
                    company_id: companyId,
                    applicability_type: rule.applicability_type,
                    applicability_value: rule.applicability_value || null,
                    advanced_applicability_type: rule.advanced_applicability_type || 'none',
                    advanced_applicability_value: rule.advanced_applicability_value || null,
                    is_excluded: rule.is_excluded ? 1 : 0,
                    priority: rule.priority || 0,
                    is_active: rule.is_active !== false ? 1 : 0,
                    created_by: userId
                }, { transaction });
            }
        }

        await transaction.commit();

        return await getPolicyDetails(policyId, companyId);

    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        throw error;
    }
};

/**
 * Delete a policy (soft delete)
 * @param {number} policyId - Policy ID
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is deleting
 * @returns {Promise<boolean>} Success status
 */
const deletePolicy = async (policyId, companyId, userId) => {
    const policy = await ExpensePolicy.findOne({
        where: {
            id: policyId,
            company_id: companyId,
            deleted_at: null
        }
    });

    if (!policy) {
        throw new Error('Policy not found');
    }

    // Check if this is the default policy
    if (policy.is_default) {
        throw new Error('Cannot delete the default policy. Please set another policy as default first.');
    }

    // Soft delete
    await policy.update({
        deleted_at: new Date(),
        deleted_by: userId,
        is_active: 0
    });

    return true;
};

/**
 * Check policy usage before deletion
 * @param {number} policyId - Policy ID
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Usage information
 */
const checkUsage = async (policyId, companyId) => {
    const policy = await ExpensePolicy.findOne({
        where: {
            id: policyId,
            company_id: companyId,
            deleted_at: null
        }
    });

    if (!policy) {
        return { exists: false, canDelete: false };
    }

    const usage = {
        exists: true,
        canDelete: true,
        isDefault: policy.is_default === 1,
        applicabilityCount: 0,
        reasons: []
    };

    // Check if default
    if (policy.is_default) {
        usage.canDelete = false;
        usage.reasons.push('This is the default policy');
    }

    // Count applicability rules
    const applicabilityCount = await ExpensePolicyApplicability.count({
        where: { policy_id: policyId, is_active: 1 }
    });
    usage.applicabilityCount = applicabilityCount;

    // TODO: Check if any expense requests are using this policy
    // This will be added when expense request table is created

    return usage;
};

/**
 * Find applicable policy for an employee
 * @param {number} companyId - Company ID
 * @param {Object} employeeData - Employee attributes
 * @returns {Promise<Object|null>} Applicable policy
 */
const findApplicablePolicyForEmployee = async (companyId, employeeData) => {
    const {
        employee_id,
        department_id,
        sub_department_id,
        designation_id,
        grade_id,
        level_id,
        location_id,
        entity_id,
        employee_type_id
    } = employeeData;

    // Get all active policies with applicability rules
    const policies = await ExpensePolicy.findAll({
        where: {
            company_id: companyId,
            is_active: 1,
            deleted_at: null
        },
        include: [
            {
                model: ExpensePolicyApplicability,
                as: 'applicability',
                where: { is_active: 1 },
                required: false
            }
        ],
        order: [['priority', 'DESC'], ['id', 'ASC']]
    });

    if (!policies || policies.length === 0) {
        return null;
    }

    // Find matching policy
    for (const policy of policies) {
        const applicability = policy.applicability || [];

        // If no applicability rules, check if it's company-wide
        if (applicability.length === 0) {
            continue;
        }

        // Check exclusions first
        const exclusions = applicability.filter(a => a.is_excluded === 1);
        let isExcluded = false;

        for (const exclusion of exclusions) {
            if (matchesApplicability(exclusion, employeeData)) {
                isExcluded = true;
                break;
            }
        }

        if (isExcluded) {
            continue;
        }

        // Check inclusions
        const inclusions = applicability.filter(a => a.is_excluded === 0);

        for (const inclusion of inclusions) {
            if (matchesApplicability(inclusion, employeeData)) {
                return policy;
            }
        }
    }

    // Fall back to default policy
    const defaultPolicy = policies.find(p => p.is_default === 1);
    return defaultPolicy || null;
};

/**
 * Check if employee matches applicability rule
 * @param {Object} rule - Applicability rule
 * @param {Object} employeeData - Employee attributes
 * @returns {boolean} Whether employee matches
 */
const matchesApplicability = (rule, employeeData) => {
    const type = rule.applicability_type;
    const value = rule.applicability_value;
    const values = value ? value.split(',').map(v => v.trim()) : [];

    const {
        employee_id,
        department_id,
        sub_department_id,
        designation_id,
        grade_id,
        level_id,
        location_id,
        entity_id,
        employee_type_id
    } = employeeData;

    let matches = false;

    switch (type) {
        case 'company':
            // Applies to entire company
            matches = true;
            break;
        case 'entity':
            matches = entity_id && (values.length === 0 || values.includes(String(entity_id)));
            break;
        case 'department':
            matches = department_id && (values.length === 0 || values.includes(String(department_id)));
            break;
        case 'sub_department':
            matches = sub_department_id && (values.length === 0 || values.includes(String(sub_department_id)));
            break;
        case 'designation':
            matches = designation_id && (values.length === 0 || values.includes(String(designation_id)));
            break;
        case 'grade':
            matches = grade_id && (values.length === 0 || values.includes(String(grade_id)));
            break;
        case 'level':
            matches = level_id && (values.length === 0 || values.includes(String(level_id)));
            break;
        case 'location':
            matches = location_id && (values.length === 0 || values.includes(String(location_id)));
            break;
        case 'employee_type':
            matches = employee_type_id && (values.length === 0 || values.includes(String(employee_type_id)));
            break;
        case 'employee':
            matches = employee_id && values.includes(String(employee_id));
            break;
    }

    // Check advanced applicability if primary matches
    if (matches && rule.advanced_applicability_type && rule.advanced_applicability_type !== 'none') {
        const advType = rule.advanced_applicability_type;
        const advValue = rule.advanced_applicability_value;
        const advValues = advValue ? advValue.split(',').map(v => v.trim()) : [];

        // Apply advanced filter (AND condition)
        switch (advType) {
            case 'employee_type':
                matches = employee_type_id && (advValues.length === 0 || advValues.includes(String(employee_type_id)));
                break;
            case 'grade':
                matches = grade_id && (advValues.length === 0 || advValues.includes(String(grade_id)));
                break;
            // Add more advanced types as needed
        }
    }

    return matches;
};

/**
 * Get allowed categories for an employee based on their policy
 * @param {number} companyId - Company ID
 * @param {Object} employeeData - Employee attributes
 * @returns {Promise<Array|null>} Array of allowed category IDs or null for all
 */
const getAllowedCategoriesForEmployee = async (companyId, employeeData) => {
    const policy = await findApplicablePolicyForEmployee(companyId, employeeData);

    if (!policy) {
        return null; // No policy, all categories allowed
    }

    return policy.allowed_categories || null; // null means all categories
};

/**
 * Manage applicability rules for a policy
 * @param {number} policyId - Policy ID
 * @param {Array} rules - Applicability rules
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Updated rules
 */
const manageApplicability = async (policyId, rules, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        // Verify policy exists
        const policy = await ExpensePolicy.findOne({
            where: {
                id: policyId,
                company_id: companyId,
                deleted_at: null
            },
            transaction
        });

        if (!policy) {
            throw new Error('Policy not found');
        }

        // Delete existing rules
        await ExpensePolicyApplicability.destroy({
            where: { policy_id: policyId },
            transaction
        });

        // Create new rules
        const createdRules = [];
        for (const rule of rules) {
            const created = await ExpensePolicyApplicability.create({
                policy_id: policyId,
                company_id: companyId,
                applicability_type: rule.applicability_type,
                applicability_value: rule.applicability_value || null,
                advanced_applicability_type: rule.advanced_applicability_type || 'none',
                advanced_applicability_value: rule.advanced_applicability_value || null,
                is_excluded: rule.is_excluded ? 1 : 0,
                priority: rule.priority || 0,
                is_active: rule.is_active !== false ? 1 : 0,
                created_by: userId
            }, { transaction });
            createdRules.push(created);
        }

        await transaction.commit();
        return createdRules;

    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        throw error;
    }
};

/**
 * Toggle policy status
 * @param {number} policyId - Policy ID
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated policy
 */
const toggleStatus = async (policyId, companyId, userId) => {
    const policy = await ExpensePolicy.findOne({
        where: {
            id: policyId,
            company_id: companyId,
            deleted_at: null
        }
    });

    if (!policy) {
        throw new Error('Policy not found');
    }

    // Don't allow deactivating default policy
    if (policy.is_default && policy.is_active) {
        throw new Error('Cannot deactivate the default policy');
    }

    await policy.update({
        is_active: policy.is_active ? 0 : 1,
        updated_by: userId
    });

    return await getPolicyDetails(policyId, companyId);
};

/**
 * Set default policy
 * @param {number} policyId - Policy ID
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated policy
 */
const setDefaultPolicy = async (policyId, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const policy = await ExpensePolicy.findOne({
            where: {
                id: policyId,
                company_id: companyId,
                deleted_at: null
            },
            transaction
        });

        if (!policy) {
            throw new Error('Policy not found');
        }

        if (!policy.is_active) {
            throw new Error('Cannot set an inactive policy as default');
        }

        // Unset other defaults
        await ExpensePolicy.update(
            { is_default: 0, updated_by: userId },
            {
                where: {
                    company_id: companyId,
                    is_default: 1,
                    deleted_at: null,
                    id: { [Op.ne]: policyId }
                },
                transaction
            }
        );

        // Set this as default
        await policy.update({
            is_default: 1,
            updated_by: userId
        }, { transaction });

        await transaction.commit();

        return await getPolicyDetails(policyId, companyId);

    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        throw error;
    }
};

module.exports = {
    createPolicy,
    getPolicies,
    getPolicyDetails,
    updatePolicy,
    deletePolicy,
    checkUsage,
    findApplicablePolicyForEmployee,
    getAllowedCategoriesForEmployee,
    manageApplicability,
    toggleStatus,
    setDefaultPolicy
};
