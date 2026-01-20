/**
 * Expense Workflow Service
 * Business logic for expense approval workflow management
 */

const {
    ExpenseApprovalWorkflow,
    ExpenseApprovalWorkflowStage,
    ExpenseWorkflowCategoryMapping,
    ExpenseCategory
} = require('../../../models/expense');
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

    // Filter by active status
    if (is_active !== undefined) {
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

/**
 * Get applicable workflow for an expense
 * @param {Object} params - Parameters
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Applicable workflow
 */
const getApplicableWorkflow = async (params, companyId) => {
    const { category_id, amount, policy_id } = params;

    // 1. Check category-specific mapping
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
                source: 'Category_Mapping'
            };
        }
    }

    // 2. Get default workflow
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
            source: 'Default'
        };
    }

    // 3. Get any active workflow
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

module.exports = {
    createWorkflow,
    getAllWorkflows,
    getWorkflowDetails,
    updateWorkflow,
    deleteWorkflow,
    cloneWorkflow,
    getCategoryMappings,
    manageCategoryMapping,
    getApplicableWorkflow,
    getDropdownData
};
