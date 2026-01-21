/**
 * Expense Policy Controller
 * Handles HTTP requests for expense policy management
 */

const expensePolicyService = require('../../services/expensePolicy.service');

/**
 * Create a new expense policy
 * POST /api/expense/admin/policies/create
 */
const createPolicy = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;

        const result = await expensePolicyService.createPolicy(req.body, companyId, userId);

        return res.status(201).json({
            success: true,
            message: 'Policy created successfully',
            data: result
        });

    } catch (error) {
        console.error('Error creating policy:', error);

        if (error.name === 'SequelizeUniqueConstraintError' || error.original?.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'A policy with this code already exists'
            });
        }

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
            message: error.message || 'Failed to create policy'
        });
    }
};

/**
 * Get all policies with filters
 * POST /api/expense/admin/policies/list
 */
const getAllPolicies = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const filters = req.body;

        const result = await expensePolicyService.getPolicies(companyId, filters);

        return res.status(200).json({
            success: true,
            data: result.policies,
            pagination: result.pagination
        });

    } catch (error) {
        console.error('Error getting policies:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get policies'
        });
    }
};

/**
 * Get policy details
 * POST /api/expense/admin/policies/details
 */
const getPolicyDetails = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { policy_id, id } = req.body;
        const policyId = policy_id || id;

        if (!policyId) {
            return res.status(400).json({
                success: false,
                message: 'Policy ID is required'
            });
        }

        const result = await expensePolicyService.getPolicyDetails(policyId, companyId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting policy details:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get policy details'
        });
    }
};

/**
 * Update policy
 * POST /api/expense/admin/policies/update
 */
const updatePolicy = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;
        const { policy_id, id, ...updateData } = req.body;
        const policyId = policy_id || id;

        if (!policyId) {
            return res.status(400).json({
                success: false,
                message: 'Policy ID is required'
            });
        }

        const result = await expensePolicyService.updatePolicy(policyId, updateData, companyId, userId);

        return res.status(200).json({
            success: true,
            message: 'Policy updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error updating policy:', error);

        if (error.name === 'SequelizeUniqueConstraintError' || error.original?.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'A policy with this code already exists'
            });
        }

        if (error.message === 'Policy not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('required') ||
            error.message.includes('already exists') ||
            error.message.includes('cannot') ||
            error.message.includes('must be')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update policy'
        });
    }
};

/**
 * Delete policy
 * POST /api/expense/admin/policies/delete
 */
const deletePolicy = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;
        const { policy_id, id } = req.body;
        const policyId = policy_id || id;

        if (!policyId) {
            return res.status(400).json({
                success: false,
                message: 'Policy ID is required'
            });
        }

        await expensePolicyService.deletePolicy(policyId, companyId, userId);

        return res.status(200).json({
            success: true,
            message: 'Policy deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting policy:', error);

        if (error.message === 'Policy not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('Cannot delete') ||
            error.message.includes('default policy')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete policy'
        });
    }
};

/**
 * Check policy usage
 * POST /api/expense/admin/policies/check-usage
 */
const checkUsage = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { policy_id, id } = req.body;
        const policyId = policy_id || id;

        if (!policyId) {
            return res.status(400).json({
                success: false,
                message: 'Policy ID is required'
            });
        }

        const result = await expensePolicyService.checkUsage(policyId, companyId);

        if (!result.exists) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error checking policy usage:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to check policy usage'
        });
    }
};

/**
 * Manage policy applicability
 * POST /api/expense/admin/policies/manage-applicability
 */
const manageApplicability = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;
        const { policy_id, id, applicability } = req.body;
        const policyId = policy_id || id;

        if (!policyId) {
            return res.status(400).json({
                success: false,
                message: 'Policy ID is required'
            });
        }

        if (!applicability || !Array.isArray(applicability)) {
            return res.status(400).json({
                success: false,
                message: 'Applicability rules are required'
            });
        }

        const result = await expensePolicyService.manageApplicability(policyId, applicability, companyId, userId);

        return res.status(200).json({
            success: true,
            message: 'Applicability rules updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error managing applicability:', error);

        if (error.message === 'Policy not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to manage applicability'
        });
    }
};

/**
 * Toggle policy status
 * POST /api/expense/admin/policies/toggle-status
 */
const toggleStatus = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;
        const { policy_id, id } = req.body;
        const policyId = policy_id || id;

        if (!policyId) {
            return res.status(400).json({
                success: false,
                message: 'Policy ID is required'
            });
        }

        const result = await expensePolicyService.toggleStatus(policyId, companyId, userId);

        return res.status(200).json({
            success: true,
            message: `Policy ${result.is_active ? 'activated' : 'deactivated'} successfully`,
            data: result
        });

    } catch (error) {
        console.error('Error toggling policy status:', error);

        if (error.message === 'Policy not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('Cannot deactivate')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to toggle policy status'
        });
    }
};

/**
 * Set default policy
 * POST /api/expense/admin/policies/set-default
 */
const setDefaultPolicy = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;
        const { policy_id, id } = req.body;
        const policyId = policy_id || id;

        if (!policyId) {
            return res.status(400).json({
                success: false,
                message: 'Policy ID is required'
            });
        }

        const result = await expensePolicyService.setDefaultPolicy(policyId, companyId, userId);

        return res.status(200).json({
            success: true,
            message: 'Default policy set successfully',
            data: result
        });

    } catch (error) {
        console.error('Error setting default policy:', error);

        if (error.message === 'Policy not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('inactive') ||
            error.message.includes('Cannot set')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to set default policy'
        });
    }
};

/**
 * Find applicable policy for an employee
 * POST /api/expense/admin/policies/find-for-employee
 */
const findPolicyForEmployee = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const employeeData = req.body;

        const result = await expensePolicyService.findApplicablePolicyForEmployee(companyId, employeeData);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error finding policy for employee:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to find policy for employee'
        });
    }
};

/**
 * Get allowed categories for an employee
 * POST /api/expense/admin/policies/allowed-categories
 */
const getAllowedCategories = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const employeeData = req.body;

        const result = await expensePolicyService.getAllowedCategoriesForEmployee(companyId, employeeData);

        return res.status(200).json({
            success: true,
            data: {
                allowed_categories: result,
                all_categories_allowed: result === null
            }
        });

    } catch (error) {
        console.error('Error getting allowed categories:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get allowed categories'
        });
    }
};

module.exports = {
    createPolicy,
    getAllPolicies,
    getPolicyDetails,
    updatePolicy,
    deletePolicy,
    checkUsage,
    manageApplicability,
    toggleStatus,
    setDefaultPolicy,
    findPolicyForEmployee,
    getAllowedCategories
};
