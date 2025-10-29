/**
 * Grade Service
 * Handles grade operations for companies
 */

const { HrmsGrade } = require('../models/HrmsGrade');

/**
 * Create grade
 *
 * @param {Object} gradeData - Grade data
 * @returns {Object} Created grade
 */
const createGrade = async (gradeData) => {
    const { company_id, grade_code, grade_name, description, level, is_active, user_id } = gradeData;

    const grade = await HrmsGrade.create({
        company_id,
        grade_code,
        grade_name,
        description: description || null,
        level: level || 0,
        is_active: is_active !== undefined ? is_active : true,
        created_by: user_id || null
    });

    return grade;
};

/**
 * Update grade
 * Handles update, activate, and deactivate operations
 *
 * @param {number} grade_id - Grade ID
 * @param {number} company_id - Company ID (for security check)
 * @param {Object} updateData - Update data
 * @returns {Object} Update result
 */
const updateGrade = async (grade_id, company_id, updateData) => {
    const { grade_code, grade_name, description, level, is_active, user_id } = updateData;

    const [updatedRows] = await HrmsGrade.update(
        {
            ...(grade_code !== undefined && { grade_code }),
            ...(grade_name !== undefined && { grade_name }),
            ...(description !== undefined && { description }),
            ...(level !== undefined && { level }),
            ...(is_active !== undefined && { is_active }),
            updated_by: user_id || null
        },
        {
            where: {
                id: grade_id,
                company_id: company_id  // Ensure user can only update their company's grades
            }
        }
    );

    if (updatedRows === 0) {
        throw new Error('Grade not found or you do not have permission to update it');
    }

    return { updatedRows };
};

/**
 * Get grades by company
 *
 * @param {number} company_id - Company ID
 * @param {boolean} activeOnly - Get only active grades
 * @returns {Array} List of grades
 */
const getGradesByCompany = async (company_id, filters = {}) => {
    const { Op } = require('sequelize');
    const whereClause = {
        company_id
    };

    // If is_active is explicitly true or false, filter by it
    // If is_active is null/undefined, return both active and inactive
    if (filters.is_active !== null && filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    // Search in grade_code or grade_name
    if (filters.search) {
        whereClause[Op.or] = [
            { grade_code: { [Op.like]: `%${filters.search}%` } },
            { grade_name: { [Op.like]: `%${filters.search}%` } }
        ];
    }

    const grades = await HrmsGrade.findAll({
        where: whereClause,
        order: [['display_order', 'ASC'], ['grade_name', 'ASC']],
        raw: true
    });

    return grades;
};

module.exports = {
    createGrade,
    updateGrade,
    getGradesByCompany
};
