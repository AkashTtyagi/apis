/**
 * Organization Department Controller
 * Handles HTTP requests for organization department mapping operations
 */

const orgDepartmentService = require('../services/orgDepartment.service');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Create organization department mapping
 * POST /api/departments/create
 */
const createOrgDepartment = async (req, res, next) => {
    try {
        const { department_id, company_department_name, department_head_id } = req.body;
        const user_id = req.user.id;
        const org_id = req.user.company_id;

        const orgDepartment = await orgDepartmentService.createOrgDepartment({
            org_id,
            department_id,
            company_department_name,
            department_head_id,
            user_id
        });

        const message = company_department_name
            ? 'Custom department created successfully'
            : 'Department assigned to organization successfully';

        return sendCreated(res, message, { orgDepartment });
    } catch (error) {
        next(error);
    }
};

/**
 * Update organization department mapping
 * Handles update, activate, and deactivate operations
 * POST /api/departments/update
 */
const updateOrgDepartment = async (req, res, next) => {
    try {
        const { org_dept_id, department_head_id, is_active } = req.body;
        const user_id = req.user.id;

        const result = await orgDepartmentService.updateOrgDepartment(org_dept_id, {
            department_head_id,
            is_active,
            user_id
        });

        return sendSuccess(res, 'Organization department updated successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all organization departments
 * POST /api/departments/list
 */
const getOrgDepartments = async (req, res, next) => {
    try {
        const companyId = req.user.company_id;
        const { activeOnly } = req.body;

        const orgDepartments = await orgDepartmentService.getOrgDepartments(companyId, activeOnly !== false);

        return sendSuccess(res, 'Organization departments retrieved successfully', { departments: orgDepartments });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrgDepartment,
    updateOrgDepartment,
    getOrgDepartments
};
