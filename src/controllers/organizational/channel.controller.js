/**
 * Channel Controller
 */

const channelService = require('../../services/organizational/channel.service');

/**
 * Create channel
 */
const create = async (req, res) => {
    try {
        const { company_id } = req.user;
        const data = {
            ...req.body,
            company_id,
            created_by: req.user.id
        };

        const channel = await channelService.createChannel(data);

        res.status(201).json({
            success: true,
            message: 'Channel created successfully',
            data: channel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create channel',
            error: error.message
        });
    }
};

/**
 * Update channel
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id } = req.user;
        const data = {
            ...req.body,
            updated_by: req.user.id
        };

        const channel = await channelService.updateChannel(id, company_id, data);

        res.status(200).json({
            success: true,
            message: 'Channel updated successfully',
            data: channel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update channel',
            error: error.message
        });
    }
};

/**
 * Get channel list
 */
const list = async (req, res) => {
    try {
        const { company_id } = req.user;
        const filters = {
            is_active: req.body.is_active,
            search: req.body.search,
            channel_type: req.body.channel_type,
            id: req.body.id
        };

        const channels = await channelService.getChannels(company_id, filters);

        res.status(200).json({
            success: true,
            message: 'Channels retrieved successfully',
            data: channels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve channels',
            error: error.message
        });
    }
};

module.exports = {
    create,
    update,
    list
};
