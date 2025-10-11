/**
 * Sub-Department Service
 * Handles sub-department operations for organization departments
 */

const { HrmsSubDepartment } = require('../models/HrmsSubDepartment');

/**
 * Create sub-department
 *
 * @param {Object} subDepartmentData - Sub-department data
 * @returns {Object} Created sub-department
 */
const createSubDepartment = async (subDepartmentData) => {
    const { org_dept_id, sub_department_name, sub_department_code, description, head_id, user_id } = subDepartmentData;

    const subDepartment = await HrmsSubDepartment.create({
        org_dept_id,
        sub_department_name,
        sub_department_code: sub_department_code || null,
        description: description || null,
        head_id: head_id || null,
        is_active: true,
        created_by: user_id || null
    });

    return subDepartment;
};

/**
 * Update sub-department
 * Handles update, activate, and deactivate operations
 *
 * @param {number} sub_department_id - Sub-department ID
 * @param {Object} updateData - Update data
 * @returns {Object} Update result
 */
const updateSubDepartment = async (sub_department_id, updateData) => {
    const { sub_department_name, sub_department_code, description, head_id, is_active, user_id } = updateData;

    const [updatedRows] = await HrmsSubDepartment.update(
        {
            ...(sub_department_name !== undefined && { sub_department_name }),
            ...(sub_department_code !== undefined && { sub_department_code }),
            ...(description !== undefined && { description }),
            ...(head_id !== undefined && { head_id }),
            ...(is_active !== undefined && { is_active }),
            updated_by: user_id || null
        },
        {
            where: {
                id: sub_department_id
            }
        }
    );

    if (updatedRows === 0) {
        throw new Error('Sub-department not found');
    }

    return { updatedRows };
};

/**
 * Get sub-departments by org department
 *
 * @param {number} org_dept_id - Organization Department ID
 * @param {boolean} activeOnly - Get only active sub-departments
 * @returns {Array} List of sub-departments
 */
const getSubDepartmentsByOrgDepartment = async (org_dept_id, activeOnly = true) => {
    const whereClause = {
        org_dept_id
    };

    if (activeOnly) {
        whereClause.is_active = true;
    }

    const subDepartments = await HrmsSubDepartment.findAll({
        where: whereClause,
        order: [['sub_department_name', 'ASC']],
        raw: true
    });

    return subDepartments;
};

module.exports = {
    createSubDepartment,
    updateSubDepartment,
    getSubDepartmentsByOrgDepartment
};
