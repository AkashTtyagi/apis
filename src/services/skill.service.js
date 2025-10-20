/**
 * Skill Service
 */

const { HrmsCompanySkills } = require('../models/HrmsCompanySkills');
const { HrmsStatutorySkillsMaster } = require('../models/HrmsStatutorySkillsMaster');
const { sequelize } = require('../utils/database');

const createSkill = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const skill = await HrmsCompanySkills.create(data, { transaction });
        await transaction.commit();
        return skill;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateSkill = async (id, company_id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const skill = await HrmsCompanySkills.findOne({
            where: { id, company_id },
            transaction
        });

        if (!skill) {
            throw new Error('Skill not found');
        }

        await skill.update(data, { transaction });
        await transaction.commit();
        return skill;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getSkills = async (company_id, filters = {}) => {
    const whereClause = { company_id };

    if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    if (filters.search) {
        whereClause[sequelize.Sequelize.Op.or] = [
            { skill_code: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } },
            { skill_name: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } }
        ];
    }

    if (filters.skill_category) {
        whereClause.skill_category = filters.skill_category;
    }

    if (filters.id) {
        whereClause.id = filters.id;
    }

    const skills = await HrmsCompanySkills.findAll({
        where: whereClause,
        include: [
            {
                model: HrmsStatutorySkillsMaster,
                as: 'statutorySkill',
                attributes: ['id', 'skill_code', 'skill_name'],
                required: false
            }
        ],
        order: [
            ['display_order', 'ASC'],
            ['skill_name', 'ASC']
        ]
    });

    return skills;
};

module.exports = {
    createSkill,
    updateSkill,
    getSkills
};
