/**
 * Channel Service
 */

const { HrmsChannelMaster } = require('../../models/HrmsChannelMaster');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsUserDetails } = require('../../models/HrmsUserDetails');
const { sequelize } = require('../../utils/database');

const createChannel = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const channel = await HrmsChannelMaster.create(data, { transaction });
        await transaction.commit();
        return channel;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateChannel = async (id, company_id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const channel = await HrmsChannelMaster.findOne({
            where: { id, company_id },
            transaction
        });

        if (!channel) {
            throw new Error('Channel not found');
        }

        await channel.update(data, { transaction });
        await transaction.commit();
        return channel;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getChannels = async (company_id, filters = {}) => {
    const whereClause = { company_id };

    if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    if (filters.search) {
        whereClause[sequelize.Sequelize.Op.or] = [
            { channel_code: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } },
            { channel_name: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } }
        ];
    }

    if (filters.channel_type) {
        whereClause.channel_type = filters.channel_type;
    }

    if (filters.id) {
        whereClause.id = filters.id;
    }

    const channels = await HrmsChannelMaster.findAll({
        attributes: [
            'id',
            'company_id',
            'channel_code',
            'channel_name',
            'channel_type',
            'description',
            // Channel Head
            'channel_head_id',
            [sequelize.literal('`channelHead`.`employee_code`'), 'channel_head_code'],
            [sequelize.literal("CONCAT(`channelHead`.`first_name`, ' ', COALESCE(`channelHead`.`middle_name`, ''), ' ', `channelHead`.`last_name`)"), 'channel_head_name'],
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
                model: HrmsEmployee,
                as: 'channelHead',
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
            ['channel_name', 'ASC']
        ]
    });

    return channels;
};

module.exports = {
    createChannel,
    updateChannel,
    getChannels
};
