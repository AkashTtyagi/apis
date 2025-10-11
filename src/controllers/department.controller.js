/**
 * Sub-Department Controller
 * Handles HTTP requests for sub-department operations
 */

const departmentService = require('../services/department.service');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Create sub-department
 * POST /api/sub-departments/create
 */
const createSubDepartment = async (req, res, next) => {
    try {
        const { org_dept_id, sub_department_name, sub_department_code, description, head_id } = req.body;
        const user_id = req.user.id;

        const subDepartment = await departmentService.createSubDepartment({
            org_dept_id,
            sub_department_name,
            sub_department_code,
            description,
            head_id,
            user_id
        });

        return sendCreated(res, 'Sub-department created successfully', { subDepartment });
    } catch (error) {
        next(error);
    }
};

/**
 * Update sub-department
 * Handles update, activate, and deactivate operations
 * POST /api/sub-departments/update
 */
const updateSubDepartment = async (req, res, next) => {
    try {
        const { sub_department_id, sub_department_name, sub_department_code, description, head_id, is_active } = req.body;
        const user_id = req.user.id;

        const result = await departmentService.updateSubDepartment(sub_department_id, {
            sub_department_name,
            sub_department_code,
            description,
            head_id,
            is_active,
            user_id
        });

        return sendSuccess(res, 'Sub-department updated successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get sub-departments by org department
 * POST /api/sub-departments/list
 */
const getSubDepartmentsByOrgDepartment = async (req, res, next) => {
    try {
        const { org_dept_id } = req.body;
        const activeOnly = req.body.activeOnly !== false;

        const subDepartments = await departmentService.getSubDepartmentsByOrgDepartment(org_dept_id, activeOnly);

        return sendSuccess(res, 'Sub-departments retrieved successfully', { subDepartments });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSubDepartment,
    updateSubDepartment,
    getSubDepartmentsByOrgDepartment
};
