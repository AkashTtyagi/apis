/**
 * Workflow Configuration Service
 * Handles CRUD operations for workflow configuration
 * - Workflow configs
 * - Stages and stage approvers
 * - Conditions and condition rules
 * - Applicability rules
 * - Workflow versioning
 */

const {
    HrmsWorkflowMaster,
    HrmsWorkflowConfig,
    HrmsWorkflowStage,
    HrmsWorkflowStageApprover,
    HrmsWorkflowCondition,
    HrmsWorkflowConditionRule,
    HrmsWorkflowApplicability,
    HrmsWorkflowVersion
} = require('../../models/workflow');
const { Op } = require('sequelize');
const { sequelize: db } = require('../../utils/database');

// ==================== WORKFLOW CONFIG CRUD ====================

/**
 * Create new workflow configuration
 * @param {Object} configData - Workflow config data
 * @returns {Promise<Object>} Created workflow config
 */
const createWorkflowConfig = async (configData) => {
    const transaction = await db.transaction();

    try {
        const {
            company_id,
            workflow_master_id,
            workflow_name,
            description,
            is_active,
            is_default,
            allow_self_approval,
            allow_withdrawal,
            require_remarks_on_rejection,
            send_submission_email,
            send_approval_email,
            send_rejection_email,
            created_by,
            stages = [],
            conditions = [],
            applicability = []
        } = configData;

        // Validate workflow master exists
        const workflowMaster = await HrmsWorkflowMaster.findByPk(workflow_master_id);
        if (!workflowMaster) {
            throw new Error('Workflow master not found');
        }

        // Create workflow config
        const workflowConfig = await HrmsWorkflowConfig.create({
            company_id,
            workflow_master_id,
            workflow_name,
            description,
            version: 1,
            is_active: is_active !== false,
            is_default: is_default || false,
            allow_self_approval: allow_self_approval || false,
            allow_withdrawal: allow_withdrawal !== false,
            require_remarks_on_rejection: require_remarks_on_rejection !== false,
            send_submission_email: send_submission_email !== false,
            send_approval_email: send_approval_email !== false,
            send_rejection_email: send_rejection_email !== false,
            created_by
        }, { transaction });

        console.log(`✓ Workflow config created: ${workflowConfig.workflow_name} (ID: ${workflowConfig.id})`);

        // Create stages if provided
        if (stages && stages.length > 0) {
            for (const stageData of stages) {
                await createStage(workflowConfig.id, stageData, transaction);
            }
        }

        // Create conditions if provided
        if (conditions && conditions.length > 0) {
            for (const conditionData of conditions) {
                await createCondition(workflowConfig.id, conditionData, transaction);
            }
        }

        // Create applicability rules if provided
        if (applicability && applicability.length > 0) {
            for (const applicabilityData of applicability) {
                await createApplicabilityRule(workflowConfig.id, applicabilityData, transaction);
            }
        }

        // Create initial version snapshot
        await createVersionSnapshot(workflowConfig.id, 1, 'Initial version', created_by, transaction);

        await transaction.commit();

        return await getWorkflowConfigById(workflowConfig.id);

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating workflow config:', error);
        throw error;
    }
};

/**
 * Get workflow config by ID
 * @param {number} configId - Config ID
 * @returns {Promise<Object>} Workflow config
 */
const getWorkflowConfigById = async (configId) => {
    try {
        const config = await HrmsWorkflowConfig.findByPk(configId, {
            include: [
                {
                    model: HrmsWorkflowMaster,
                    as: 'workflowMaster',
                    attributes: ['id', 'workflow_for_name', 'workflow_code']
                },
                {
                    model: HrmsWorkflowStage,
                    as: 'stages',
                    include: [
                        {
                            model: HrmsWorkflowStageApprover,
                            as: 'approvers'
                        }
                    ]
                },
                {
                    model: HrmsWorkflowCondition,
                    as: 'conditions',
                    include: [
                        {
                            model: HrmsWorkflowConditionRule,
                            as: 'rules'
                        }
                    ]
                },
                {
                    model: HrmsWorkflowApplicability,
                    as: 'applicability'
                }
            ]
        });

        return config;

    } catch (error) {
        console.error('Error getting workflow config:', error);
        throw error;
    }
};

/**
 * Get all workflow configs for a company
 * @param {number} companyId - Company ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Workflow configs
 */
