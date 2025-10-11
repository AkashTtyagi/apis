/**
 * Leave Credit Cron Controller
 * Handles manual execution of leave credit cron jobs
 */

const { processLeaveCreditsByFrequency } = require('../../services/cron/leaveCreditCron.service');
const { sendSuccess } = require('../../utils/response');

/**
 * Run leave credit cron for specific frequency
 * POST /api/cron/leave-credit/run
 * Body: { frequency: 'monthly|quarterly|half_yearly|yearly', day_of_month: 1 }
 */
const runLeaveCreditByFrequency = async (req, res, next) => {
    try {
        const { frequency, day_of_month } = req.body;

        if (!frequency) {
            return res.status(400).json({
                success: false,
                message: 'frequency is required (monthly, quarterly, half_yearly, yearly)'
            });
        }

        const validFrequencies = ['monthly', 'quarterly', 'half_yearly', 'yearly'];
        if (!validFrequencies.includes(frequency)) {
            return res.status(400).json({
                success: false,
                message: `Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`
            });
        }

        const result = await processLeaveCreditsByFrequency(
            frequency,
            day_of_month ? parseInt(day_of_month) : null
        );

        return sendSuccess(res, `${frequency} leave credits processed successfully`, result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    runLeaveCreditByFrequency
};
