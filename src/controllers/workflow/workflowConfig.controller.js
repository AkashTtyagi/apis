/**
 * Workflow Config Controller
 * Handles admin operations for workflow configuration
 * - CRUD for workflow configs
 * - Stage management
 * - Approver configuration
 * - Condition management
 * - Applicability rules
 * - Workflow cloning and versioning
 */

const workflowConfigService = require('../../services/workflow/workflowConfig.service');
const { HrmsWorkflowMaster } = require('../../models/workflow');

// ==================== WORKFLOW CONFIG CRUD ====================

/**
 * Create new workflow configuration
 * POST /api/workflow/admin/configs
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createConfig = async (req, res) => {
    try {
        const configData = {
            company_id:req.user.company_id,
            ...req.body,
            created_by: req.user.user_id
        };

        const config = await workflowConfigService.createWorkflowConfig(configData);

        return res.status(201).json({
            success: true,
            message: 'Workflow configuration created successfully',
            data: config
        });

    } catch (error) {
        console.error('Error creating workflow config:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create workflow configuration',
            error: error.toString()
        });
    }
};

/**
 * Get workflow configuration by ID
 * GET /api/workflow/admin/configs/:configId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getConfigById = async (req, res) => {
    try {
        const { configId } = req.params;

        const config = await workflowConfigService.getWorkflowConfigById(configId);

        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Workflow configuration not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: config
        });

    } catch (error) {
        console.error('Error getting workflow config:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get workflow configuration',
            error: error.toString()
        });
    }
};

/**
 * Get all workflow configurations
 * GET /api/workflow/admin/configs
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getAllConfigs = async (req, res) => {
    try {
        const { workflow_master_id, is_active, is_default } = req.query;

        const filters = {};

        if (workflow_master_id) {
            filters.workflow_master_id = parseInt(workflow_master_id);
        }

        if (is_active !== undefined) {
            filters.is_active = is_active === 'true';
        }

        if (is_default !== undefined) {
            filters.is_default = is_default === 'true';
        }

        // Always use company_id from authenticated user
        const companyId = req.user.company_id;

        const configs = await workflowConfigService.getWorkflowConfigs(companyId, filters);

        return res.status(200).json({
            success: true,
            data: configs
        });

    } catch (error) {
        console.error('Error getting workflow configs:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get workflow configurations',
            error: error.toString()
        });
    }
};

/**
 * Update workflow configuration
 * PUT /api/workflow/admin/configs/:configId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateConfig = async (req, res) => {
    try {
        const { configId } = req.params;

        const updateData = {
            ...req.body,
            updated_by: req.user.user_id
        };

        const config = await workflowConfigService.updateWorkflowConfig(configId, updateData);

        return res.status(200).json({
            success: true,
            message: 'Workflow configuration updated successfully',
            data: config
        });

    } catch (error) {
        console.error('Error updating workflow config:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update workflow configuration',
            error: error.toString()
        });
    }
};

/**
 * Delete workflow configuration
 * DELETE /api/workflow/admin/configs/:configId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteConfig = async (req, res) => {
    try {
        const { configId } = req.params;

        await workflowConfigService.deleteWorkflowConfig(configId);

        return res.status(200).json({
            success: true,
            message: 'Workflow configuration deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting workflow config:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete workflow configuration',
            error: error.toString()
        });
    }
};

/**
 * Clone workflow configuration
 * POST /api/workflow/admin/configs/:configId/clone
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const cloneConfig = async (req, res) => {
    try {
        const { configId } = req.params;

        const cloneData = {
            company_id: req.user.company_id,
            ...req.body,
            created_by: req.user.user_id
        };

        const clonedConfig = await workflowConfigService.cloneWorkflowConfig(configId, cloneData);

        return res.status(201).json({
            success: true,
            message: 'Workflow configuration cloned successfully',
            data: clonedConfig
        });

    } catch (error) {
        console.error('Error cloning workflow config:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to clone workflow configuration',
            error: error.toString()
        });
    }
};

// ==================== STAGE MANAGEMENT ====================

/**
 * Create stage
 * POST /api/workflow/admin/configs/:configId/stages
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createStage = async (req, res) => {
    try {
        const { configId } = req.params;

        const stage = await workflowConfigService.createStage(configId, req.body);

        return res.status(201).json({
            success: true,
            message: 'Stage created successfully',
            data: stage
        });

    } catch (error) {
        console.error('Error creating stage:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create stage',
            error: error.toString()
        });
    }
};

/**
 * Update stage
 * PUT /api/workflow/admin/stages/:stageId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateStage = async (req, res) => {
    try {
        const { stageId } = req.params;

        const stage = await workflowConfigService.updateStage(stageId, req.body);

        return res.status(200).json({
            success: true,
            message: 'Stage updated successfully',
            data: stage
        });

    } catch (error) {
        console.error('Error updating stage:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update stage',
            error: error.toString()
        });
    }
};

/**
 * Delete stage
 * DELETE /api/workflow/admin/stages/:stageId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteStage = async (req, res) => {
    try {
        const { stageId } = req.params;

        await workflowConfigService.deleteStage(stageId);

        return res.status(200).json({
            success: true,
            message: 'Stage deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting stage:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete stage',
            error: error.toString()
        });
    }
};

// ==================== STAGE APPROVER MANAGEMENT ====================

/**
 * Create stage approver
 * POST /api/workflow/admin/stages/:stageId/approvers
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createStageApprover = async (req, res) => {
    try {
        const { stageId } = req.params;

        const approver = await workflowConfigService.createStageApprover(stageId, req.body);

        return res.status(201).json({
            success: true,
            message: 'Stage approver created successfully',
            data: approver
        });

    } catch (error) {
        console.error('Error creating stage approver:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create stage approver',
            error: error.toString()
        });
    }
};

/**
 * Update stage approver
 * PUT /api/workflow/admin/approvers/:approverId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateStageApprover = async (req, res) => {
    try {
        const { approverId } = req.params;

        const approver = await workflowConfigService.updateStageApprover(approverId, req.body);

        return res.status(200).json({
            success: true,
            message: 'Stage approver updated successfully',
            data: approver
        });

    } catch (error) {
        console.error('Error updating stage approver:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update stage approver',
            error: error.toString()
        });
    }
};

/**
 * Delete stage approver
 * DELETE /api/workflow/admin/approvers/:approverId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteStageApprover = async (req, res) => {
    try {
        const { approverId } = req.params;

        await workflowConfigService.deleteStageApprover(approverId);

        return res.status(200).json({
            success: true,
            message: 'Stage approver deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting stage approver:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete stage approver',
            error: error.toString()
        });
    }
};

// ==================== CONDITION MANAGEMENT ====================

/**
 * Create condition
 * POST /api/workflow/admin/configs/:configId/conditions
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createCondition = async (req, res) => {
    try {
        const { configId } = req.params;

        const condition = await workflowConfigService.createCondition(configId, req.body);

        return res.status(201).json({
            success: true,
            message: 'Condition created successfully',
            data: condition
        });

    } catch (error) {
        console.error('Error creating condition:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create condition',
            error: error.toString()
        });
    }
};

/**
 * Update condition
 * PUT /api/workflow/admin/conditions/:conditionId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateCondition = async (req, res) => {
    try {
        const { conditionId } = req.params;

        const condition = await workflowConfigService.updateCondition(conditionId, req.body);

        return res.status(200).json({
            success: true,
            message: 'Condition updated successfully',
            data: condition
        });

    } catch (error) {
        console.error('Error updating condition:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update condition',
            error: error.toString()
        });
    }
};

/**
 * Delete condition
 * DELETE /api/workflow/admin/conditions/:conditionId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteCondition = async (req, res) => {
    try {
        const { conditionId } = req.params;

        await workflowConfigService.deleteCondition(conditionId);

        return res.status(200).json({
            success: true,
            message: 'Condition deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting condition:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete condition',
            error: error.toString()
        });
    }
};

/**
 * Create condition rule
 * POST /api/workflow/admin/conditions/:conditionId/rules
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createConditionRule = async (req, res) => {
    try {
        const { conditionId } = req.params;

        const rule = await workflowConfigService.createConditionRule(conditionId, req.body);

        return res.status(201).json({
            success: true,
            message: 'Condition rule created successfully',
            data: rule
        });

    } catch (error) {
        console.error('Error creating condition rule:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create condition rule',
            error: error.toString()
        });
    }
};

/**
 * Delete condition rule
 * DELETE /api/workflow/admin/rules/:ruleId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteConditionRule = async (req, res) => {
    try {
        const { ruleId } = req.params;

        await workflowConfigService.deleteConditionRule(ruleId);

        return res.status(200).json({
            success: true,
            message: 'Condition rule deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting condition rule:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete condition rule',
            error: error.toString()
        });
    }
};

// ==================== APPLICABILITY MANAGEMENT ====================

/**
 * Create applicability rule
 * POST /api/workflow/admin/configs/:configId/applicability
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createApplicability = async (req, res) => {
    try {
        const { configId } = req.params;

        const applicabilityData = {
            ...req.body,
            created_by: req.user.user_id
        };

        const applicability = await workflowConfigService.createApplicabilityRule(configId, applicabilityData);

        return res.status(201).json({
            success: true,
            message: 'Applicability rule created successfully',
            data: applicability
        });

    } catch (error) {
        console.error('Error creating applicability rule:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create applicability rule',
            error: error.toString()
        });
    }
};

/**
 * Update applicability rule
 * POST /api/workflows/admin/applicability
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateApplicability = async (req, res) => {
    try {
        const { applicability_id, ...updateData } = req.body;

        if (!applicability_id) {
            return res.status(400).json({
                success: false,
                message: 'Applicability ID is required'
            });
        }

        // Use company_id from authenticated user
        updateData.company_id = req.user.company_id;

        const applicability = await workflowConfigService.updateApplicabilityRule(applicability_id, updateData);

        return res.status(200).json({
            success: true,
            message: 'Applicability rule updated successfully',
            data: applicability
        });

    } catch (error) {
        console.error('Error updating applicability rule:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update applicability rule',
            error: error.toString()
        });
    }
};

/**
 * Delete applicability rule
 * DELETE /api/workflow/admin/applicability/:applicabilityId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteApplicability = async (req, res) => {
    try {
        const { applicabilityId } = req.params;

        await workflowConfigService.deleteApplicabilityRule(applicabilityId);

        return res.status(200).json({
            success: true,
            message: 'Applicability rule deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting applicability rule:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete applicability rule',
            error: error.toString()
        });
    }
};

// ==================== WORKFLOW MASTER ====================

/**
 * Get all workflow masters
 * GET /api/workflow/admin/masters
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getWorkflowMasters = async (req, res) => {
    try {
        const { is_active } = req.query;

        const where = {};

        if (is_active !== undefined) {
            where.is_active = is_active === 'true';
        }

        const masters = await HrmsWorkflowMaster.findAll({
            where,
            order: [['workflow_for_name', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            data: masters
        });

    } catch (error) {
        console.error('Error getting workflow masters:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get workflow masters',
            error: error.toString()
        });
    }
};

// ==================== VERSION CONTROL ====================

/**
 * Get version history
 * GET /api/workflow/admin/configs/:configId/versions
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getVersionHistory = async (req, res) => {
    try {
        const { configId } = req.params;

        const versions = await workflowConfigService.getVersionHistory(configId);

        return res.status(200).json({
            success: true,
            data: versions
        });

    } catch (error) {
        console.error('Error getting version history:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get version history',
            error: error.toString()
        });
    }
};

/**
 * Restore from version
 * POST /api/workflow/admin/versions/:versionId/restore
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const restoreFromVersion = async (req, res) => {
    try {
        const { versionId } = req.params;

        const restoredConfig = await workflowConfigService.restoreFromVersion(versionId, req.user.user_id);

        return res.status(201).json({
            success: true,
            message: 'Workflow configuration restored from version successfully',
            data: restoredConfig
        });

    } catch (error) {
        console.error('Error restoring from version:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to restore from version',
            error: error.toString()
        });
    }
};

module.exports = {
    // Workflow Config
    createConfig,
    getConfigById,
    getAllConfigs,
    updateConfig,
    deleteConfig,
    cloneConfig,

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
    createApplicability,
    updateApplicability,
    deleteApplicability,

    // Workflow Masters
    getWorkflowMasters,

    // Version Control
    getVersionHistory,
    restoreFromVersion
};
