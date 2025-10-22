/**
 * Admin Policy Controller
 * Handles HTTP requests for policy management by administrators
 */

const adminPolicyService = require('../../services/policy/admin.policy.service');

// =====================================================
// POLICY CATEGORY CONTROLLERS
// =====================================================

/**
 * Create policy category
 * POST /api/admin/policy/categories/create
 */
const createPolicyCategory = async (req, res) => {
    try {
        const { company_id, category_name, category_slug, category_description, display_order } = req.body;
        const user_id = req.user?.id;

        if (!company_id || !category_name || !category_slug) {
            return res.status(400).json({
                success: false,
                message: 'company_id, category_name, and category_slug are required'
            });
        }

        const category = await adminPolicyService.createPolicyCategory({
            company_id,
            category_name,
            category_slug,
            category_description,
            display_order,
            user_id
        });

        res.status(201).json({
            success: true,
            message: 'Policy category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Error creating policy category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create policy category'
        });
    }
};

/**
 * Get categories by company
 * POST /api/admin/policy/categories/list
 */
const getCategoriesByCompany = async (req, res) => {
    try {
        const { company_id, include_inactive } = req.body;

        if (!company_id) {
            return res.status(400).json({
                success: false,
                message: 'company_id is required'
            });
        }

        const categories = await adminPolicyService.getCategoriesByCompany(company_id, include_inactive);

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch categories'
        });
    }
};

/**
 * Update policy category
 * POST /api/admin/policy/categories/update
 */
const updatePolicyCategory = async (req, res) => {
    try {
        const { category_id, category_name, category_description, display_order, is_active } = req.body;
        const user_id = req.user?.id;

        if (!category_id) {
            return res.status(400).json({
                success: false,
                message: 'category_id is required'
            });
        }

        const category = await adminPolicyService.updatePolicyCategory(category_id, {
            category_name,
            category_description,
            display_order,
            is_active,
            user_id
        });

        res.status(200).json({
            success: true,
            message: 'Policy category updated successfully',
            data: category
        });
    } catch (error) {
        console.error('Error updating policy category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update policy category'
        });
    }
};

/**
 * Delete policy category
 * POST /api/admin/policy/categories/delete
 */
const deletePolicyCategory = async (req, res) => {
    try {
        const { category_id } = req.body;
        const user_id = req.user?.id;

        if (!category_id) {
            return res.status(400).json({
                success: false,
                message: 'category_id is required'
            });
        }

        const result = await adminPolicyService.deletePolicyCategory(category_id, user_id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error deleting policy category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete policy category'
        });
    }
};

// =====================================================
// POLICY MANAGEMENT CONTROLLERS
// =====================================================

/**
 * Create policy
 * POST /api/admin/policy/create
 */
const createPolicy = async (req, res) => {
    try {
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
            expires_on
        } = req.body;
        const user_id = req.user?.id;

        if (!company_id || !category_id || !policy_title || !policy_slug) {
            return res.status(400).json({
                success: false,
                message: 'company_id, category_id, policy_title, and policy_slug are required'
            });
        }

        const policy = await adminPolicyService.createPolicy({
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
        });

        res.status(201).json({
            success: true,
            message: 'Policy created successfully',
            data: policy
        });
    } catch (error) {
        console.error('Error creating policy:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create policy'
        });
    }
};

/**
 * Get policies by company
 * POST /api/admin/policy/list
 */
const getPoliciesByCompany = async (req, res) => {
    try {
        const {
            company_id,
            category_id,
            requires_acknowledgment,
            force_acknowledgment,
            is_active,
            search,
            page,
            limit
        } = req.body;

        if (!company_id) {
            return res.status(400).json({
                success: false,
                message: 'company_id is required'
            });
        }

        const result = await adminPolicyService.getPoliciesByCompany({
            company_id,
            category_id,
            requires_acknowledgment,
            force_acknowledgment,
            is_active,
            search,
            page,
            limit
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching policies:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch policies'
        });
    }
};

