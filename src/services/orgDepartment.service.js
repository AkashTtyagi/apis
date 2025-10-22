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
    const { org_id, department_id, company_department_name, department_head_id, user_id } = departmentData;

    // Validate: Either department_id OR company_department_name must be provided
    if (!department_id && !company_department_name) {
        throw new Error('Either department_id (for master) or company_department_name (for custom) is required');
    }

    if (department_id && company_department_name) {
        throw new Error('Provide either department_id OR company_department_name, not both');
    }

    // Check if mapping already exists
    const whereClause = { org_id };

    if (department_id) {
        whereClause.department_id = department_id;
    } else {
        whereClause.company_department_name = company_department_name;
    }

    const existing = await HrmsCompanyDepartments.findOne({
        where: whereClause,
        raw: true
    });

    if (existing) {
        const deptName = department_id ? 'This department' : company_department_name;
        throw new Error(`${deptName} is already assigned to the organization`);
    }

    const orgDepartment = await HrmsCompanyDepartments.create({
        org_id,
        department_id: department_id || null,
        company_department_name: company_department_name || null,
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
                attributes: ['department_id', 'department_name', 'department_code', 'description'],
                required: false  // LEFT JOIN - because custom departments won't have master
            }
        ],
        order: [['id', 'ASC']],
        raw: false,
        nest: true
    });

    // Format response: Use company_department_name if present, else use master department name
    const formattedDepartments = orgDepartments.map(dept => {
        const deptObj = dept.toJSON();

        return {
            id: deptObj.id,
            company_id: deptObj.company_id,
            department_id: deptObj.department_id,
            department_name: deptObj.company_department_name || deptObj.department?.department_name || null,
            department_code: deptObj.department?.department_code || null,
            description: deptObj.department?.description || null,
            is_custom: deptObj.company_department_name ? true : false,
            department_head_id: deptObj.department_head_id,
            is_active: deptObj.is_active,
            created_at: deptObj.created_at,
            updated_at: deptObj.updated_at
        };
    });

    return formattedDepartments;
};

module.exports = {
    createOrgDepartment,
    updateOrgDepartment,
    getOrgDepartments
};
