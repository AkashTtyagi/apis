/**
 * Company Designation Service
 * Handles designation operations for companies
 */

const { HrmsCompanyDesignation } = require('../models/HrmsCompanyDesignation');

/**
 * Create company designation
 *
 * @param {Object} designationData - Designation data
 * @returns {Object} Created designation
 */
const createDesignation = async (designationData) => {
    const {
        company_id,
        designation_master_id,
        designation_code,
        designation_name,
        min_experience_years,
        max_experience_years,
        min_annual_salary,
        max_annual_salary,
        job_function,
        grade_id,
        skill_id,
        job_description,
        user_id
    } = designationData;

    const designation = await HrmsCompanyDesignation.create({
        company_id,
        designation_master_id: designation_master_id || null,
        designation_code,
        designation_name,
        min_experience_years: min_experience_years || null,
        max_experience_years: max_experience_years || null,
        min_annual_salary: min_annual_salary || null,
        max_annual_salary: max_annual_salary || null,
        job_function: job_function || null,
        grade_id: grade_id || null,
        skill_id: skill_id || null,
        job_description: job_description || null,
        is_active: true,
        created_by: user_id || null
    });

    return designation;
};

/**
 * Update company designation
 * Handles update, activate, and deactivate operations
 *
 * @param {number} designation_id - Designation ID
 * @param {Object} updateData - Update data
 * @returns {Object} Update result
 */
const updateDesignation = async (designation_id, updateData) => {
    const {
        designation_code,
        designation_name,
        min_experience_years,
        max_experience_years,
        min_annual_salary,
        max_annual_salary,
        job_function,
        grade_id,
        skill_id,
        job_description,
        is_active,
        user_id
    } = updateData;

    const [updatedRows] = await HrmsCompanyDesignation.update(
        {
            ...(designation_code !== undefined && { designation_code }),
            ...(designation_name !== undefined && { designation_name }),
            ...(min_experience_years !== undefined && { min_experience_years }),
            ...(max_experience_years !== undefined && { max_experience_years }),
            ...(min_annual_salary !== undefined && { min_annual_salary }),
            ...(max_annual_salary !== undefined && { max_annual_salary }),
            ...(job_function !== undefined && { job_function }),
            ...(grade_id !== undefined && { grade_id }),
            ...(skill_id !== undefined && { skill_id }),
            ...(job_description !== undefined && { job_description }),
            ...(is_active !== undefined && { is_active }),
            updated_by: user_id || null
        },
        {
            where: {
                id: designation_id
            }
        }
    );

    if (updatedRows === 0) {
        throw new Error('Designation not found');
    }

    return { updatedRows };
};

/**
 * Get designations by company
 *
 * @param {number} company_id - Company ID
 * @param {boolean} activeOnly - Get only active designations
 * @returns {Array} List of designations
 */
const getDesignationsByCompany = async (company_id, activeOnly = true) => {
    const whereClause = {
        company_id
    };

    if (activeOnly) {
        whereClause.is_active = true;
    }

    const designations = await HrmsCompanyDesignation.findAll({
        where: whereClause,
        attributes: [
            'id',
            'company_id',
            'designation_master_id',
            'designation_code',
            'designation_name',
            'min_experience_years',
            'max_experience_years',
            'min_annual_salary',
            'max_annual_salary',
            'job_function',
            'grade_id',
            'skill_id',
            'job_description',
            'is_active',
            'display_order',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at'
        ],
        order: [['display_order', 'ASC'], ['designation_name', 'ASC']],
        raw: true
    });

    return designations;
};

module.exports = {
    createDesignation,
    updateDesignation,
    getDesignationsByCompany
};
