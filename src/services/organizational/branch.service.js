/**
 * Branch Service
 */

const { HrmsBranchMaster } = require('../../models/HrmsBranchMaster');
const { HrmsRegionMaster } = require('../../models/HrmsRegionMaster');
const { HrmsZoneMaster } = require('../../models/HrmsZoneMaster');
const { HrmsBusinessUnitMaster } = require('../../models/HrmsBusinessUnitMaster');
const { HrmsChannelMaster } = require('../../models/HrmsChannelMaster');
const { HrmsCostCenterMaster } = require('../../models/HrmsCostCenterMaster');
const { HrmsCountryMaster } = require('../../models/HrmsCountryMaster');
const { HrmsStateMaster } = require('../../models/HrmsStateMaster');
const { HrmsCityMaster } = require('../../models/HrmsCityMaster');
const { sequelize } = require('../../utils/database');

const createBranch = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const branch = await HrmsBranchMaster.create(data, { transaction });
        await transaction.commit();
        return branch;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateBranch = async (id, company_id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const branch = await HrmsBranchMaster.findOne({
            where: { id, company_id },
            transaction
        });

        if (!branch) {
            throw new Error('Branch not found');
        }

        await branch.update(data, { transaction });
        await transaction.commit();
        return branch;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getBranches = async (company_id, filters = {}) => {
    const whereClause = { company_id };

    if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    if (filters.search) {
        whereClause[sequelize.Sequelize.Op.or] = [
            { branch_code: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } },
            { branch_name: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } }
        ];
    }

    if (filters.branch_type) {
        whereClause.branch_type = filters.branch_type;
    }

    if (filters.region_id) {
        whereClause.region_id = filters.region_id;
    }

    if (filters.zone_id) {
        whereClause.zone_id = filters.zone_id;
    }

    if (filters.id) {
        whereClause.id = filters.id;
    }

    const branches = await HrmsBranchMaster.findAll({
        where: whereClause,
        include: [
            {
                model: HrmsRegionMaster,
                as: 'region',
                attributes: ['id', 'region_code', 'region_name'],
                required: false
            },
            {
                model: HrmsZoneMaster,
                as: 'zone',
                attributes: ['id', 'zone_code', 'zone_name'],
                required: false
            },
            {
                model: HrmsBusinessUnitMaster,
                as: 'businessUnit',
                attributes: ['id', 'business_unit_code', 'business_unit_name'],
                required: false
            },
            {
                model: HrmsChannelMaster,
                as: 'channel',
                attributes: ['id', 'channel_code', 'channel_name'],
                required: false
            },
            {
                model: HrmsCostCenterMaster,
                as: 'costCenter',
                attributes: ['id', 'cost_center_code', 'cost_center_name'],
                required: false
            },
            {
                model: HrmsCountryMaster,
                as: 'country',
                attributes: ['id', 'country_name', 'country_code'],
                required: false
            },
            {
                model: HrmsStateMaster,
                as: 'state',
                attributes: ['id', 'state_name', 'state_code'],
                required: false
            },
            {
                model: HrmsCityMaster,
                as: 'city',
                attributes: ['id', 'city_name'],
                required: false
            }
        ],
        order: [
            ['display_order', 'ASC'],
            ['branch_name', 'ASC']
        ]
    });

    return branches;
};

module.exports = {
    createBranch,
    updateBranch,
    getBranches
};
