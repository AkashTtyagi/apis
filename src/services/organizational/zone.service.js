/**
 * Zone Service
 */

const { HrmsZoneMaster } = require('../../models/HrmsZoneMaster');
const { HrmsRegionMaster } = require('../../models/HrmsRegionMaster');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsUserDetails } = require('../../models/HrmsUserDetails');
const { sequelize } = require('../../utils/database');

const createZone = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const zone = await HrmsZoneMaster.create(data, { transaction });
        await transaction.commit();
        return zone;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateZone = async (id, company_id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const zone = await HrmsZoneMaster.findOne({
            where: { id, company_id },
            transaction
        });

        if (!zone) {
            throw new Error('Zone not found');
        }

        await zone.update(data, { transaction });
        await transaction.commit();
        return zone;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getZones = async (company_id, filters = {}) => {
    const whereClause = { company_id };

    if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    if (filters.search) {
        whereClause[sequelize.Sequelize.Op.or] = [
            { zone_code: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } },
            { zone_name: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } }
        ];
    }

    if (filters.region_id) {
        whereClause.region_id = filters.region_id;
    }

    if (filters.id) {
        whereClause.id = filters.id;
    }

    const zones = await HrmsZoneMaster.findAll({
        attributes: [
            'id',
            'company_id',
            'zone_code',
            'zone_name',
            'description',
            // Region
            'region_id',
            [sequelize.literal('`region`.`region_code`'), 'region_code'],
            [sequelize.literal('`region`.`region_name`'), 'region_name'],
            // Zone Head
            'zone_head_id',
            [sequelize.literal('`zoneHead`.`employee_code`'), 'zone_head_code'],
            [sequelize.literal("CONCAT(`zoneHead`.`first_name`, ' ', COALESCE(`zoneHead`.`middle_name`, ''), ' ', `zoneHead`.`last_name`)"), 'zone_head_name'],
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
                model: HrmsEmployee,
                as: 'zoneHead',
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
            ['zone_name', 'ASC']
        ]
    });

    return zones;
};

module.exports = {
    createZone,
    updateZone,
    getZones
};
