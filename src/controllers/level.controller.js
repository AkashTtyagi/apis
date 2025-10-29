/**
 * Level Controller
 * Handles HTTP requests for level operations
 */

const levelService = require('../services/level.service');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Create level
 * POST /api/levels/create
 */
const createLevel = async (req, res, next) => {
    try {
        const {  level_code, level_name, description, hierarchy_order, is_active } = req.body;
        const user_id = req.user.id;
        const company_id = req.user.company_id;

        const level = await levelService.createLevel({
            company_id,
            level_code,
            level_name,
            description,
            hierarchy_order,
            is_active,
            user_id
        });

        return sendCreated(res, 'Level created successfully', level);
    } catch (error) {
        next(error);
    }
};

/**
 * Update level
 * Handles update, activate, and deactivate operations
 * POST /api/levels/update
 */
const updateLevel = async (req, res, next) => {
    try {
        const { level_id, level_code, level_name, description, hierarchy_order, is_active } = req.body;
        const user_id = req.user.id;

        const result = await levelService.updateLevel(level_id, {
            level_code,
            level_name,
            description,
            hierarchy_order,
            is_active,
            user_id
        });

        return sendSuccess(res, 'Level updated successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get levels by company
 * POST /api/levels/list
 */
const getLevelsByCompany = async (req, res, next) => {
    try {
        const company_id = req.user.company_id;
        const { is_active, search } = req.body;

        const filters = {
            is_active,
            search
        };

        const levels = await levelService.getLevelsByCompany(company_id, filters);

        return sendSuccess(res, 'Levels retrieved successfully',levels);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLevel,
    updateLevel,
    getLevelsByCompany
};
