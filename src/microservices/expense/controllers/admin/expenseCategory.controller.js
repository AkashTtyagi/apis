/**
 * Expense Category Controller
 * Handles HTTP requests for expense category management
 * Thin controller - delegates to service layer
 */

const expenseCategoryService = require('../../services/expenseCategory.service');

/**
 * Create a new expense category
 * POST /api/expense/admin/categories/create
 */
const createCategory = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;

        const result = await expenseCategoryService.createCategory(req.body, companyId, userId);

        return res.status(201).json({
            success: true,
            message: 'Expense category created successfully',
            data: result
        });

    } catch (error) {
        console.error('Error creating expense category:', error);

        if (error.message.includes('already exists') ||
            error.message.includes('required') ||
            error.message.includes('must be') ||
            error.message.includes('Duplicate') ||
            error.message.includes('not found')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create expense category'
        });
    }
};

/**
 * Get all expense categories with filters
 * POST /api/expense/admin/categories/list
 */
const getAllCategories = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const filters = req.body;

        const result = await expenseCategoryService.getAllCategories(filters, companyId);

        return res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {
        console.error('Error getting expense categories:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get expense categories'
        });
    }
};

/**
 * Get expense category details
 * POST /api/expense/admin/categories/details
 */
const getCategoryDetails = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { category_id } = req.body;

        const result = await expenseCategoryService.getCategoryDetails(category_id, companyId);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting expense category details:', error);

        if (error.message === 'Category not found' ||
            error.message.includes('required')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get expense category details'
        });
    }
};

/**
 * Update expense category
 * POST /api/expense/admin/categories/update
 */
const updateCategory = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;

        const result = await expenseCategoryService.updateCategory(req.body, companyId, userId);

        return res.status(200).json({
            success: true,
            message: 'Expense category updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error updating expense category:', error);

        if (error.message === 'Category not found') {
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
            message: error.message || 'Failed to update expense category'
        });
    }
};

/**
 * Delete expense category
 * POST /api/expense/admin/categories/delete
 */
const deleteCategory = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;
        const { category_id } = req.body;

        const result = await expenseCategoryService.deleteCategory(category_id, companyId, userId);

        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.error('Error deleting expense category:', error);

        if (error.message === 'Category not found') {
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
            message: error.message || 'Failed to delete expense category'
        });
    }
};

/**
 * Get dropdown data for category forms
 * POST /api/expense/admin/categories/dropdown
 */
const getCategoryDropdownData = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const filters = req.body;

        const result = await expenseCategoryService.getCategoryDropdownData(filters, companyId);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting category dropdown data:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get category dropdown data'
        });
    }
};

/**
 * Manage category limits (add/update/delete)
 * POST /api/expense/admin/categories/limits/manage
 */
const manageCategoryLimits = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;

        const result = await expenseCategoryService.manageCategoryLimits(req.body, companyId, userId);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Error managing category limits:', error);

        if (error.message === 'Category not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('required') ||
            error.message.includes('Invalid')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to manage category limits'
        });
    }
};

/**
 * Manage custom fields (add/update/delete)
 * POST /api/expense/admin/categories/custom-fields/manage
 */
const manageCustomFields = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;

        const result = await expenseCategoryService.manageCustomFields(req.body, companyId, userId);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Error managing custom fields:', error);

        if (error.message === 'Category not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('required') ||
            error.message.includes('Invalid') ||
            error.message.includes('already exists')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to manage custom fields'
        });
    }
};

/**
 * Update filing rules for a category
 * POST /api/expense/admin/categories/filing-rules/update
 */
const updateFilingRules = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;

        const result = await expenseCategoryService.updateFilingRules(req.body, companyId, userId);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Error updating filing rules:', error);

        if (error.message === 'Category not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('required')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update filing rules'
        });
    }
};

/**
 * Clone an existing category
 * POST /api/expense/admin/categories/clone
 */
const cloneCategory = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;

        const result = await expenseCategoryService.cloneCategory(req.body, companyId, userId);

        return res.status(201).json({
            success: true,
            message: 'Category cloned successfully',
            data: result
        });

    } catch (error) {
        console.error('Error cloning category:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('required') ||
            error.message.includes('already exists')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to clone category'
        });
    }
};

/**
 * Reorder categories
 * POST /api/expense/admin/categories/reorder
 */
const reorderCategories = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;

        const result = await expenseCategoryService.reorderCategories(req.body, companyId, userId);

        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.error('Error reordering categories:', error);

        if (error.message.includes('required')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to reorder categories'
        });
    }
};

/**
 * Get category hierarchy (tree structure)
 * POST /api/expense/admin/categories/hierarchy
 */
const getCategoryHierarchy = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const filters = req.body;

        const result = await expenseCategoryService.getCategoryHierarchy(filters, companyId);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting category hierarchy:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get category hierarchy'
        });
    }
};

/**
 * Check category usage in other modules
 * POST /api/expense/admin/categories/check-usage
 */
const checkUsage = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { category_id, id } = req.body;

        const result = await expenseCategoryService.checkUsage(category_id || id, companyId);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error checking category usage:', error);

        if (error.message === 'Category not found' ||
            error.message.includes('required')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to check category usage'
        });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryDetails,
    updateCategory,
    deleteCategory,
    getCategoryDropdownData,
    manageCategoryLimits,
    manageCustomFields,
    updateFilingRules,
    cloneCategory,
    reorderCategories,
    getCategoryHierarchy,
    checkUsage
};
