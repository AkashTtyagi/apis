/**
 * Expense Workflow Controller
 * Handles HTTP requests for expense approval workflow management
 */

const expenseWorkflowService = require('../../services/expenseWorkflow.service');

/**
 * Create a new expense approval workflow
 * POST /api/expense/admin/workflows/create
 */
const createWorkflow = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;

        const result = await expenseWorkflowService.createWorkflow(req.body, companyId, userId);

        return res.status(201).json({
            success: true,
            message: 'Workflow created successfully',
            data: result
        });

    } catch (error) {
        console.error('Error creating workflow:', error);

        if (error.message.includes('already exists') ||
            error.message.includes('required') ||
            error.message.includes('must be')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create workflow'
        });
    }
};

/**
 * Get all workflows with filters
 * POST /api/expense/admin/workflows/list
 */
const getAllWorkflows = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const filters = req.body;

        const result = await expenseWorkflowService.getAllWorkflows(filters, companyId);

        return res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {
        console.error('Error getting workflows:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get workflows'
        });
    }
};

/**
 * Get workflow details
 * POST /api/expense/admin/workflows/details
 */
const getWorkflowDetails = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { workflow_id } = req.body;

        const result = await expenseWorkflowService.getWorkflowDetails(workflow_id, companyId);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting workflow details:', error);

        if (error.message === 'Workflow not found' ||
            error.message.includes('required')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get workflow details'
        });
    }
};

/**
 * Update workflow
 * POST /api/expense/admin/workflows/update
 */
const updateWorkflow = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;

        const result = await expenseWorkflowService.updateWorkflow(req.body, companyId, userId);

        return res.status(200).json({
            success: true,
            message: 'Workflow updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error updating workflow:', error);

        if (error.message === 'Workflow not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('required') ||
            error.message.includes('cannot be') ||
            error.message.includes('must be')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update workflow'
        });
    }
};

/**
 * Delete workflow
 * POST /api/expense/admin/workflows/delete
 */
const deleteWorkflow = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;
        const { workflow_id } = req.body;

        const result = await expenseWorkflowService.deleteWorkflow(workflow_id, companyId, userId);

        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.error('Error deleting workflow:', error);

        if (error.message === 'Workflow not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('Cannot delete') ||
            error.message.includes('required')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete workflow'
        });
    }
};

/**
 * Clone workflow
 * POST /api/expense/admin/workflows/clone
 */
const cloneWorkflow = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;
        const { workflow_id, workflow_name, workflow_code } = req.body;

        const result = await expenseWorkflowService.cloneWorkflow(
            workflow_id,
            { workflow_name, workflow_code },
            companyId,
            userId
        );

        return res.status(201).json({
            success: true,
            message: 'Workflow cloned successfully',
            data: result
        });

    } catch (error) {
        console.error('Error cloning workflow:', error);

        if (error.message === 'Workflow not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('already exists')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to clone workflow'
        });
    }
};

/**
 * Get all category to workflow mappings
 * POST /api/expense/admin/workflows/category-mapping/list
 */
const getCategoryMappings = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const filters = req.body;

        const result = await expenseWorkflowService.getCategoryMappings(filters, companyId);

        return res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {
        console.error('Error getting category mappings:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get category mappings'
        });
    }
};

/**
 * Manage category to workflow mapping
 * POST /api/expense/admin/workflows/category-mapping/manage
 */
const manageCategoryMapping = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;

        const result = await expenseWorkflowService.manageCategoryMapping(req.body, companyId, userId);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: { id: result.id }
        });

    } catch (error) {
        console.error('Error managing category mapping:', error);

        if (error.message.includes('required') ||
            error.message.includes('Invalid')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to manage category mapping'
        });
    }
};

/**
 * Get applicable workflow for expense
 * POST /api/expense/admin/workflows/get-applicable
 */
const getApplicableWorkflow = async (req, res) => {
    try {
        const companyId = req.user.company_id;

        const result = await expenseWorkflowService.getApplicableWorkflow(req.body, companyId);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting applicable workflow:', error);

        if (error.message === 'No active workflow found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get applicable workflow'
        });
    }
};

/**
 * Get dropdown data for workflow forms
 * POST /api/expense/admin/workflows/dropdown
 */
const getDropdownData = async (req, res) => {
    try {
        const companyId = req.user.company_id;

        const result = await expenseWorkflowService.getDropdownData(companyId);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting dropdown data:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get dropdown data'
        });
    }
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
