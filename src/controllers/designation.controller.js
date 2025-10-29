/**
 * Company Designation Controller
 * Handles HTTP requests for designation operations
 */

const designationService = require('../services/designation.service');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Create designation
 * POST /api/designations/create
 */
const createDesignation = async (req, res, next) => {
    try {
        const {
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
            job_description
        } = req.body;
        const company_id = req.user.company_id;
        const user_id = req.user.id;

        const designation = await designationService.createDesignation({
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
        });

        return sendCreated(res, 'Designation created successfully', { designation });
    } catch (error) {
        next(error);
    }
};

/**
 * Update designation
 * Handles update, activate, and deactivate operations
 * POST /api/designations/update
 */
const updateDesignation = async (req, res, next) => {
    try {
        const {
            designation_id,
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
            is_active
        } = req.body;
        const user_id = req.user.id;

        const result = await designationService.updateDesignation(designation_id, {
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
        });

        return sendSuccess(res, 'Designation updated successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get designations by company
 * POST /api/designations/list
 */
const getDesignationsByCompany = async (req, res, next) => {
    try {
        const company_id = req.user.company_id;
        const activeOnly = req.body.activeOnly !== false;

        const designations = await designationService.getDesignationsByCompany(company_id, activeOnly);

        return sendSuccess(res, 'Designations retrieved successfully', { designations });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createDesignation,
    updateDesignation,
    getDesignationsByCompany
};