const getWorkflowConfigs = async (companyId, filters = {}) => {
    try {
        const where = { company_id: companyId };

        if (filters.workflow_master_id) {
            where.workflow_master_id = filters.workflow_master_id;
        }

        if (filters.is_active !== undefined) {
            where.is_active = filters.is_active;
        }

        if (filters.is_default !== undefined) {
            where.is_default = filters.is_default;
        }

        const configs = await HrmsWorkflowConfig.findAll({
            where,
            include: [
                {
                    model: HrmsWorkflowMaster,
                    as: 'workflowMaster',
                    attributes: ['id', 'workflow_for_name', 'workflow_code']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return configs;

    } catch (error) {
        console.error('Error getting workflow configs:', error);
        throw error;
    }
};

/**
 * Update workflow config
 * @param {number} configId - Config ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated config
 */
const updateWorkflowConfig = async (configId, updateData) => {
    const transaction = await db.transaction();

    try {
        const config = await HrmsWorkflowConfig.findByPk(configId);

        if (!config) {
            throw new Error('Workflow config not found');
        }

        // Check if this is a major change that requires versioning
        const requiresVersioning = updateData.createNewVersion || false;

        if (requiresVersioning) {
            // Create new version
            const newVersion = config.version + 1;

            // Create version snapshot of current config
            await createVersionSnapshot(
                configId,
                config.version,
                'Version before update',
                updateData.updated_by,
                transaction
            );

            // Update version number
            updateData.version = newVersion;
        }

        // Update config
        await HrmsWorkflowConfig.update(updateData, {
            where: { id: configId },
            transaction
        });

        console.log(`✓ Workflow config updated: ${configId}`);

        await transaction.commit();

        return await getWorkflowConfigById(configId);

    } catch (error) {
        await transaction.rollback();
        console.error('Error updating workflow config:', error);
        throw error;
    }
};

/**
 * Delete (deactivate) workflow config
 * @param {number} configId - Config ID
 * @returns {Promise<void>}
 */
const deleteWorkflowConfig = async (configId) => {
    try {
        await HrmsWorkflowConfig.update(
            { is_active: false },
            { where: { id: configId } }
        );

        console.log(`✓ Workflow config deleted: ${configId}`);

    } catch (error) {
        console.error('Error deleting workflow config:', error);
        throw error;
    }
};

/**
 * Clone workflow config
 * @param {number} sourceConfigId - Source config ID
 * @param {Object} cloneData - Clone data (company_id, workflow_name, etc.)
 * @returns {Promise<Object>} Cloned config
 */
const cloneWorkflowConfig = async (sourceConfigId, cloneData) => {
    const transaction = await db.transaction();

    try {
        // Get source config with all related data
        const sourceConfig = await getWorkflowConfigById(sourceConfigId);

        if (!sourceConfig) {
            throw new Error('Source workflow config not found');
        }

        // Create new config
        const newConfig = await HrmsWorkflowConfig.create({
            company_id: cloneData.company_id || sourceConfig.company_id,
            workflow_master_id: sourceConfig.workflow_master_id,
            workflow_name: cloneData.workflow_name || `${sourceConfig.workflow_name} (Copy)`,
            description: sourceConfig.description,
            version: 1,
            is_active: cloneData.is_active !== false,
            is_default: false, // Cloned workflows are not default
            cloned_from_id: sourceConfigId,
            allow_self_approval: sourceConfig.allow_self_approval,
            allow_withdrawal: sourceConfig.allow_withdrawal,
            require_remarks_on_rejection: sourceConfig.require_remarks_on_rejection,
            send_submission_email: sourceConfig.send_submission_email,
            send_approval_email: sourceConfig.send_approval_email,
            send_rejection_email: sourceConfig.send_rejection_email,
            created_by: cloneData.created_by
        }, { transaction });

        console.log(`✓ Workflow config cloned: ${newConfig.workflow_name}`);

        // Clone stages
        const stageMap = {}; // Map old stage IDs to new stage IDs

        for (const stage of sourceConfig.stages || []) {
            const newStage = await HrmsWorkflowStage.create({
                workflow_config_id: newConfig.id,
                stage_name: stage.stage_name,
                stage_order: stage.stage_order,
                stage_type: stage.stage_type,
                stage_description: stage.stage_description,
                approver_logic: stage.approver_logic,
                min_approvals_required: stage.min_approvals_required,
                sla_days: stage.sla_days,
                sla_hours: stage.sla_hours,
                pending_action: stage.pending_action,
                pending_after_days: stage.pending_after_days,
                // Note: on_approve_next_stage_id and other stage references will be updated later
                is_active: stage.is_active
            }, { transaction });

            stageMap[stage.id] = newStage.id;

            // Clone stage approvers
            for (const approver of stage.approvers || []) {
                await HrmsWorkflowStageApprover.create({
                    stage_id: newStage.id,
                    approver_type: approver.approver_type,
                    custom_user_id: approver.custom_user_id,
                    approver_order: approver.approver_order,
                    has_condition: approver.has_condition,
                    condition_id: approver.condition_id,
                    is_active: approver.is_active
                }, { transaction });
            }
        }

        // Update stage references using the mapping
        for (const oldStageId in stageMap) {
            const newStageId = stageMap[oldStageId];
            const oldStage = sourceConfig.stages.find(s => s.id === parseInt(oldStageId));

            const updates = {};

            if (oldStage.escalate_to_stage_id && stageMap[oldStage.escalate_to_stage_id]) {
                updates.escalate_to_stage_id = stageMap[oldStage.escalate_to_stage_id];
            }

            if (oldStage.on_approve_next_stage_id && stageMap[oldStage.on_approve_next_stage_id]) {
                updates.on_approve_next_stage_id = stageMap[oldStage.on_approve_next_stage_id];
            }

            if (oldStage.on_reject_stage_id && stageMap[oldStage.on_reject_stage_id]) {
                updates.on_reject_stage_id = stageMap[oldStage.on_reject_stage_id];
            }

            if (Object.keys(updates).length > 0) {
                await HrmsWorkflowStage.update(updates, {
                    where: { id: newStageId },
                    transaction
                });
            }
        }

        // Clone conditions
        for (const condition of sourceConfig.conditions || []) {
            const newCondition = await HrmsWorkflowCondition.create({
                workflow_config_id: newConfig.id,
                condition_name: condition.condition_name,
                condition_type: condition.condition_type,
                logic_operator: condition.logic_operator,
                action_type: condition.action_type,
                action_stage_id: stageMap[condition.action_stage_id] || null,
                else_action_type: condition.else_action_type,
                else_stage_id: stageMap[condition.else_stage_id] || null,
                priority: condition.priority,
                is_active: condition.is_active
            }, { transaction });

            // Clone condition rules
            for (const rule of condition.rules || []) {
                await HrmsWorkflowConditionRule.create({
                    condition_id: newCondition.id,
                    field_source: rule.field_source,
                    field_name: rule.field_name,
                    operator: rule.operator,
                    compare_value: rule.compare_value,
                    compare_value_type: rule.compare_value_type,
                    rule_order: rule.rule_order
                }, { transaction });
            }
        }

        // Clone applicability rules if requested
        if (cloneData.cloneApplicability) {
            for (const applicability of sourceConfig.applicability || []) {
                await HrmsWorkflowApplicability.create({
                    workflow_config_id: newConfig.id,
                    applicability_type: applicability.applicability_type,
                    company_id: cloneData.company_id || applicability.company_id,
                    entity_id: applicability.entity_id,
                    department_id: applicability.department_id,
                    sub_department_id: applicability.sub_department_id,
                    designation_id: applicability.designation_id,
                    level_id: applicability.level_id,
                    grade_id: applicability.grade_id,
                    location_id: applicability.location_id,
                    employee_id: applicability.employee_id,
                    is_excluded: applicability.is_excluded,
                    priority: applicability.priority,
                    is_active: applicability.is_active,
                    created_by: cloneData.created_by
                }, { transaction });
            }
        }

        await transaction.commit();

        console.log(`✓ Workflow config cloned successfully: ${newConfig.id}`);

        return await getWorkflowConfigById(newConfig.id);

    } catch (error) {
        await transaction.rollback();
        console.error('Error cloning workflow config:', error);
        throw error;
    }
};

// ==================== STAGE CRUD ====================

/**
 * Create workflow stage
 * @param {number} workflowConfigId - Workflow config ID
 * @param {Object} stageData - Stage data
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} Created stage
 */
const createStage = async (workflowConfigId, stageData, transaction = null) => {
    try {
        const {
            stage_name,
            stage_order,
            stage_type,
            stage_description,
            approver_logic,
            min_approvals_required,
            sla_days,
            sla_hours,
            pending_action,
            pending_after_days,
            escalate_to_stage_id,
            on_approve_next_stage_id,
            on_reject_action,
            on_reject_stage_id,
            approvers = []
        } = stageData;

        const stage = await HrmsWorkflowStage.create({
            workflow_config_id: workflowConfigId,
            stage_name,
            stage_order,
            stage_type: stage_type || 'approval',
            stage_description,
            approver_logic: approver_logic || 'OR',
            min_approvals_required: min_approvals_required || 1,
            sla_days,
            sla_hours,
            pending_action,
            pending_after_days,
            escalate_to_stage_id,
            on_approve_next_stage_id,
            on_reject_action: on_reject_action || 'reject',
            on_reject_stage_id,
            is_active: true
        }, { transaction });

        console.log(`✓ Stage created: ${stage.stage_name} (Order: ${stage.stage_order})`);

        // Create approvers if provided
        if (approvers && approvers.length > 0) {
            for (const approverData of approvers) {
                await createStageApprover(stage.id, approverData, transaction);
            }
        }

        return stage;

    } catch (error) {
        console.error('Error creating stage:', error);
        throw error;
    }
};

/**
 * Update workflow stage
 * @param {number} stageId - Stage ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated stage
 */
const updateStage = async (stageId, updateData) => {
    try {
        await HrmsWorkflowStage.update(updateData, {
            where: { id: stageId }
        });

        console.log(`✓ Stage updated: ${stageId}`);

        return await HrmsWorkflowStage.findByPk(stageId, {
            include: [{ model: HrmsWorkflowStageApprover, as: 'approvers' }]
        });

    } catch (error) {
        console.error('Error updating stage:', error);
        throw error;
    }
};

/**
 * Delete (deactivate) workflow stage
 * @param {number} stageId - Stage ID
 * @returns {Promise<void>}
 */
const deleteStage = async (stageId) => {
    try {
        await HrmsWorkflowStage.update(
            { is_active: false },
            { where: { id: stageId } }
        );

        console.log(`✓ Stage deleted: ${stageId}`);

    } catch (error) {
        console.error('Error deleting stage:', error);
        throw error;
    }
};

// ==================== STAGE APPROVER CRUD ====================

/**
 * Create stage approver
 * @param {number} stageId - Stage ID
 * @param {Object} approverData - Approver data
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} Created approver
 */
const createStageApprover = async (stageId, approverData, transaction = null) => {
    try {
        const {
            approver_type,
            custom_user_id,
            approver_order,
            has_condition,
            condition_id
        } = approverData;

        const approver = await HrmsWorkflowStageApprover.create({
            stage_id: stageId,
            approver_type,
            custom_user_id,
            approver_order: approver_order || 1,
            has_condition: has_condition || false,
            condition_id,
            is_active: true
        }, { transaction });

        console.log(`✓ Stage approver created: ${approver.approver_type}`);

        return approver;

    } catch (error) {
        console.error('Error creating stage approver:', error);
        throw error;
    }
};

/**
 * Update stage approver
 * @param {number} approverId - Approver ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated approver
 */
const updateStageApprover = async (approverId, updateData) => {
    try {
        await HrmsWorkflowStageApprover.update(updateData, {
            where: { id: approverId }
        });

        console.log(`✓ Stage approver updated: ${approverId}`);

        return await HrmsWorkflowStageApprover.findByPk(approverId);

    } catch (error) {
        console.error('Error updating stage approver:', error);
        throw error;
    }
};

/**
 * Delete stage approver
 * @param {number} approverId - Approver ID
 * @returns {Promise<void>}
 */
const deleteStageApprover = async (approverId) => {
    try {
        await HrmsWorkflowStageApprover.destroy({
            where: { id: approverId }
        });

        console.log(`✓ Stage approver deleted: ${approverId}`);

    } catch (error) {
        console.error('Error deleting stage approver:', error);
        throw error;
    }
};

// ==================== CONDITION CRUD ====================

/**
 * Create workflow condition
 * @param {number} workflowConfigId - Workflow config ID
 * @param {Object} conditionData - Condition data
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} Created condition
 */
const createCondition = async (workflowConfigId, conditionData, transaction = null) => {
    try {
        const {
            condition_name,
            condition_type,
            logic_operator,
            action_type,
            action_stage_id,
            else_action_type,
            else_stage_id,
            priority,
            rules = []
        } = conditionData;

        const condition = await HrmsWorkflowCondition.create({
            workflow_config_id: workflowConfigId,
            condition_name,
            condition_type: condition_type || 'global',
            logic_operator: logic_operator || 'AND',
            action_type,
            action_stage_id,
            else_action_type,
            else_stage_id,
            priority: priority || 1,
            is_active: true
        }, { transaction });

        console.log(`✓ Condition created: ${condition.condition_name}`);

        // Create condition rules if provided
        if (rules && rules.length > 0) {
            for (const ruleData of rules) {
                await createConditionRule(condition.id, ruleData, transaction);
            }
        }

        return condition;

    } catch (error) {
        console.error('Error creating condition:', error);
        throw error;
    }
};

/**
 * Update workflow condition
 * @param {number} conditionId - Condition ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated condition
 */
const updateCondition = async (conditionId, updateData) => {
    try {
        await HrmsWorkflowCondition.update(updateData, {
            where: { id: conditionId }
        });

        console.log(`✓ Condition updated: ${conditionId}`);

        return await HrmsWorkflowCondition.findByPk(conditionId, {
            include: [{ model: HrmsWorkflowConditionRule, as: 'rules' }]
        });

    } catch (error) {
        console.error('Error updating condition:', error);
        throw error;
    }
};

/**
 * Delete workflow condition
 * @param {number} conditionId - Condition ID
 * @returns {Promise<void>}
 */
const deleteCondition = async (conditionId) => {
    try {
        await HrmsWorkflowCondition.update(
            { is_active: false },
            { where: { id: conditionId } }
        );

        console.log(`✓ Condition deleted: ${conditionId}`);

    } catch (error) {
        console.error('Error deleting condition:', error);
        throw error;
    }
};

/**
 * Create condition rule
 * @param {number} conditionId - Condition ID
 * @param {Object} ruleData - Rule data
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} Created rule
 */
const createConditionRule = async (conditionId, ruleData, transaction = null) => {
    try {
        const {
            field_source,
            field_name,
            operator,
            compare_value,
            compare_value_type,
            rule_order
        } = ruleData;

        const rule = await HrmsWorkflowConditionRule.create({
            condition_id: conditionId,
            field_source: field_source || 'employee',
            field_name,
            operator,
            compare_value,
            compare_value_type: compare_value_type || 'string',
            rule_order: rule_order || 1
        }, { transaction });

        console.log(`✓ Condition rule created: ${rule.field_name} ${rule.operator} ${rule.compare_value}`);

        return rule;

    } catch (error) {
        console.error('Error creating condition rule:', error);
        throw error;
    }
};

/**
 * Delete condition rule
 * @param {number} ruleId - Rule ID
 * @returns {Promise<void>}
 */
const deleteConditionRule = async (ruleId) => {
    try {
        await HrmsWorkflowConditionRule.destroy({
            where: { id: ruleId }
        });

        console.log(`✓ Condition rule deleted: ${ruleId}`);

    } catch (error) {
        console.error('Error deleting condition rule:', error);
        throw error;
    }
};

// ==================== APPLICABILITY CRUD ====================

/**
 * Create applicability rule
 * @param {number} workflowConfigId - Workflow config ID
 * @param {Object} applicabilityData - Applicability data
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} Created applicability rule
 */
const createApplicabilityRule = async (workflowConfigId, applicabilityData, transaction = null) => {
    try {
        const applicability = await HrmsWorkflowApplicability.create({
            workflow_config_id: workflowConfigId,
            ...applicabilityData,
            is_active: true
        }, { transaction });

        console.log(`✓ Applicability rule created: ${applicability.applicability_type}`);

        return applicability;

    } catch (error) {
        console.error('Error creating applicability rule:', error);
        throw error;
    }
};

/**
 * Delete applicability rule
 * @param {number} applicabilityId - Applicability ID
 * @returns {Promise<void>}
 */
const deleteApplicabilityRule = async (applicabilityId) => {
    try {
        await HrmsWorkflowApplicability.update(
            { is_active: false },
            { where: { id: applicabilityId } }
        );

        console.log(`✓ Applicability rule deleted: ${applicabilityId}`);

    } catch (error) {
        console.error('Error deleting applicability rule:', error);
        throw error;
    }
};

// ==================== VERSION CONTROL ====================

/**
 * Create version snapshot
 * @param {number} workflowConfigId - Workflow config ID
 * @param {number} versionNumber - Version number
 * @param {string} notes - Version notes
 * @param {number} createdBy - User ID
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} Created version
 */
const createVersionSnapshot = async (workflowConfigId, versionNumber, notes, createdBy, transaction = null) => {
    try {
        // Get complete workflow config snapshot
        const configSnapshot = await getWorkflowConfigById(workflowConfigId);

        const version = await HrmsWorkflowVersion.create({
            workflow_config_id: workflowConfigId,
            version_number: versionNumber,
            workflow_snapshot: configSnapshot.toJSON(),
            notes,
            is_active: true,
            effective_from: new Date(),
            created_by: createdBy
        }, { transaction });

        console.log(`✓ Version snapshot created: v${versionNumber}`);

        return version;

    } catch (error) {
        console.error('Error creating version snapshot:', error);
        throw error;
    }
};

/**
 * Get all versions for a workflow config
 * @param {number} workflowConfigId - Workflow config ID
 * @returns {Promise<Array>} Versions
 */
const getVersionHistory = async (workflowConfigId) => {
    try {
        const versions = await HrmsWorkflowVersion.findAll({
            where: { workflow_config_id: workflowConfigId },
            order: [['version_number', 'DESC']]
        });

        return versions;

    } catch (error) {
        console.error('Error getting version history:', error);
        throw error;
    }
};

/**
 * Restore workflow config from a version
 * @param {number} versionId - Version ID
 * @param {number} restoredBy - User ID
 * @returns {Promise<Object>} Restored config
 */
const restoreFromVersion = async (versionId, restoredBy) => {
    try {
        const version = await HrmsWorkflowVersion.findByPk(versionId);

        if (!version) {
            throw new Error('Version not found');
        }

        const snapshot = version.workflow_snapshot;

        // Create new workflow config from snapshot
        const restoredConfig = await createWorkflowConfig({
            ...snapshot,
            workflow_name: `${snapshot.workflow_name} (Restored v${version.version_number})`,
            created_by: restoredBy
        });

        console.log(`✓ Workflow config restored from version ${version.version_number}`);

        return restoredConfig;

    } catch (error) {
        console.error('Error restoring from version:', error);
        throw error;
    }
};

// ==================== DEFAULT WORKFLOW SETUP ====================

/**
 * Create default workflows for all workflow types during company onboarding
 * Creates simple 1-stage (Reporting Manager) approval workflow for each workflow type
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who created the company
 * @param {Object} transaction - Database transaction object
 * @returns {Promise<Object>} Created workflows summary
 */
const createDefaultWorkflows = async (companyId, userId, transaction = null) => {
    try {
        console.log(`Creating default workflows for company ${companyId}...`);

        // Get all active workflow masters
        const workflowMasters = await HrmsWorkflowMaster.findAll({
            where: { is_active: true },
            order: [['display_order', 'ASC']],
            raw: true,
            transaction
        });

        if (!workflowMasters || workflowMasters.length === 0) {
            throw new Error('No workflow masters found. Please run workflow_master_seed.sql first.');
        }

        console.log(`Found ${workflowMasters.length} workflow types to configure`);

        const createdWorkflows = [];

        // Create default workflow config for each workflow type
        for (const workflowMaster of workflowMasters) {
            try {
                console.log(`Creating default workflow for: ${workflowMaster.workflow_for_name} (${workflowMaster.workflow_code})`);

                // Create workflow config with default settings
                const workflowConfig = await HrmsWorkflowConfig.create({
                    company_id: companyId,
                    workflow_master_id: workflowMaster.id,
                    workflow_name: `Default ${workflowMaster.workflow_for_name} Workflow`,
                    workflow_code: `DEFAULT_${workflowMaster.workflow_code}_${companyId}`,
                    description: `Auto-generated default workflow for ${workflowMaster.workflow_for_name}`,
                    version: 1,
                    is_active: true,
                    is_default: true,
                    allow_self_approval: false,
                    allow_withdrawal: true,
                    require_remarks_on_rejection: true,
                    send_submission_email: true,
                    send_approval_email: true,
                    send_rejection_email: true,
                    created_by: userId
                }, { transaction });

                console.log(`✓ Workflow config created: ${workflowConfig.workflow_name} (ID: ${workflowConfig.id})`);

                // Create single approval stage (Reporting Manager)
                const stage = await HrmsWorkflowStage.create({
                    workflow_config_id: workflowConfig.id,
                    stage_name: 'Manager Approval',
                    stage_order: 1,
                    stage_type: 'approval',
                    stage_description: 'Approval from reporting manager',
                    approver_logic: 'OR',
                    min_approvals_required: 1,
                    sla_days: 2,
                    sla_hours: 0,
                    pending_action: 'auto_reject',
                    pending_after_days: 7,
                    escalate_to_stage_id: null,
                    on_approve_next_stage_id: null,
                    on_reject_action: 'final_reject',
                    on_reject_stage_id: null,
                    is_active: true
                }, { transaction });

                console.log(`✓ Stage created: ${stage.stage_name} (Order: ${stage.stage_order})`);

                // Create stage approver (Reporting Manager)
                const approver = await HrmsWorkflowStageApprover.create({
                    stage_id: stage.id,
                    approver_type: 'reporting_manager',
                    custom_user_id: null,
                    approver_order: 1,
                    has_condition: false,
                    condition_id: null,
                    is_active: true
                }, { transaction });

                console.log(`✓ Stage approver created: ${approver.approver_type}`);

                // Create company-level applicability (workflow applies to entire company)
                const applicability = await HrmsWorkflowApplicability.create({
                    workflow_config_id: workflowConfig.id,
                    applicability_type: 'company',
                    applicability_value: null, // NULL = applies to all employees in company
                    company_id: companyId,
                    advanced_applicability_type: 'none',
                    advanced_applicability_value: null,
                    is_excluded: false,
                    priority: 8, // Company has lowest priority (8)
                    is_active: true,
                    created_by: userId
                }, { transaction });

                console.log(`✓ Company-level applicability created for ${workflowMaster.workflow_for_name}`);

                // Create initial version snapshot (simplified for onboarding)
                await HrmsWorkflowVersion.create({
                    workflow_config_id: workflowConfig.id,
                    version_number: 1,
                    workflow_snapshot: JSON.stringify({
                        workflow_name: workflowConfig.workflow_name,
                        description: workflowConfig.description,
                        version: 1,
                        is_default: true,
                        stage_count: 1,
                        approver_type: 'reporting_manager'
                    }),
                    notes: 'Initial default version created during onboarding',
                    is_active: true,
                    effective_from: new Date(),
                    created_by: userId
                }, { transaction });

                console.log(`✓ Version snapshot created for ${workflowMaster.workflow_for_name}`);

                createdWorkflows.push({
                    workflow_master_id: workflowMaster.id,
                    workflow_code: workflowMaster.workflow_code,
                    workflow_name: workflowMaster.workflow_for_name,
                    config_id: workflowConfig.id,
                    stage_id: stage.id,
                    approver_id: approver.id,
                    applicability_id: applicability.id
                });

                console.log(`✓ Default workflow created for ${workflowMaster.workflow_for_name}`);

            } catch (workflowError) {
                console.error(`Error creating workflow for ${workflowMaster.workflow_for_name}:`, workflowError.message);
                // Continue with other workflows instead of failing completely
            }
        }

        console.log(`✓ Created ${createdWorkflows.length} default workflows successfully`);

        return {
            total_workflows: workflowMasters.length,
            created_count: createdWorkflows.length,
            workflows: createdWorkflows
        };

    } catch (error) {
        console.error('Error creating default workflows:', error.message);
        throw error;
    }
};

module.exports = {
    // Workflow Config
    createWorkflowConfig,
    getWorkflowConfigById,
    getWorkflowConfigs,
    updateWorkflowConfig,
    deleteWorkflowConfig,
    cloneWorkflowConfig,

    // Stages
    createStage,
    updateStage,
    deleteStage,

    // Stage Approvers
    createStageApprover,
    updateStageApprover,
    deleteStageApprover,

    // Conditions
    createCondition,
    updateCondition,
    deleteCondition,
    createConditionRule,
    deleteConditionRule,

    // Applicability
    createApplicabilityRule,
    deleteApplicabilityRule,

    // Versioning
    createVersionSnapshot,
    getVersionHistory,
    restoreFromVersion,

    // Default Setup
    createDefaultWorkflows
};
