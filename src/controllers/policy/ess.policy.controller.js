/**
 * ESS Policy Controller
 * Handles HTTP requests for policy management by employees (Employee Self Service)
 */

const essPolicyService = require('../../services/policy/ess.policy.service');

// =====================================================
// EMPLOYEE POLICY VIEWING CONTROLLERS
// =====================================================

/**
 * Get employee's assigned policies (all)
 * POST /api/ess/policy/list
 */
const getEmployeeAssignedPolicies = async (req, res) => {
    try {
        const { employee_id, category_id, is_acknowledged, page, limit } = req.body;

        if (!employee_id) {
            return res.status(400).json({
                success: false,
                message: 'employee_id is required'
            });
        }

        const result = await essPolicyService.getEmployeeAssignedPolicies(employee_id, {
            category_id,
            is_acknowledged,
            page,
            limit
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching assigned policies:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch assigned policies'
        });
    }
};

/**
 * Get employee's pending policies (not acknowledged)
 * POST /api/ess/policy/pending
 */
const getEmployeePendingPolicies = async (req, res) => {
    try {
        const { employee_id } = req.body;

        if (!employee_id) {
            return res.status(400).json({
                success: false,
                message: 'employee_id is required'
            });
        }

        const policies = await essPolicyService.getEmployeePendingPolicies(employee_id);

        res.status(200).json({
            success: true,
            data: policies
        });
    } catch (error) {
        console.error('Error fetching pending policies:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch pending policies'
        });
    }
};

/**
 * Get employee's acknowledged policies
 * POST /api/ess/policy/acknowledged
 */
const getEmployeeAcknowledgedPolicies = async (req, res) => {
    try {
        const { employee_id, page, limit } = req.body;

        if (!employee_id) {
            return res.status(400).json({
                success: false,
                message: 'employee_id is required'
            });
        }

        const result = await essPolicyService.getEmployeeAcknowledgedPolicies(employee_id, page, limit);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching acknowledged policies:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch acknowledged policies'
        });
    }
};

/**
 * Get single policy details for employee
 * POST /api/ess/policy/details
 */
const getEmployeePolicyDetails = async (req, res) => {
    try {
        const { employee_id, acknowledgment_id } = req.body;

        if (!employee_id || !acknowledgment_id) {
            return res.status(400).json({
                success: false,
                message: 'employee_id and acknowledgment_id are required'
            });
        }

        const policy = await essPolicyService.getEmployeePolicyDetails(employee_id, acknowledgment_id);

        res.status(200).json({
            success: true,
            data: policy
        });
    } catch (error) {
        console.error('Error fetching policy details:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch policy details'
        });
    }
};

// =====================================================
// POLICY ACKNOWLEDGMENT CONTROLLERS
// =====================================================

/**
 * Acknowledge policy by employee
 * POST /api/ess/policy/acknowledge
 */
const acknowledgePolicyByEmployee = async (req, res) => {
    try {
        const { acknowledgment_id, employee_id, acknowledgment_comments } = req.body;
        const ip_address = req.ip || req.connection.remoteAddress;
        const user_agent = req.headers['user-agent'];

        if (!acknowledgment_id || !employee_id) {
            return res.status(400).json({
                success: false,
                message: 'acknowledgment_id and employee_id are required'
            });
        }

        const acknowledgment = await essPolicyService.acknowledgePolicyByEmployee({
            acknowledgment_id,
            employee_id,
            acknowledgment_comments,
            ip_address,
            user_agent
        });

        res.status(200).json({
            success: true,
            message: 'Policy acknowledged successfully',
            data: acknowledgment
        });
    } catch (error) {
        console.error('Error acknowledging policy:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to acknowledge policy'
        });
    }
};

// =====================================================
// ESS ACCESS CHECKING CONTROLLERS
// =====================================================

/**
 * Check if employee ESS is blocked
 * POST /api/ess/policy/check-block
 */
const checkEmployeeESSBlocked = async (req, res) => {
    try {
        const { employee_id } = req.body;

        if (!employee_id) {
            return res.status(400).json({
                success: false,
                message: 'employee_id is required'
            });
        }

        const result = await essPolicyService.checkEmployeeESSBlocked(employee_id);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error checking ESS block status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to check ESS block status'
        });
    }
};

/**
 * Get employee's ESS access summary
 * POST /api/ess/policy/access-summary
 */
const getEmployeeESSAccessSummary = async (req, res) => {
    try {
        const { employee_id } = req.body;

        if (!employee_id) {
            return res.status(400).json({
                success: false,
                message: 'employee_id is required'
            });
        }

        const summary = await essPolicyService.getEmployeeESSAccessSummary(employee_id);

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error fetching ESS access summary:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch ESS access summary'
        });
    }
};

// =====================================================
// POLICY CATEGORIES CONTROLLERS (ESS VIEW)
// =====================================================

/**
 * Get active policy categories
 * POST /api/ess/policy/categories/list
 */
const getActivePolicyCategories = async (req, res) => {
    try {
        const { company_id } = req.body;

        if (!company_id) {
            return res.status(400).json({
                success: false,
                message: 'company_id is required'
            });
        }

        const categories = await essPolicyService.getActivePolicyCategories(company_id);

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching policy categories:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch policy categories'
        });
    }
};

module.exports = {
    // Policy viewing
    getEmployeeAssignedPolicies,
    getEmployeePendingPolicies,
    getEmployeeAcknowledgedPolicies,
    getEmployeePolicyDetails,

    // Acknowledgment
    acknowledgePolicyByEmployee,

    // ESS access
    checkEmployeeESSBlocked,
    getEmployeeESSAccessSummary,

    // Categories
    getActivePolicyCategories
};
