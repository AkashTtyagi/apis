/**
 * Level Service
 * Handles level operations for companies
 */

const { HrmsLevel } = require('../models/HrmsLevel');

/**
 * Create level
 *
 * @param {Object} levelData - Level data
 * @returns {Object} Created level
 */
const createLevel = async (levelData) => {
    const { company_id, level_code, level_name, description, hierarchy_order, user_id } = levelData;

    const level = await HrmsLevel.create({
        company_id,
        level_code,
        level_name,
        description: description || null,
        hierarchy_order: hierarchy_order || 0,
        is_active: true,
        created_by: user_id || null
    });

    return level;
};

/**
 * Update level
 * Handles update, activate, and deactivate operations
 *
 * @param {number} level_id - Level ID
 * @param {Object} updateData - Update data
 * @returns {Object} Update result
 */
const updateLevel = async (level_id, updateData) => {
    const { level_code, level_name, description, hierarchy_order, is_active, user_id } = updateData;

    const [updatedRows] = await HrmsLevel.update(
        {
            ...(level_code !== undefined && { level_code }),
            ...(level_name !== undefined && { level_name }),
            ...(description !== undefined && { description }),
            ...(hierarchy_order !== undefined && { hierarchy_order }),
            ...(is_active !== undefined && { is_active }),
            updated_by: user_id || null
        },
        {
            where: {
                id: level_id
            }
        }
    );

    if (updatedRows === 0) {
        throw new Error('Level not found');
    }

    return { updatedRows };
};

/**
 * Get levels by company
 *
 * @param {number} company_id - Company ID
 * @param {boolean} activeOnly - Get only active levels
 * @returns {Array} List of levels
 */
const getLevelsByCompany = async (company_id, activeOnly = true) => {
    const whereClause = {
        company_id
    };

    if (activeOnly) {
        whereClause.is_active = true;
    }

    const levels = await HrmsLevel.findAll({
        where: whereClause,
        order: [['hierarchy_order', 'ASC'], ['level_name', 'ASC']],
        raw: true
    });

    return levels;
};

module.exports = {
    createLevel,
    updateLevel,
    getLevelsByCompany
};
