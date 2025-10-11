/**
 * Leave Credit Scheduler
 * Schedules and runs leave credit cron jobs
 * Uses node-cron for scheduling
 */

const cron = require('node-cron');
const { runDailyLeaveCreditCron } = require('../services/cron/leaveCreditCron.service');

/**
 * Start leave credit cron scheduler
 * Runs daily at 00:01 AM (1 minute past midnight)
 */
const startLeaveCreditScheduler = () => {
    console.log('📅 Starting leave credit cron scheduler...');

    // Schedule: Run daily at 00:01 AM
    // Cron pattern: '1 0 * * *'
    // Format: minute hour day-of-month month day-of-week
    const cronSchedule = '1 0 * * *'; // Every day at 00:01 AM

    const scheduledTask = cron.schedule(cronSchedule, async () => {
        console.log('\n🚀 Triggered: Daily leave credit cron job');
        try {
            await runDailyLeaveCreditCron();
        } catch (error) {
            console.error('❌ Leave credit cron failed:', error.message);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Adjust timezone as needed
    });

    console.log(`✓ Leave credit cron scheduled to run daily at 00:01 AM (Asia/Kolkata)`);
    console.log(`  Cron pattern: ${cronSchedule}`);

    return scheduledTask;
};

/**
 * Stop leave credit scheduler
 * @param {Object} scheduledTask - Cron task object
 */
const stopLeaveCreditScheduler = (scheduledTask) => {
    if (scheduledTask) {
        scheduledTask.stop();
        console.log('⊘ Leave credit cron scheduler stopped');
    }
};

/**
 * Run leave credit cron manually (for testing)
 */
const runManualLeaveCreditCron = async () => {
    console.log('\n🔧 Running leave credit cron manually...');
    try {
        const result = await runDailyLeaveCreditCron();
        console.log('✓ Manual cron execution completed');
        return result;
    } catch (error) {
        console.error('❌ Manual cron execution failed:', error.message);
        throw error;
    }
};

module.exports = {
    startLeaveCreditScheduler,
    stopLeaveCreditScheduler,
    runManualLeaveCreditCron
};
