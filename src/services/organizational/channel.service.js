/**
 * Channel Service
 */

const { HrmsChannelMaster } = require('../../models/HrmsChannelMaster');
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
        where: whereClause,
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