/**
 * Get policy by ID
 * POST /api/admin/policy/details
 */
const getPolicyById = async (req, res) => {
    try {
        const { policy_id } = req.body;

        if (!policy_id) {
            return res.status(400).json({
                success: false,
                message: 'policy_id is required'
            });
        }

        const policy = await adminPolicyService.getPolicyById(policy_id);

        res.status(200).json({
            success: true,
            data: policy
        });
    } catch (error) {
        console.error('Error fetching policy:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch policy'
        });
    }
};

/**
 * Update policy
 * POST /api/admin/policy/update
 */
const updatePolicy = async (req, res) => {
    try {
        const {
            policy_id,
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
            is_active
        } = req.body;
        const user_id = req.user?.id;

        if (!policy_id) {
            return res.status(400).json({
                success: false,
                message: 'policy_id is required'
            });
        }

        const policy = await adminPolicyService.updatePolicy(policy_id, {
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
        });

        res.status(200).json({
            success: true,
            message: 'Policy updated successfully',
            data: policy
        });
    } catch (error) {
        console.error('Error updating policy:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update policy'
        });
    }
};

/**
 * Delete policy
 * POST /api/admin/policy/delete
 */
const deletePolicy = async (req, res) => {
    try {
        const { policy_id } = req.body;
        const user_id = req.user?.id;

        if (!policy_id) {
            return res.status(400).json({
                success: false,
                message: 'policy_id is required'
            });
        }

        const result = await adminPolicyService.deletePolicy(policy_id, user_id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error deleting policy:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete policy'
        });
    }
};

// =====================================================
// POLICY VERSION CONTROLLERS
// =====================================================

/**
 * Create policy version
 * POST /api/admin/policy/version/create
 */
const createPolicyVersion = async (req, res) => {
    try {
        const {
            policy_id,
            version_title,
            version_description,
            policy_content,
            change_summary,
            publish_immediately
        } = req.body;
        const user_id = req.user?.id;

        if (!policy_id || !version_title) {
            return res.status(400).json({
                success: false,
                message: 'policy_id and version_title are required'
            });
        }

        const version = await adminPolicyService.createPolicyVersion({
            policy_id,
            version_title,
            version_description,
            policy_content,
            change_summary,
            publish_immediately,
            user_id
        });

        res.status(201).json({
            success: true,
            message: 'Policy version created successfully',
            data: version
        });
    } catch (error) {
        console.error('Error creating policy version:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create policy version'
        });
    }
};

/**
 * Publish policy version
 * POST /api/admin/policy/version/publish
 */
const publishPolicyVersion = async (req, res) => {
    try {
        const { version_id } = req.body;
        const user_id = req.user?.id;

        if (!version_id) {
            return res.status(400).json({
                success: false,
                message: 'version_id is required'
            });
        }

        const version = await adminPolicyService.publishPolicyVersion(version_id, user_id);

        res.status(200).json({
            success: true,
            message: 'Policy version published successfully',
            data: version
        });
    } catch (error) {
        console.error('Error publishing policy version:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to publish policy version'
        });
    }
};

/**
 * Rollback policy version
 * POST /api/admin/policy/version/rollback
 */
const rollbackPolicyVersion = async (req, res) => {
    try {
        const { policy_id, target_version_number } = req.body;
        const user_id = req.user?.id;

        if (!policy_id || !target_version_number) {
            return res.status(400).json({
                success: false,
                message: 'policy_id and target_version_number are required'
            });
        }

        const version = await adminPolicyService.rollbackPolicyVersion(policy_id, target_version_number, user_id);

        res.status(200).json({
            success: true,
            message: 'Policy rolled back successfully',
            data: version
        });
    } catch (error) {
        console.error('Error rolling back policy:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to rollback policy'
        });
    }
};

/**
 * Get all versions for a policy
 * POST /api/admin/policy/version/list
 */
