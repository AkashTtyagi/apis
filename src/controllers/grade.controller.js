/**
 * Grade Controller
 * Handles HTTP requests for grade operations
 */

const gradeService = require('../services/grade.service');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Create grade
 * POST /api/grades/create
 */
const createGrade = async (req, res, next) => {
    try {
        const { company_id, grade_code, grade_name, description, level } = req.body;
        const user_id = req.user.id;

        const grade = await gradeService.createGrade({
            company_id,
            grade_code,
            grade_name,
            description,
            level,
            user_id
        });

        return sendCreated(res, 'Grade created successfully', { grade });
    } catch (error) {
        next(error);
    }
};

/**
 * Update grade
 * Handles update, activate, and deactivate operations
 * POST /api/grades/update
 */
const updateGrade = async (req, res, next) => {
    try {
        const { grade_id, grade_code, grade_name, description, level, is_active } = req.body;
        const user_id = req.user.id;

        const result = await gradeService.updateGrade(grade_id, {
            grade_code,
            grade_name,
            description,
            level,
            is_active,
            user_id
        });

        return sendSuccess(res, 'Grade updated successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get grades by company
 * POST /api/grades/list
 */
const getGradesByCompany = async (req, res, next) => {
    try {
        const { company_id } = req.body;
        const activeOnly = req.body.activeOnly !== false;

        const grades = await gradeService.getGradesByCompany(company_id, activeOnly);

        return sendSuccess(res, 'Grades retrieved successfully', { grades });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createGrade,
    updateGrade,
    getGradesByCompany
};
