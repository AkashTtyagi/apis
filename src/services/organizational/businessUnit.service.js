/**
 * Business Unit Service
 */

const { HrmsBusinessUnitMaster } = require('../../models/HrmsBusinessUnitMaster');
const { HrmsDivisionMaster } = require('../../models/HrmsDivisionMaster');
const { HrmsCostCenterMaster } = require('../../models/HrmsCostCenterMaster');
const { sequelize } = require('../../utils/database');

const createBusinessUnit = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const businessUnit = await HrmsBusinessUnitMaster.create(data, { transaction });
        await transaction.commit();
        return businessUnit;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateBusinessUnit = async (id, company_id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const businessUnit = await HrmsBusinessUnitMaster.findOne({
            where: { id, company_id },
            transaction
        });

        if (!businessUnit) {
            throw new Error('Business unit not found');
        }

        await businessUnit.update(data, { transaction });
        await transaction.commit();
        return businessUnit;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getBusinessUnits = async (company_id, filters = {}) => {
    const whereClause = { company_id };

    if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    if (filters.search) {
        whereClause[sequelize.Sequelize.Op.or] = [
            { business_unit_code: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } },
            { business_unit_name: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } }
        ];
    }

    if (filters.division_id) {
        whereClause.division_id = filters.division_id;
    }

    if (filters.id) {
        whereClause.id = filters.id;
    }

    const businessUnits = await HrmsBusinessUnitMaster.findAll({
        where: whereClause,
        include: [
            {
                model: HrmsDivisionMaster,
                as: 'division',
                attributes: ['id', 'division_code', 'division_name'],
                required: false
            },
            {
                model: HrmsCostCenterMaster,
                as: 'costCenter',
                attributes: ['id', 'cost_center_code', 'cost_center_name'],
                required: false
            }
        ],
        order: [
            ['display_order', 'ASC'],
            ['business_unit_name', 'ASC']
        ]
    });

    return businessUnits;
};

module.exports = {
    createBusinessUnit,
    updateBusinessUnit,
    getBusinessUnits
};