const getPolicyVersions = async (req, res) => {
    try {
        const { policy_id } = req.body;

        if (!policy_id) {
            return res.status(400).json({
                success: false,
                message: 'policy_id is required'
            });
        }

        const versions = await adminPolicyService.getPolicyVersions(policy_id);

        res.status(200).json({
            success: true,
            data: versions
        });
    } catch (error) {
        console.error('Error fetching policy versions:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch policy versions'
        });
    }
};

// =====================================================
// POLICY APPLICABILITY CONTROLLERS
// =====================================================

/**
 * Set policy applicability
 * POST /api/admin/policy/applicability/set
 */
const setPolicyApplicability = async (req, res) => {
    try {
        const { policy_id, applicability_rules } = req.body;
        const user_id = req.user?.id;

        if (!policy_id || !applicability_rules || !Array.isArray(applicability_rules)) {
            return res.status(400).json({
                success: false,
                message: 'policy_id and applicability_rules (array) are required'
            });
        }

        const rules = await adminPolicyService.setPolicyApplicability(policy_id, applicability_rules, user_id);

        res.status(200).json({
            success: true,
            message: 'Policy applicability set successfully',
            data: rules
        });
    } catch (error) {
        console.error('Error setting policy applicability:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to set policy applicability'
        });
    }
};

/**
 * Get policy applicability
 * POST /api/admin/policy/applicability/get
 */
const getPolicyApplicability = async (req, res) => {
    try {
        const { policy_id } = req.body;

        if (!policy_id) {
            return res.status(400).json({
                success: false,
                message: 'policy_id is required'
            });
        }

        const rules = await adminPolicyService.getPolicyApplicability(policy_id);

        res.status(200).json({
            success: true,
            data: rules
        });
    } catch (error) {
        console.error('Error fetching policy applicability:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch policy applicability'
        });
    }
};

// =====================================================
// POLICY ASSIGNMENT CONTROLLERS
// =====================================================

/**
 * Assign policy to employees
 * POST /api/admin/policy/assign
 */
const assignPolicyToEmployees = async (req, res) => {
    try {
        const { policy_id } = req.body;
        const user_id = req.user?.id;

        if (!policy_id) {
            return res.status(400).json({
                success: false,
                message: 'policy_id is required'
            });
        }

        const result = await adminPolicyService.assignPolicyToEmployees(policy_id, user_id);

        res.status(200).json({
            success: true,
            message: result.message,
            data: { count: result.count }
        });
    } catch (error) {
        console.error('Error assigning policy:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to assign policy'
        });
    }
};

// =====================================================
// ANALYTICS & REPORTS CONTROLLERS
// =====================================================

/**
 * Get policy acknowledgment statistics
 * POST /api/admin/policy/analytics/stats
 */
const getPolicyAcknowledgmentStats = async (req, res) => {
    try {
        const { policy_id } = req.body;

        if (!policy_id) {
            return res.status(400).json({
                success: false,
                message: 'policy_id is required'
            });
        }

        const stats = await adminPolicyService.getPolicyAcknowledgmentStats(policy_id);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching policy stats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch policy stats'
        });
    }
};

/**
 * Get employees with pending acknowledgments
 * POST /api/admin/policy/analytics/pending-employees
 */
const getEmployeesWithPendingAcknowledgments = async (req, res) => {
    try {
        const { policy_id, page, limit } = req.body;

        if (!policy_id) {
            return res.status(400).json({
                success: false,
                message: 'policy_id is required'
            });
        }

        const result = await adminPolicyService.getEmployeesWithPendingAcknowledgments(policy_id, page, limit);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching pending employees:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch pending employees'
        });
    }
};

/**
 * Send manual reminder
 * POST /api/admin/policy/send-reminder
 */
const sendManualReminder = async (req, res) => {
    try {
        const { acknowledgment_id } = req.body;
        const user_id = req.user?.id;

        if (!acknowledgment_id) {
            return res.status(400).json({
                success: false,
                message: 'acknowledgment_id is required'
            });
        }

        const result = await adminPolicyService.sendManualReminder(acknowledgment_id, user_id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error sending reminder:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send reminder'
        });
    }
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
