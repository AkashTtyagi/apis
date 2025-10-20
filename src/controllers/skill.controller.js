/**
 * Skill Controller
 */

const skillService = require('../services/skill.service');

/**
 * Create skill
 */
const createSkill = async (req, res) => {
    try {
        const { company_id } = req.user;
        const data = {
            ...req.body,
            company_id,
            created_by: req.user.id
        };

        const skill = await skillService.createSkill(data);

        res.status(201).json({
            success: true,
            message: 'Skill created successfully',
            data: skill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create skill',
            error: error.message
        });
    }
};

/**
 * Update skill
 */
const updateSkill = async (req, res) => {
    try {
        const { skill_id } = req.body;
        const { company_id } = req.user;
        const data = {
            ...req.body,
            updated_by: req.user.id
        };

        if (!skill_id) {
            return res.status(400).json({
                success: false,
                message: 'skill_id is required'
            });
        }

        const skill = await skillService.updateSkill(skill_id, company_id, data);

        res.status(200).json({
            success: true,
            message: 'Skill updated successfully',
            data: skill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update skill',
            error: error.message
        });
    }
};

/**
 * Get skill list
 */
const getSkillsByCompany = async (req, res) => {
    try {
        const { company_id } = req.user;
        const filters = {
            is_active: req.body.is_active,
            search: req.body.search,
            skill_category: req.body.skill_category,
            id: req.body.id
        };

        const skills = await skillService.getSkills(company_id, filters);

        res.status(200).json({
            success: true,
            message: 'Skills retrieved successfully',
            data: skills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve skills',
            error: error.message
        });
    }
};

module.exports = {
    createSkill,
    updateSkill,
    getSkillsByCompany
};
