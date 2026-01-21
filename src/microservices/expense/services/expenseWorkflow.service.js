/**
 * Expense Workflow Service
 * Business logic for expense approval workflow management
 *
 * WORKFLOW SELECTION FLOW:
 * 1. Applicability (WHO) → Selects which workflow based on employee attributes
 *    - Department, Grade, Designation, Level, Location, Entity, Employee
 *
 * 2. workflow_scope (HOW) → Defines how workflow processes items
 *    - All_Expenses: Same approval chain for all items
 *    - Category_Specific: Different stages for different categories
 *    - Amount_Based: Different stages based on amount ranges
 *    - Policy_Specific: Based on expense policy
 */

const {
    ExpenseApprovalWorkflow,
    ExpenseApprovalWorkflowStage,
    ExpenseWorkflowCategoryMapping,
    ExpenseWorkflowApplicability,
    ExpenseCategory
} = require('../../../models/expense');
const { HrmsEmployee } = require('../../../models/HrmsEmployee');
const { sequelize } = require('../../../utils/database');
const { Op } = require('sequelize');

/**
 * Create a new expense approval workflow with stages
 * @param {Object} data - Workflow data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is creating
 * @returns {Promise<Object>} Created workflow
 */
const createWorkflow = async (data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            workflow_name,
            workflow_code,
            workflow_description,
            workflow_scope,
            approval_mode,
            approval_level,
            allow_partial_approval,
            allow_partial_amount_approval,
            allow_amount_modification,
            max_amount_reduction_percentage,
            escalation_enabled,
            escalation_after_hours,
            escalation_reminder_hours,
            max_escalation_levels,
            escalation_to,
            escalation_user_id,
            auto_approve_enabled,
            auto_approve_max_amount,
            auto_approve_categories,
            auto_approve_for_grades,
            auto_reject_enabled,
            auto_reject_after_days,
            allow_send_back,
            max_send_back_count,
            notification_settings,
            is_default,
            is_active,
            stages
        } = data;

        // Validate required fields
        if (!workflow_name || workflow_name.trim() === '') {
            throw new Error('Workflow name is required');
        }

        if (!workflow_code || workflow_code.trim() === '') {
            throw new Error('Workflow code is required');
        }

        // Check for duplicate workflow_code
        const existingWorkflow = await ExpenseApprovalWorkflow.findOne({
            where: {
                company_id: companyId,
                workflow_code: workflow_code.trim(),
                deleted_at: null
            },
            transaction
        });

        if (existingWorkflow) {
            throw new Error('A workflow with this code already exists');
        }

        // If setting as default, unset other defaults
        if (is_default) {
            await ExpenseApprovalWorkflow.update(
                { is_default: 0, updated_by: userId },
                {
                    where: { company_id: companyId, is_default: 1 },
                    transaction
                }
            );
        }

        // Extract notification settings
        const notificationFields = notification_settings || {};

        // Create workflow
        const workflow = await ExpenseApprovalWorkflow.create({
            company_id: companyId,
            workflow_name: workflow_name.trim(),
            workflow_code: workflow_code.trim().toUpperCase(),
            workflow_description: workflow_description || null,
            workflow_scope: workflow_scope || 'All_Expenses',
            approval_mode: approval_mode || 'Sequential',
            approval_level: approval_level || 'Line_Item_Level',
            allow_partial_approval: allow_partial_approval !== false ? 1 : 0,
            allow_partial_amount_approval: allow_partial_amount_approval ? 1 : 0,
            allow_amount_modification: allow_amount_modification ? 1 : 0,
            max_amount_reduction_percentage: max_amount_reduction_percentage || 100,
            escalation_enabled: escalation_enabled !== false ? 1 : 0,
            escalation_after_hours: escalation_after_hours || 48,
            escalation_reminder_hours: escalation_reminder_hours || 24,
            max_escalation_levels: max_escalation_levels || 3,
            escalation_to: escalation_to || 'Skip_Level_Manager',
            escalation_user_id: escalation_user_id || null,
            auto_approve_enabled: auto_approve_enabled ? 1 : 0,
            auto_approve_max_amount: auto_approve_max_amount || null,
            auto_approve_categories: auto_approve_categories || null,
            auto_approve_for_grades: auto_approve_for_grades || null,
            auto_reject_enabled: auto_reject_enabled ? 1 : 0,
            auto_reject_after_days: auto_reject_after_days || null,
            allow_send_back: allow_send_back !== false ? 1 : 0,
            max_send_back_count: max_send_back_count || 3,
            // Notification settings
            email_notifications_enabled: notificationFields.email_notifications_enabled !== false ? 1 : 0,
            notify_requester_on_submit: notificationFields.notify_requester_on_submit !== false ? 1 : 0,
            notify_approver_on_submit: notificationFields.notify_approver_on_submit !== false ? 1 : 0,
            notify_requester_on_approve: notificationFields.notify_requester_on_approve !== false ? 1 : 0,
            notify_requester_on_reject: notificationFields.notify_requester_on_reject !== false ? 1 : 0,
            notify_requester_on_send_back: notificationFields.notify_requester_on_send_back !== false ? 1 : 0,
            notify_requester_on_payment: notificationFields.notify_requester_on_payment !== false ? 1 : 0,
            notify_finance_on_approval: notificationFields.notify_finance_on_approval ? 1 : 0,
            notify_approver_on_escalation: notificationFields.notify_approver_on_escalation !== false ? 1 : 0,
            notify_next_approver: notificationFields.notify_next_approver !== false ? 1 : 0,
            enable_pending_reminders: notificationFields.enable_pending_reminders !== false ? 1 : 0,
            pending_reminder_hours: notificationFields.pending_reminder_hours || 24,
            pending_reminder_frequency_hours: notificationFields.pending_reminder_frequency_hours || 24,
            max_pending_reminders: notificationFields.max_pending_reminders || 3,
            push_notifications_enabled: notificationFields.push_notifications_enabled !== false ? 1 : 0,
            push_on_submit: notificationFields.push_on_submit !== false ? 1 : 0,
            push_on_action: notificationFields.push_on_action !== false ? 1 : 0,
            push_on_reminder: notificationFields.push_on_reminder !== false ? 1 : 0,
            cc_manager_on_approval: notificationFields.cc_manager_on_approval ? 1 : 0,
            cc_hr_on_rejection: notificationFields.cc_hr_on_rejection ? 1 : 0,
            additional_cc_emails: notificationFields.additional_cc_emails || null,
            is_default: is_default ? 1 : 0,
            is_active: is_active !== false ? 1 : 0,
            created_by: userId
        }, { transaction });

        // Create stages if provided
        let stagesCount = 0;
        if (stages && Array.isArray(stages) && stages.length > 0) {
            for (const stage of stages) {
                await ExpenseApprovalWorkflowStage.create({
                    workflow_id: workflow.id,
                    stage_order: stage.stage_order,
                    stage_name: stage.stage_name,
                    stage_description: stage.stage_description || null,
                    min_amount: stage.min_amount || 0,
                    max_amount: stage.max_amount || null,
                    applies_to_categories: stage.applies_to_categories || null,
                    approver_type: stage.approver_type,
                    approver_user_ids: stage.approver_user_ids || null,
                    approver_role_id: stage.approver_role_id || null,
                    approver_permission_code: stage.approver_permission_code || null,
                    custom_approver_field: stage.custom_approver_field || null,
                    multi_approver_mode: stage.multi_approver_mode || 'Any_One',
                    min_approvals_required: stage.min_approvals_required || 1,
                    is_mandatory: stage.is_mandatory !== false ? 1 : 0,
                    skip_if_same_approver: stage.skip_if_same_approver !== false ? 1 : 0,
                    skip_if_self_approved: stage.skip_if_self_approved ? 1 : 0,
                    can_approve: stage.can_approve !== false ? 1 : 0,
                    can_reject: stage.can_reject !== false ? 1 : 0,
                    can_send_back: stage.can_send_back !== false ? 1 : 0,
                    can_hold: stage.can_hold ? 1 : 0,
                    can_delegate: stage.can_delegate ? 1 : 0,
                    can_modify_amount: stage.can_modify_amount ? 1 : 0,
                    can_add_comments: stage.can_add_comments !== false ? 1 : 0,
                    can_request_documents: stage.can_request_documents !== false ? 1 : 0,
                    comments_mandatory_on_reject: stage.comments_mandatory_on_reject !== false ? 1 : 0,
                    sla_hours: stage.sla_hours || 48,
                    sla_warning_hours: stage.sla_warning_hours || 36,
                    sla_breach_action: stage.sla_breach_action || 'Notify',
                    stage_escalation_enabled: stage.stage_escalation_enabled,
                    stage_escalation_hours: stage.stage_escalation_hours || null,
                    stage_escalation_to: stage.stage_escalation_to || null,
                    stage_escalation_user_id: stage.stage_escalation_user_id || null,
                    is_active: 1,
                    created_by: userId
                }, { transaction });
                stagesCount++;
            }
        }

        await transaction.commit();

        return {
            id: workflow.id,
            workflow_name: workflow.workflow_name,
            workflow_code: workflow.workflow_code,
            stages_count: stagesCount,
            is_default: workflow.is_default === 1,
            created_at: workflow.created_at
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get all workflows with filters and pagination
 * @param {Object} filters - Filter options
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Workflows with pagination
 */
const getAllWorkflows = async (filters, companyId) => {
    const {
        is_active,
        search,
        workflow_scope,
        limit = 50,
        offset = 0,
        sort_by = 'created_at',
        sort_order = 'desc'
    } = filters;

    const where = {
        company_id: companyId,
        deleted_at: null
    };

    // Filter by active status (only apply if explicitly true or false, not null)
    if (is_active !== undefined && is_active !== null) {
        where.is_active = is_active ? 1 : 0;
    }

    // Filter by workflow scope
    if (workflow_scope) {
        where.workflow_scope = workflow_scope;
    }

    // Search by name or code
    if (search && search.trim()) {
        where[Op.or] = [
            { workflow_name: { [Op.like]: `%${search.trim()}%` } },
            { workflow_code: { [Op.like]: `%${search.trim()}%` } }
        ];
    }

    // Validate sort_by field
    const validSortFields = ['workflow_name', 'workflow_code', 'created_at', 'updated_at'];
    const orderField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const orderDirection = sort_order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const total = await ExpenseApprovalWorkflow.count({ where });

    // Get workflows with stage counts
    const workflows = await ExpenseApprovalWorkflow.findAll({
        where,
        include: [
            {
                model: ExpenseApprovalWorkflowStage,
                as: 'stages',
                attributes: ['id'],
                where: { is_active: 1 },
                required: false
            }
        ],
        order: [[orderField, orderDirection]],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    // Format response
    const data = workflows.map(wf => ({
        id: wf.id,
        workflow_name: wf.workflow_name,
        workflow_code: wf.workflow_code,
        workflow_description: wf.workflow_description,
        workflow_scope: wf.workflow_scope,
        approval_mode: wf.approval_mode,
        approval_level: wf.approval_level,
        is_default: wf.is_default === 1,
        is_active: wf.is_active === 1,
        stages_count: wf.stages ? wf.stages.length : 0,
        created_at: wf.created_at,
        updated_at: wf.updated_at
    }));

    return {
        data,
        pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            total_pages: Math.ceil(total / parseInt(limit)),
            current_page: Math.floor(parseInt(offset) / parseInt(limit)) + 1
        }
    };
};

/**
 * Get workflow details by ID
 * @param {number} workflowId - Workflow ID
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Workflow details
 */
const getWorkflowDetails = async (workflowId, companyId) => {
    if (!workflowId) {
        throw new Error('Workflow ID is required');
    }

    const workflow = await ExpenseApprovalWorkflow.findOne({
        where: {
            id: workflowId,
            company_id: companyId,
            deleted_at: null
        },
        include: [
            {
                model: ExpenseApprovalWorkflowStage,
                as: 'stages',
                where: { is_active: 1 },
                required: false,
                order: [['stage_order', 'ASC']]
            },
            {
                model: ExpenseWorkflowCategoryMapping,
                as: 'categoryMappings',
                where: { is_active: 1 },
                required: false,
                include: [
                    {
                        model: ExpenseCategory,
                        as: 'category',
                        attributes: ['id', 'category_name', 'category_code']
                    }
                ]
            }
        ]
    });

    if (!workflow) {
        throw new Error('Workflow not found');
    }

    // Format stages
    const stages = (workflow.stages || [])
        .sort((a, b) => a.stage_order - b.stage_order)
        .map(stage => ({
            id: stage.id,
            stage_order: stage.stage_order,
            stage_name: stage.stage_name,
            stage_description: stage.stage_description,
            min_amount: parseFloat(stage.min_amount) || 0,
            max_amount: stage.max_amount ? parseFloat(stage.max_amount) : null,
            applies_to_categories: stage.applies_to_categories,
            approver_type: stage.approver_type,
            approver_user_ids: stage.approver_user_ids,
            approver_role_id: stage.approver_role_id,
            multi_approver_mode: stage.multi_approver_mode,
            min_approvals_required: stage.min_approvals_required,
            is_mandatory: stage.is_mandatory === 1,
            skip_if_same_approver: stage.skip_if_same_approver === 1,
            skip_if_self_approved: stage.skip_if_self_approved === 1,
            can_approve: stage.can_approve === 1,
            can_reject: stage.can_reject === 1,
            can_send_back: stage.can_send_back === 1,
            can_hold: stage.can_hold === 1,
            can_delegate: stage.can_delegate === 1,
            can_modify_amount: stage.can_modify_amount === 1,
            comments_mandatory_on_reject: stage.comments_mandatory_on_reject === 1,
            sla_hours: stage.sla_hours,
            sla_warning_hours: stage.sla_warning_hours,
            sla_breach_action: stage.sla_breach_action
        }));

    // Format category mappings
    const categoryMappings = (workflow.categoryMappings || []).map(mapping => ({
        id: mapping.id,
        category_id: mapping.category_id,
        category_name: mapping.category?.category_name,
        category_code: mapping.category?.category_code,
        min_amount: parseFloat(mapping.min_amount) || 0,
        max_amount: mapping.max_amount ? parseFloat(mapping.max_amount) : null,
        priority: mapping.priority
    }));

    return {
        id: workflow.id,
        workflow_name: workflow.workflow_name,
        workflow_code: workflow.workflow_code,
        workflow_description: workflow.workflow_description,
        workflow_scope: workflow.workflow_scope,
        approval_mode: workflow.approval_mode,
        approval_level: workflow.approval_level,
        allow_partial_approval: workflow.allow_partial_approval === 1,
        allow_partial_amount_approval: workflow.allow_partial_amount_approval === 1,
        allow_amount_modification: workflow.allow_amount_modification === 1,
        max_amount_reduction_percentage: parseFloat(workflow.max_amount_reduction_percentage),
        escalation_enabled: workflow.escalation_enabled === 1,
        escalation_after_hours: workflow.escalation_after_hours,
        escalation_reminder_hours: workflow.escalation_reminder_hours,
        max_escalation_levels: workflow.max_escalation_levels,
        escalation_to: workflow.escalation_to,
        escalation_user_id: workflow.escalation_user_id,
        auto_approve_enabled: workflow.auto_approve_enabled === 1,
        auto_approve_max_amount: workflow.auto_approve_max_amount ? parseFloat(workflow.auto_approve_max_amount) : null,
        auto_approve_categories: workflow.auto_approve_categories,
        auto_approve_for_grades: workflow.auto_approve_for_grades,
        auto_reject_enabled: workflow.auto_reject_enabled === 1,
        auto_reject_after_days: workflow.auto_reject_after_days,
        allow_send_back: workflow.allow_send_back === 1,
        max_send_back_count: workflow.max_send_back_count,
        notification_settings: {
            email_notifications_enabled: workflow.email_notifications_enabled === 1,
            notify_requester_on_submit: workflow.notify_requester_on_submit === 1,
            notify_approver_on_submit: workflow.notify_approver_on_submit === 1,
            notify_requester_on_approve: workflow.notify_requester_on_approve === 1,
            notify_requester_on_reject: workflow.notify_requester_on_reject === 1,
            notify_requester_on_send_back: workflow.notify_requester_on_send_back === 1,
            notify_requester_on_payment: workflow.notify_requester_on_payment === 1,
            notify_finance_on_approval: workflow.notify_finance_on_approval === 1,
            enable_pending_reminders: workflow.enable_pending_reminders === 1,
            pending_reminder_hours: workflow.pending_reminder_hours,
            pending_reminder_frequency_hours: workflow.pending_reminder_frequency_hours,
            max_pending_reminders: workflow.max_pending_reminders,
            push_notifications_enabled: workflow.push_notifications_enabled === 1,
            cc_manager_on_approval: workflow.cc_manager_on_approval === 1,
            cc_hr_on_rejection: workflow.cc_hr_on_rejection === 1
        },
        is_default: workflow.is_default === 1,
        is_active: workflow.is_active === 1,
        stages,
        category_mappings: categoryMappings,
        created_by: workflow.created_by,
        created_at: workflow.created_at,
        updated_at: workflow.updated_at
    };
};

/**
 * Update workflow
 * @param {Object} data - Update data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is updating
 * @returns {Promise<Object>} Updated workflow
 */
const updateWorkflow = async (data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const { workflow_id, stages, ...updateFields } = data;

        if (!workflow_id) {
            throw new Error('Workflow ID is required');
        }

        // Find existing workflow
        const workflow = await ExpenseApprovalWorkflow.findOne({
            where: {
                id: workflow_id,
                company_id: companyId,
                deleted_at: null
            },
            transaction
        });

        if (!workflow) {
            throw new Error('Workflow not found');
        }

        // If setting as default, unset other defaults
        if (updateFields.is_default) {
            await ExpenseApprovalWorkflow.update(
                { is_default: 0, updated_by: userId },
                {
                    where: {
                        company_id: companyId,
                        is_default: 1,
                        id: { [Op.ne]: workflow_id }
                    },
                    transaction
                }
            );
        }

        // Prepare update object
        const updateObj = { updated_by: userId };

        // Map simple fields
        const simpleFields = [
            'workflow_name', 'workflow_description', 'workflow_scope', 'approval_mode',
            'approval_level', 'escalation_after_hours', 'escalation_reminder_hours',
            'max_escalation_levels', 'escalation_to', 'escalation_user_id',
            'auto_approve_max_amount', 'auto_approve_categories', 'auto_approve_for_grades',
            'auto_reject_after_days', 'max_send_back_count', 'max_amount_reduction_percentage'
        ];

        simpleFields.forEach(field => {
            if (updateFields[field] !== undefined) {
                updateObj[field] = updateFields[field];
            }
        });

        // Map boolean fields
        const booleanFields = [
            'allow_partial_approval', 'allow_partial_amount_approval', 'allow_amount_modification',
            'escalation_enabled', 'auto_approve_enabled', 'auto_reject_enabled', 'allow_send_back',
            'is_default', 'is_active'
        ];

        booleanFields.forEach(field => {
            if (updateFields[field] !== undefined) {
                updateObj[field] = updateFields[field] ? 1 : 0;
            }
        });

        // Handle notification settings
        if (updateFields.notification_settings) {
            const ns = updateFields.notification_settings;
            const notificationBooleans = [
                'email_notifications_enabled', 'notify_requester_on_submit', 'notify_approver_on_submit',
                'notify_requester_on_approve', 'notify_requester_on_reject', 'notify_requester_on_send_back',
                'notify_requester_on_payment', 'notify_finance_on_approval', 'notify_approver_on_escalation',
                'notify_next_approver', 'enable_pending_reminders', 'push_notifications_enabled',
                'push_on_submit', 'push_on_action', 'push_on_reminder', 'cc_manager_on_approval',
                'cc_hr_on_rejection'
            ];

            notificationBooleans.forEach(field => {
                if (ns[field] !== undefined) {
                    updateObj[field] = ns[field] ? 1 : 0;
                }
            });

            if (ns.pending_reminder_hours !== undefined) updateObj.pending_reminder_hours = ns.pending_reminder_hours;
            if (ns.pending_reminder_frequency_hours !== undefined) updateObj.pending_reminder_frequency_hours = ns.pending_reminder_frequency_hours;
            if (ns.max_pending_reminders !== undefined) updateObj.max_pending_reminders = ns.max_pending_reminders;
            if (ns.additional_cc_emails !== undefined) updateObj.additional_cc_emails = ns.additional_cc_emails;
        }

        // Update workflow
        await workflow.update(updateObj, { transaction });

        // Update stages if provided
        if (stages !== undefined && Array.isArray(stages)) {
            // Deactivate old stages
            await ExpenseApprovalWorkflowStage.update(
                { is_active: 0, updated_by: userId },
                {
                    where: { workflow_id: workflow_id },
                    transaction
                }
            );

            // Create/update new stages
            for (const stage of stages) {
                if (stage.id) {
                    // Update existing stage
                    await ExpenseApprovalWorkflowStage.update({
                        stage_order: stage.stage_order,
                        stage_name: stage.stage_name,
                        stage_description: stage.stage_description,
                        min_amount: stage.min_amount || 0,
                        max_amount: stage.max_amount || null,
                        applies_to_categories: stage.applies_to_categories,
                        approver_type: stage.approver_type,
                        approver_user_ids: stage.approver_user_ids,
                        approver_role_id: stage.approver_role_id,
                        multi_approver_mode: stage.multi_approver_mode || 'Any_One',
                        is_mandatory: stage.is_mandatory !== false ? 1 : 0,
                        skip_if_same_approver: stage.skip_if_same_approver !== false ? 1 : 0,
                        skip_if_self_approved: stage.skip_if_self_approved ? 1 : 0,
                        can_approve: stage.can_approve !== false ? 1 : 0,
                        can_reject: stage.can_reject !== false ? 1 : 0,
                        can_send_back: stage.can_send_back !== false ? 1 : 0,
                        can_hold: stage.can_hold ? 1 : 0,
                        can_delegate: stage.can_delegate ? 1 : 0,
                        can_modify_amount: stage.can_modify_amount ? 1 : 0,
                        comments_mandatory_on_reject: stage.comments_mandatory_on_reject !== false ? 1 : 0,
                        sla_hours: stage.sla_hours || 48,
                        sla_breach_action: stage.sla_breach_action || 'Notify',
                        is_active: 1,
                        updated_by: userId
                    }, {
                        where: { id: stage.id, workflow_id: workflow_id },
                        transaction
                    });
                } else {
                    // Create new stage
                    await ExpenseApprovalWorkflowStage.create({
                        workflow_id: workflow_id,
                        stage_order: stage.stage_order,
                        stage_name: stage.stage_name,
                        stage_description: stage.stage_description,
                        min_amount: stage.min_amount || 0,
                        max_amount: stage.max_amount || null,
                        applies_to_categories: stage.applies_to_categories,
                        approver_type: stage.approver_type,
                        approver_user_ids: stage.approver_user_ids,
                        approver_role_id: stage.approver_role_id,
                        multi_approver_mode: stage.multi_approver_mode || 'Any_One',
                        is_mandatory: stage.is_mandatory !== false ? 1 : 0,
                        skip_if_same_approver: stage.skip_if_same_approver !== false ? 1 : 0,
                        skip_if_self_approved: stage.skip_if_self_approved ? 1 : 0,
                        can_approve: stage.can_approve !== false ? 1 : 0,
                        can_reject: stage.can_reject !== false ? 1 : 0,
                        can_send_back: stage.can_send_back !== false ? 1 : 0,
                        can_modify_amount: stage.can_modify_amount ? 1 : 0,
                        comments_mandatory_on_reject: stage.comments_mandatory_on_reject !== false ? 1 : 0,
                        sla_hours: stage.sla_hours || 48,
                        sla_breach_action: stage.sla_breach_action || 'Notify',
                        is_active: 1,
                        created_by: userId
                    }, { transaction });
                }
            }
        }

        await transaction.commit();

        return {
            id: workflow.id,
            workflow_name: workflow.workflow_name,
            updated_at: workflow.updated_at
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Delete workflow (soft delete)
 * @param {number} workflowId - Workflow ID
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is deleting
 * @returns {Promise<Object>} Delete result
 */
const deleteWorkflow = async (workflowId, companyId, userId) => {
    if (!workflowId) {
        throw new Error('Workflow ID is required');
    }

    const workflow = await ExpenseApprovalWorkflow.findOne({
        where: {
            id: workflowId,
            company_id: companyId,
            deleted_at: null
        }
    });

    if (!workflow) {
        throw new Error('Workflow not found');
    }

    // Check if workflow is in use
    // TODO: Add check for active approval requests using this workflow

    // Soft delete
    await workflow.update({
        deleted_at: new Date(),
        deleted_by: userId,
        is_active: 0
    });

    return { message: 'Workflow deleted successfully' };
};

/**
 * Clone workflow
 * @param {number} workflowId - Workflow ID to clone
 * @param {Object} data - New workflow data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is cloning
 * @returns {Promise<Object>} Cloned workflow
 */
const cloneWorkflow = async (workflowId, data, companyId, userId) => {
    if (!workflowId) {
        throw new Error('Workflow ID is required');
    }

    // Get existing workflow with stages
    const existingWorkflow = await ExpenseApprovalWorkflow.findOne({
        where: {
            id: workflowId,
            company_id: companyId,
            deleted_at: null
        },
        include: [
            {
                model: ExpenseApprovalWorkflowStage,
                as: 'stages',
                where: { is_active: 1 },
                required: false
            }
        ]
    });

    if (!existingWorkflow) {
        throw new Error('Workflow not found');
    }

    // Prepare clone data
    const cloneData = {
        ...existingWorkflow.toJSON(),
        workflow_name: data.workflow_name || `${existingWorkflow.workflow_name} (Copy)`,
        workflow_code: data.workflow_code || `${existingWorkflow.workflow_code}_COPY`,
        is_default: false,
        stages: (existingWorkflow.stages || []).map(stage => ({
            ...stage.toJSON(),
            id: undefined
        }))
    };

    // Remove fields that shouldn't be copied
    delete cloneData.id;
    delete cloneData.created_at;
    delete cloneData.updated_at;
    delete cloneData.deleted_at;
    delete cloneData.deleted_by;

    return await createWorkflow(cloneData, companyId, userId);
};

/**
 * Get all category to workflow mappings
 * @param {Object} filters - Filter options
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Category mappings with pagination
 */
const getCategoryMappings = async (filters, companyId) => {
    const {
        workflow_id,
        category_id,
        limit = 50,
        offset = 0
    } = filters;

    const where = {
        company_id: companyId,
        is_active: 1
    };

    if (workflow_id) {
        where.workflow_id = workflow_id;
    }

    if (category_id) {
        where.category_id = category_id;
    }

    // Get total count
    const total = await ExpenseWorkflowCategoryMapping.count({ where });

    // Get mappings with related data
    const mappings = await ExpenseWorkflowCategoryMapping.findAll({
        where,
        include: [
            {
                model: ExpenseApprovalWorkflow,
                as: 'workflow',
                attributes: ['id', 'workflow_name', 'workflow_code', 'is_default', 'is_active']
            },
            {
                model: ExpenseCategory,
                as: 'category',
                attributes: ['id', 'category_name', 'category_code']
            }
        ],
        order: [['priority', 'DESC'], ['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    // Format response
    const data = mappings.map(m => ({
        id: m.id,
        workflow_id: m.workflow_id,
        workflow_name: m.workflow?.workflow_name,
        workflow_code: m.workflow?.workflow_code,
        workflow_is_default: m.workflow?.is_default === 1,
        category_id: m.category_id,
        category_name: m.category?.category_name,
        category_code: m.category?.category_code,
        min_amount: parseFloat(m.min_amount) || 0,
        max_amount: m.max_amount ? parseFloat(m.max_amount) : null,
        priority: m.priority,
        created_at: m.created_at
    }));

    return {
        data,
        pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            total_pages: Math.ceil(total / parseInt(limit)),
            current_page: Math.floor(parseInt(offset) / parseInt(limit)) + 1
        }
    };
};

/**
 * Manage category to workflow mapping
 * @param {Object} data - Mapping data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Result
 */
const manageCategoryMapping = async (data, companyId, userId) => {
    const { action, mapping } = data;

    if (action === 'upsert') {
        if (!mapping.category_id || !mapping.workflow_id) {
            throw new Error('Category ID and Workflow ID are required');
        }

        // Check if mapping exists
        const existing = await ExpenseWorkflowCategoryMapping.findOne({
            where: {
                company_id: companyId,
                category_id: mapping.category_id,
                min_amount: mapping.min_amount || 0,
                is_active: 1
            }
        });

        if (existing) {
            // Update
            await existing.update({
                workflow_id: mapping.workflow_id,
                max_amount: mapping.max_amount || null,
                priority: mapping.priority || 0,
                updated_by: userId
            });

            return { message: 'Category mapping updated', id: existing.id };
        } else {
            // Create
            const newMapping = await ExpenseWorkflowCategoryMapping.create({
                company_id: companyId,
                category_id: mapping.category_id,
                workflow_id: mapping.workflow_id,
                min_amount: mapping.min_amount || 0,
                max_amount: mapping.max_amount || null,
                priority: mapping.priority || 0,
                is_active: 1,
                created_by: userId
            });

            return { message: 'Category mapping created', id: newMapping.id };
        }
    } else if (action === 'delete') {
        if (!mapping.id) {
            throw new Error('Mapping ID is required');
        }

        await ExpenseWorkflowCategoryMapping.update(
            { is_active: 0, updated_by: userId },
            {
                where: {
                    id: mapping.id,
                    company_id: companyId
                }
            }
        );

        return { message: 'Category mapping deleted' };
    }

    throw new Error('Invalid action');
};

// ==================== WORKFLOW SELECTION HELPERS ====================

/**
 * Check if an applicability rule matches the employee
 * @param {Object} rule - Applicability rule
 * @param {Object} employee - Employee object with attributes
 * @returns {boolean} True if matches
 */
const checkApplicabilityRule = (rule, employee) => {
    // Helper function to check if employee value is in comma-separated list
    const isInList = (commaSeparatedValues, employeeValue) => {
        if (!commaSeparatedValues || !employeeValue) return false;
        const values = commaSeparatedValues.split(',').map(v => parseInt(v.trim()));
        return values.includes(parseInt(employeeValue));
    };

    // Step 1: Check PRIMARY applicability
    let primaryMatches = false;
    const applicabilityValue = rule.applicability_value;

    switch (rule.applicability_type) {
        case 'company':
            if (!applicabilityValue) {
                primaryMatches = (rule.company_id === employee.company_id);
            } else {
                primaryMatches = isInList(applicabilityValue, employee.company_id);
            }
            break;
        case 'entity':
            primaryMatches = isInList(applicabilityValue, employee.entity_id);
            break;
        case 'location':
            primaryMatches = isInList(applicabilityValue, employee.location_id);
            break;
        case 'level':
            primaryMatches = isInList(applicabilityValue, employee.level_id);
            break;
        case 'designation':
            primaryMatches = isInList(applicabilityValue, employee.designation_id);
            break;
        case 'department':
            primaryMatches = isInList(applicabilityValue, employee.department_id);
            break;
        case 'sub_department':
            primaryMatches = isInList(applicabilityValue, employee.sub_department_id);
            break;
        case 'employee':
            primaryMatches = isInList(applicabilityValue, employee.id);
            break;
        case 'grade':
            primaryMatches = isInList(applicabilityValue, employee.grade_id);
            break;
        default:
            primaryMatches = false;
    }

    if (!primaryMatches) {
        return false;
    }

    // Step 2: Check ADVANCED applicability (if specified)
    const advancedType = rule.advanced_applicability_type;
    const advancedValue = rule.advanced_applicability_value;

    if (!advancedType || advancedType === 'none') {
        return rule.is_excluded ? false : primaryMatches;
    }

    let advancedMatches = false;

    switch (advancedType) {
        case 'employee_type':
            advancedMatches = isInList(advancedValue, employee.employee_type_id);
            break;
        case 'branch':
            advancedMatches = isInList(advancedValue, employee.branch_id);
            break;
        case 'region':
            advancedMatches = isInList(advancedValue, employee.region_id);
            break;
        case 'cost_center':
            advancedMatches = isInList(advancedValue, employee.cost_center_id);
            break;
        case 'project':
            advancedMatches = isInList(advancedValue, employee.project_id);
            break;
        default:
            advancedMatches = false;
    }

    const finalMatch = primaryMatches && advancedMatches;
    return rule.is_excluded ? !finalMatch : finalMatch;
};

/**
 * Find applicable workflow for an employee based on applicability rules
 * STEP 1 of workflow selection: WHO (based on employee attributes)
 *
 * @param {number} employeeId - Employee ID
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Applicable workflow with scope
 */
const findApplicableWorkflowForEmployee = async (employeeId, companyId) => {
    // Get employee details
    const employee = await HrmsEmployee.findByPk(employeeId, {
        attributes: [
            'id', 'company_id', 'entity_id', 'department_id', 'sub_department_id',
            'designation_id', 'level_id', 'grade_id', 'location_id', 'employee_type_id',
            'branch_id', 'region_id', 'cost_center_id'
        ],
        raw: true
    });

    if (!employee) {
        throw new Error('Employee not found');
    }

    // Get all active workflows with their applicability rules
    const workflows = await ExpenseApprovalWorkflow.findAll({
        where: {
            company_id: companyId,
            is_active: 1,
            deleted_at: null
        },
        include: [
            {
                model: ExpenseWorkflowApplicability,
                as: 'applicability',
                where: { is_active: 1 },
                required: false
            },
            {
                model: ExpenseApprovalWorkflowStage,
                as: 'stages',
                where: { is_active: 1 },
                required: false,
                order: [['stage_order', 'ASC']]
            }
        ],
        order: [
            ['is_default', 'DESC'],
            ['created_at', 'DESC']
        ]
    });

    if (!workflows || workflows.length === 0) {
        throw new Error('No workflows configured');
    }

    // Find the most applicable workflow based on priority
    let applicableWorkflow = null;
    let highestPriority = 999999;
    let matchedRuleType = null;

    for (const workflow of workflows) {
        const applicabilityRules = workflow.applicability || [];

        // If no applicability rules and is_default, this is company-wide default
        if (applicabilityRules.length === 0 && workflow.is_default) {
            const defaultPriority = 1000;
            if (defaultPriority < highestPriority) {
                applicableWorkflow = workflow;
                highestPriority = defaultPriority;
                matchedRuleType = 'default';
            }
            continue;
        }

        // Check each applicability rule
        for (const rule of applicabilityRules) {
            const matches = checkApplicabilityRule(rule, employee);

            if (matches) {
                const builtInPriority = getBuiltInPriority(rule.applicability_type);

                if (builtInPriority < highestPriority) {
                    applicableWorkflow = workflow;
                    highestPriority = builtInPriority;
                    matchedRuleType = rule.applicability_type;
                }
            }
        }
    }

    if (!applicableWorkflow) {
        // Fallback to default or first available
        applicableWorkflow = workflows.find(w => w.is_default) || workflows[0];
        matchedRuleType = applicableWorkflow.is_default ? 'default' : 'first_available';
    }

    return {
        workflow_id: applicableWorkflow.id,
        workflow_name: applicableWorkflow.workflow_name,
        workflow_code: applicableWorkflow.workflow_code,
        workflow_scope: applicableWorkflow.workflow_scope,
        approval_mode: applicableWorkflow.approval_mode,
        approval_level: applicableWorkflow.approval_level,
        stages: applicableWorkflow.stages || [],
        matched_by: matchedRuleType,
        is_default: applicableWorkflow.is_default === 1
    };
};

/**
 * Get applicable stages for expense items based on workflow_scope
 * STEP 2 of workflow selection: HOW (based on workflow_scope)
 *
 * @param {Object} workflow - Workflow object with stages
 * @param {Array} items - Expense items [{category_id, amount}, ...]
 * @returns {Array} Items with their applicable stages
 */
const getApplicableStagesForItems = (workflow, items) => {
    const { workflow_scope, stages, approval_level } = workflow;

    // Sort stages by stage_order
    const sortedStages = [...stages].sort((a, b) => a.stage_order - b.stage_order);

    // If Request Level - all items get same stages
    if (approval_level === 'Request_Level') {
        const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

        let applicableStages;

        switch (workflow_scope) {
            case 'Amount_Based':
                // Filter stages based on total amount
                applicableStages = sortedStages.filter(stage => {
                    const minOk = !stage.min_amount || totalAmount >= parseFloat(stage.min_amount);
                    const maxOk = !stage.max_amount || totalAmount <= parseFloat(stage.max_amount);
                    return minOk && maxOk;
                });
                break;

            case 'Category_Specific':
            case 'All_Expenses':
            case 'Policy_Specific':
            default:
                // All stages apply
                applicableStages = sortedStages;
                break;
        }

        return {
            approval_level: 'Request_Level',
            total_amount: totalAmount,
            stages: applicableStages.map(s => ({
                stage_id: s.id,
                stage_order: s.stage_order,
                stage_name: s.stage_name,
                approver_type: s.approver_type,
                approver_user_ids: s.approver_user_ids,
                approver_role_id: s.approver_role_id,
                sla_hours: s.sla_hours
            })),
            items: items.map(item => ({
                ...item,
                follows_request_stages: true
            }))
        };
    }

    // Line Item Level - each item may have different stages
    const itemsWithStages = items.map(item => {
        const itemAmount = parseFloat(item.amount) || 0;
        const itemCategoryId = item.category_id;

        let applicableStages;

        switch (workflow_scope) {
            case 'Category_Specific':
                // Filter stages that apply to this category
                applicableStages = sortedStages.filter(stage => {
                    // If applies_to_categories is null, applies to all
                    if (!stage.applies_to_categories) return true;

                    // Parse JSON if string
                    let categories = stage.applies_to_categories;
                    if (typeof categories === 'string') {
                        try {
                            categories = JSON.parse(categories);
                        } catch (e) {
                            return true;
                        }
                    }

                    // Check if category is in the list
                    return Array.isArray(categories) && categories.includes(itemCategoryId);
                });
                break;

            case 'Amount_Based':
                // Filter stages based on item amount
                applicableStages = sortedStages.filter(stage => {
                    const minOk = !stage.min_amount || itemAmount >= parseFloat(stage.min_amount);
                    const maxOk = !stage.max_amount || itemAmount <= parseFloat(stage.max_amount);
                    return minOk && maxOk;
                });
                break;

            case 'All_Expenses':
            case 'Policy_Specific':
            default:
                // All stages apply to all items
                applicableStages = sortedStages;
                break;
        }

        return {
            ...item,
            stages: applicableStages.map(s => ({
                stage_id: s.id,
                stage_order: s.stage_order,
                stage_name: s.stage_name,
                approver_type: s.approver_type,
                approver_user_ids: s.approver_user_ids,
                approver_role_id: s.approver_role_id,
                sla_hours: s.sla_hours
            }))
        };
    });

    return {
        approval_level: 'Line_Item_Level',
        workflow_scope,
        items: itemsWithStages
    };
};

/**
 * Get applicable workflow for an expense (MAIN FUNCTION)
 * Combines Applicability (WHO) + workflow_scope (HOW)
 *
 * @param {Object} params - Parameters
 * @param {number} params.employee_id - Employee ID (required for applicability check)
 * @param {Array} params.items - Expense items [{category_id, amount}, ...] (optional)
 * @param {number} params.category_id - Single category ID (for simple queries)
 * @param {number} params.amount - Single amount (for simple queries)
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Applicable workflow with stages
 */
const getApplicableWorkflow = async (params, companyId) => {
    const { employee_id, items, category_id, amount } = params;

    // If employee_id provided, use full applicability flow
    if (employee_id) {
        // Step 1: Find workflow based on WHO (applicability)
        const workflow = await findApplicableWorkflowForEmployee(employee_id, companyId);

        // Step 2: If items provided, determine stages based on HOW (workflow_scope)
        if (items && items.length > 0) {
            const stagesResult = getApplicableStagesForItems(workflow, items);

            return {
                workflow_id: workflow.workflow_id,
                workflow_name: workflow.workflow_name,
                workflow_code: workflow.workflow_code,
                workflow_scope: workflow.workflow_scope,
                approval_mode: workflow.approval_mode,
                matched_by: workflow.matched_by,
                ...stagesResult
            };
        }

        // If single category/amount, create simple items array
        if (category_id || amount) {
            const simpleItems = [{ category_id, amount: amount || 0 }];
            const stagesResult = getApplicableStagesForItems(workflow, simpleItems);

            return {
                workflow_id: workflow.workflow_id,
                workflow_name: workflow.workflow_name,
                workflow_code: workflow.workflow_code,
                workflow_scope: workflow.workflow_scope,
                approval_mode: workflow.approval_mode,
                matched_by: workflow.matched_by,
                ...stagesResult
            };
        }

        // Just return workflow info
        return {
            workflow_id: workflow.workflow_id,
            workflow_name: workflow.workflow_name,
            workflow_code: workflow.workflow_code,
            workflow_scope: workflow.workflow_scope,
            approval_mode: workflow.approval_mode,
            approval_level: workflow.approval_level,
            matched_by: workflow.matched_by,
            stages_count: workflow.stages.length
        };
    }

    // Legacy flow: No employee_id, check category mapping or default
    if (category_id) {
        const categoryMapping = await ExpenseWorkflowCategoryMapping.findOne({
            where: {
                company_id: companyId,
                category_id: category_id,
                is_active: 1,
                min_amount: { [Op.lte]: amount || 0 },
                [Op.or]: [
                    { max_amount: null },
                    { max_amount: { [Op.gte]: amount || 0 } }
                ]
            },
            order: [['priority', 'DESC']],
            include: [
                {
                    model: ExpenseApprovalWorkflow,
                    as: 'workflow',
                    where: { is_active: 1, deleted_at: null }
                }
            ]
        });

        if (categoryMapping && categoryMapping.workflow) {
            return {
                workflow_id: categoryMapping.workflow.id,
                workflow_name: categoryMapping.workflow.workflow_name,
                workflow_scope: categoryMapping.workflow.workflow_scope,
                source: 'Category_Mapping'
            };
        }
    }

    // Get default workflow
    const defaultWorkflow = await ExpenseApprovalWorkflow.findOne({
        where: {
            company_id: companyId,
            is_default: 1,
            is_active: 1,
            deleted_at: null
        }
    });

    if (defaultWorkflow) {
        return {
            workflow_id: defaultWorkflow.id,
            workflow_name: defaultWorkflow.workflow_name,
            workflow_scope: defaultWorkflow.workflow_scope,
            source: 'Default'
        };
    }

    // Get any active workflow
    const anyWorkflow = await ExpenseApprovalWorkflow.findOne({
        where: {
            company_id: companyId,
            is_active: 1,
            deleted_at: null
        }
    });

    if (anyWorkflow) {
        return {
            workflow_id: anyWorkflow.id,
            workflow_name: anyWorkflow.workflow_name,
            workflow_scope: anyWorkflow.workflow_scope,
            source: 'First_Available'
        };
    }

    throw new Error('No active workflow found');
};

/**
 * Get dropdown data for workflow forms
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Dropdown data
 */
const getDropdownData = async (companyId) => {
    // Get active workflows
    const workflows = await ExpenseApprovalWorkflow.findAll({
        where: {
            company_id: companyId,
            is_active: 1,
            deleted_at: null
        },
        attributes: ['id', 'workflow_name', 'workflow_code', 'is_default'],
        order: [['workflow_name', 'ASC']]
    });

    // Get active categories
    const categories = await ExpenseCategory.findAll({
        where: {
            company_id: companyId,
            is_active: 1,
            deleted_at: null
        },
        attributes: ['id', 'category_name', 'category_code'],
        order: [['category_name', 'ASC']]
    });

    return {
        workflows: workflows.map(w => ({
            id: w.id,
            name: w.workflow_name,
            code: w.workflow_code,
            is_default: w.is_default === 1
        })),
        categories: categories.map(c => ({
            id: c.id,
            name: c.category_name,
            code: c.category_code
        })),
        approver_types: [
            { value: 'Reporting_Manager', label: 'Reporting Manager' },
            { value: 'Skip_Level_Manager', label: 'Skip Level Manager' },
            { value: 'Department_Head', label: 'Department Head' },
            { value: 'HOD_Chain', label: 'HOD Chain' },
            { value: 'Specific_User', label: 'Specific User' },
            { value: 'Specific_Role', label: 'Specific Role' },
            { value: 'Finance_Team', label: 'Finance Team' },
            { value: 'HR_Team', label: 'HR Team' },
            { value: 'Cost_Center_Owner', label: 'Cost Center Owner' },
            { value: 'Project_Manager', label: 'Project Manager' },
            { value: 'Budget_Owner', label: 'Budget Owner' }
        ],
        workflow_scopes: [
            { value: 'All_Expenses', label: 'All Expenses' },
            { value: 'Category_Specific', label: 'Category Specific' },
            { value: 'Amount_Based', label: 'Amount Based' },
            { value: 'Policy_Specific', label: 'Policy Specific' }
        ],
        approval_modes: [
            { value: 'Sequential', label: 'Sequential (Stage by Stage)' },
            { value: 'Parallel', label: 'Parallel (All at Once)' },
            { value: 'Any_One', label: 'Any One (First Approval Wins)' }
        ],
        approval_levels: [
            { value: 'Request_Level', label: 'Request Level (All or Nothing)' },
            { value: 'Line_Item_Level', label: 'Line Item Level (Individual Items)' }
        ]
    };
};

// ==================== APPLICABILITY METHODS ====================

/**
 * Get built-in priority based on applicability type
 * Lower number = Higher priority
 * @param {string} applicabilityType - Applicability type
 * @returns {number} Priority value
 */
const getBuiltInPriority = (applicabilityType) => {
    const priorityMap = {
        'employee': 1,         // Highest priority - specific employees
        'sub_department': 2,
        'department': 3,
        'designation': 4,
        'level': 5,
        'grade': 6,
        'location': 7,
        'entity': 8,           // Business Unit
        'company': 9           // Lowest priority
    };

    return priorityMap[applicabilityType] || 999;
};

/**
 * Get all applicability rules for a workflow
 * @param {number} workflowId - Workflow ID
 * @param {number} companyId - Company ID
 * @returns {Promise<Array>} Applicability rules
 */
const getApplicabilityRules = async (workflowId, companyId) => {
    const rules = await ExpenseWorkflowApplicability.findAll({
        where: {
            workflow_id: workflowId,
            company_id: companyId,
            is_active: 1
        },
        order: [['priority', 'ASC'], ['created_at', 'DESC']]
    });

    return rules.map(rule => ({
        id: rule.id,
        workflow_id: rule.workflow_id,
        applicability_type: rule.applicability_type,
        applicability_value: rule.applicability_value,
        advanced_applicability_type: rule.advanced_applicability_type,
        advanced_applicability_value: rule.advanced_applicability_value,
        is_excluded: rule.is_excluded === 1,
        priority: rule.priority,
        created_at: rule.created_at
    }));
};

/**
 * Add applicability rule to workflow
 * @param {Object} data - Applicability data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Created applicability rule
 */
const addApplicability = async (data, companyId, userId) => {
    const {
        workflow_id,
        applicability_type,
        applicability_value,
        advanced_applicability_type,
        advanced_applicability_value,
        is_excluded,
        priority
    } = data;

    if (!workflow_id) {
        throw new Error('Workflow ID is required');
    }

    if (!applicability_type) {
        throw new Error('Applicability type is required');
    }

    // Verify workflow exists
    const workflow = await ExpenseApprovalWorkflow.findOne({
        where: {
            id: workflow_id,
            company_id: companyId,
            deleted_at: null
        }
    });

    if (!workflow) {
        throw new Error('Workflow not found');
    }

    // Helper function to convert array to comma-separated string
    const toCommaSeparated = (value) => {
        if (!value) return null;
        if (Array.isArray(value)) return value.join(',');
        return value.toString();
    };

    // Create applicability rule
    const applicability = await ExpenseWorkflowApplicability.create({
        workflow_id,
        company_id: companyId,
        applicability_type,
        applicability_value: toCommaSeparated(applicability_value),
        advanced_applicability_type: advanced_applicability_type || 'none',
        advanced_applicability_value: toCommaSeparated(advanced_applicability_value),
        is_excluded: is_excluded ? 1 : 0,
        priority: priority || getBuiltInPriority(applicability_type),
        is_active: 1,
        created_by: userId
    });

    return {
        id: applicability.id,
        workflow_id: applicability.workflow_id,
        applicability_type: applicability.applicability_type,
        applicability_value: applicability.applicability_value,
        priority: applicability.priority,
        message: 'Applicability rule added successfully'
    };
};

/**
 * Update applicability rule
 * @param {Object} data - Update data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated applicability
 */
const updateApplicability = async (data, companyId, userId) => {
    const {
        id,
        applicability_type,
        applicability_value,
        advanced_applicability_type,
        advanced_applicability_value,
        is_excluded,
        priority
    } = data;

    if (!id) {
        throw new Error('Applicability ID is required');
    }

    const applicability = await ExpenseWorkflowApplicability.findOne({
        where: {
            id,
            company_id: companyId,
            is_active: 1
        }
    });

    if (!applicability) {
        throw new Error('Applicability rule not found');
    }

    // Helper function to convert array to comma-separated string
    const toCommaSeparated = (value) => {
        if (!value) return null;
        if (Array.isArray(value)) return value.join(',');
        return value.toString();
    };

    // Update
    await applicability.update({
        applicability_type: applicability_type || applicability.applicability_type,
        applicability_value: applicability_value !== undefined
            ? toCommaSeparated(applicability_value)
            : applicability.applicability_value,
        advanced_applicability_type: advanced_applicability_type !== undefined
            ? (advanced_applicability_type || 'none')
            : applicability.advanced_applicability_type,
        advanced_applicability_value: advanced_applicability_value !== undefined
            ? toCommaSeparated(advanced_applicability_value)
            : applicability.advanced_applicability_value,
        is_excluded: is_excluded !== undefined ? (is_excluded ? 1 : 0) : applicability.is_excluded,
        priority: priority || applicability.priority,
        updated_by: userId
    });

    return {
        id: applicability.id,
        message: 'Applicability rule updated successfully'
    };
};

/**
 * Delete applicability rule
 * @param {number} applicabilityId - Applicability ID
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Delete result
 */
const deleteApplicability = async (applicabilityId, companyId, userId) => {
    if (!applicabilityId) {
        throw new Error('Applicability ID is required');
    }

    const applicability = await ExpenseWorkflowApplicability.findOne({
        where: {
            id: applicabilityId,
            company_id: companyId,
            is_active: 1
        }
    });

    if (!applicability) {
        throw new Error('Applicability rule not found');
    }

    await applicability.update({
        is_active: 0,
        updated_by: userId
    });

    return { message: 'Applicability rule deleted successfully' };
};

/**
 * Manage applicability (add/update/delete)
 * @param {Object} data - { action: 'add'|'update'|'delete', ... }
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Result
 */
const manageApplicability = async (data, companyId, userId) => {
    const { action } = data;

    switch (action) {
        case 'add':
            return await addApplicability(data, companyId, userId);
        case 'update':
            return await updateApplicability(data, companyId, userId);
        case 'delete':
            return await deleteApplicability(data.id, companyId, userId);
        default:
            throw new Error('Invalid action. Use add, update, or delete');
    }
};

/**
 * Get all applicability rules with filters
 * @param {Object} filters - Filter options
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Applicability rules with pagination
 */
const getAllApplicabilityRules = async (filters, companyId) => {
    const {
        workflow_id,
        applicability_type,
        limit = 50,
        offset = 0
    } = filters;

    const where = {
        company_id: companyId,
        is_active: 1
    };

    if (workflow_id) {
        where.workflow_id = workflow_id;
    }

    if (applicability_type) {
        where.applicability_type = applicability_type;
    }

    const total = await ExpenseWorkflowApplicability.count({ where });

    const rules = await ExpenseWorkflowApplicability.findAll({
        where,
        include: [
            {
                model: ExpenseApprovalWorkflow,
                as: 'workflow',
                attributes: ['id', 'workflow_name', 'workflow_code', 'is_default', 'is_active']
            }
        ],
        order: [['workflow_id', 'ASC'], ['priority', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    const data = rules.map(rule => ({
        id: rule.id,
        workflow_id: rule.workflow_id,
        workflow_name: rule.workflow?.workflow_name,
        workflow_code: rule.workflow?.workflow_code,
        applicability_type: rule.applicability_type,
        applicability_value: rule.applicability_value,
        advanced_applicability_type: rule.advanced_applicability_type,
        advanced_applicability_value: rule.advanced_applicability_value,
        is_excluded: rule.is_excluded === 1,
        priority: rule.priority,
        created_at: rule.created_at
    }));

    return {
        data,
        pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            total_pages: Math.ceil(total / parseInt(limit)),
            current_page: Math.floor(parseInt(offset) / parseInt(limit)) + 1
        }
    };
};

module.exports = {
    // Workflow CRUD
    createWorkflow,
    getAllWorkflows,
    getWorkflowDetails,
    updateWorkflow,
    deleteWorkflow,
    cloneWorkflow,
    getDropdownData,

    // Category Mapping
    getCategoryMappings,
    manageCategoryMapping,

    // Workflow Selection (Main functions)
    getApplicableWorkflow,              // Main function - combines WHO + HOW
    findApplicableWorkflowForEmployee,  // Step 1: WHO (applicability based)
    getApplicableStagesForItems,        // Step 2: HOW (workflow_scope based)
    checkApplicabilityRule,             // Helper: Check single rule

    // Applicability CRUD
    getBuiltInPriority,
    getApplicabilityRules,
    addApplicability,
    updateApplicability,
    deleteApplicability,
    manageApplicability,
    getAllApplicabilityRules
};
