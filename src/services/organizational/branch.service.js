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
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsUserDetails } = require('../../models/HrmsUserDetails');
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
        attributes: [
            'id',
            'company_id',
            'branch_code',
            'branch_name',
            'branch_type',
            'description',
            // Region
            'region_id',
            [sequelize.literal('`region`.`region_code`'), 'region_code'],
            [sequelize.literal('`region`.`region_name`'), 'region_name'],
            // Zone
            'zone_id',
            [sequelize.literal('`zone`.`zone_code`'), 'zone_code'],
            [sequelize.literal('`zone`.`zone_name`'), 'zone_name'],
            // Business Unit
            'business_unit_id',
            [sequelize.literal('`businessUnit`.`business_unit_code`'), 'business_unit_code'],
            [sequelize.literal('`businessUnit`.`business_unit_name`'), 'business_unit_name'],
            // Channel
            'channel_id',
            [sequelize.literal('`channel`.`channel_code`'), 'channel_code'],
            [sequelize.literal('`channel`.`channel_name`'), 'channel_name'],
            // Cost Center
            'cost_center_id',
            [sequelize.literal('`costCenter`.`cost_center_code`'), 'cost_center_code'],
            [sequelize.literal('`costCenter`.`cost_center_name`'), 'cost_center_name'],
            // Branch Head
            'branch_head_id',
            [sequelize.literal('`branchHead`.`employee_code`'), 'branch_head_code'],
            [sequelize.literal("CONCAT(`branchHead`.`first_name`, ' ', COALESCE(`branchHead`.`middle_name`, ''), ' ', `branchHead`.`last_name`)"), 'branch_head_name'],
            // Address
            'address_line1',
            'address_line2',
            'postal_code',
            'phone',
            'email',
            'latitude',
            'longitude',
            // Country
            'country_id',
            [sequelize.literal('`country`.`country_code`'), 'country_code'],
            [sequelize.literal('`country`.`country_name`'), 'country_name'],
            // State
            'state_id',
            [sequelize.literal('`state`.`state_code`'), 'state_code'],
            [sequelize.literal('`state`.`state_name`'), 'state_name'],
            // City
            'city_id',
            [sequelize.literal('`city`.`city_name`'), 'city_name'],
            // Status & Order
            'is_active',
            'display_order',
            // Created By
            'created_by',
            [sequelize.literal('`createdByUser`.`email`'), 'created_by_email'],
            [sequelize.literal('`createdByUser->employee`.`employee_code`'), 'created_by_code'],
            [sequelize.literal("CONCAT(`createdByUser->employee`.`first_name`, ' ', COALESCE(`createdByUser->employee`.`middle_name`, ''), ' ', `createdByUser->employee`.`last_name`)"), 'created_by_name'],
            // Updated By
            'updated_by',
            [sequelize.literal('`updatedByUser`.`email`'), 'updated_by_email'],
            [sequelize.literal('`updatedByUser->employee`.`employee_code`'), 'updated_by_code'],
            [sequelize.literal("CONCAT(`updatedByUser->employee`.`first_name`, ' ', COALESCE(`updatedByUser->employee`.`middle_name`, ''), ' ', `updatedByUser->employee`.`last_name`)"), 'updated_by_name'],
            // Timestamps
            'created_at',
            'updated_at'
        ],
        where: whereClause,
        include: [
            {
                model: HrmsRegionMaster,
                as: 'region',
                attributes: [],
                required: false
            },
            {
                model: HrmsZoneMaster,
                as: 'zone',
                attributes: [],
                required: false
            },
            {
                model: HrmsBusinessUnitMaster,
                as: 'businessUnit',
                attributes: [],
                required: false
            },
            {
                model: HrmsChannelMaster,
                as: 'channel',
                attributes: [],
                required: false
            },
            {
                model: HrmsCostCenterMaster,
                as: 'costCenter',
                attributes: [],
                required: false
            },
            {
                model: HrmsCountryMaster,
                as: 'country',
                attributes: [],
                required: false
            },
            {
                model: HrmsStateMaster,
                as: 'state',
                attributes: [],
                required: false
            },
            {
                model: HrmsCityMaster,
                as: 'city',
                attributes: [],
                required: false
            },
            {
                model: HrmsEmployee,
                as: 'branchHead',
                attributes: [],
                required: false
            },
            {
                model: HrmsUserDetails,
                as: 'createdByUser',
                attributes: [],
                include: [
                    {
                        model: HrmsEmployee,
                        as: 'employee',
                        attributes: [],
                        required: false
                    }
                ],
                required: false
            },
            {
                model: HrmsUserDetails,
                as: 'updatedByUser',
                attributes: [],
                include: [
                    {
                        model: HrmsEmployee,
                        as: 'employee',
                        attributes: [],
                        required: false
                    }
                ],
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
