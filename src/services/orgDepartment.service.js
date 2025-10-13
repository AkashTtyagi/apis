/**
 * Organization Department Service
 * Handles operations for HrmsCompanyDepartments (department mappings)
 */

const { HrmsCompanyDepartments } = require('../models/HrmsCompanyDepartments');
const { HrmsDepartmentMaster } = require('../models/HrmsDepartmentMaster');

/**
 * Create organization department mapping
 *
 * @param {Object} departmentData - Department mapping data
 * @returns {Object} Created department mapping
 */
const createOrgDepartment = async (departmentData) => {
    const { org_id, department_id, department_head_id, user_id } = departmentData;

    // Check if mapping already exists
    const existing = await HrmsCompanyDepartments.findOne({
        where: {
            org_id,
            department_id
        },
        raw: true
    });

    if (existing) {
        throw new Error('This department is already assigned to the organization');
    }

    const orgDepartment = await HrmsCompanyDepartments.create({
        org_id,
        department_id,
        department_head_id: department_head_id || null,
        is_active: true,
        created_by: user_id || null
    });

    return orgDepartment;
};

/**
 * Update organization department mapping
 * Handles update, activate, and deactivate operations
 *
 * @param {number} org_dept_id - Organization Department ID
 * @param {Object} updateData - Update data
 * @returns {Object} Update result
 */
const updateOrgDepartment = async (org_dept_id, updateData) => {
    const { department_head_id, is_active, user_id } = updateData;

    const [updatedRows] = await HrmsCompanyDepartments.update(
        {
            ...(department_head_id !== undefined && { department_head_id }),
            ...(is_active !== undefined && { is_active }),
            updated_by: user_id || null
        },
        {
            where: {
                id: org_dept_id
            }
        }
    );

    if (updatedRows === 0) {
        throw new Error('Organization department not found');
    }

    return { updatedRows };
};

/**
 * Get all organization departments
 *
 * @param {number} org_id - Organization ID
 * @param {boolean} activeOnly - Get only active departments
 * @returns {Array} List of organization departments with details
 */
const getOrgDepartments = async (org_id, activeOnly = true) => {
    const whereClause = { org_id };

    if (activeOnly) {
        whereClause.is_active = true;
    }

    const orgDepartments = await HrmsCompanyDepartments.findAll({
        where: whereClause,
        include: [
            {
                model: HrmsDepartmentMaster,
                as: 'department',
                attributes: ['department_id', 'department_name', 'department_code', 'description']
            }
        ],
        order: [['id', 'ASC']],
        raw: false,
        nest: true
    });

    return orgDepartments;
};

module.exports = {
    createOrgDepartment,
    updateOrgDepartment,
    getOrgDepartments
};
