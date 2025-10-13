/**
 * Auto-Action Scheduler Service
 * Handles automatic actions for workflow requests based on SLA and pending duration
 * - Auto-approval after timeout
 * - Auto-rejection after timeout
 * - Escalation to higher level
 * - Reminder emails for pending approvals
 */

const { HrmsWorkflowRequest, HrmsWorkflowStage, HrmsWorkflowStageAssignment, HrmsWorkflowAction } = require('../../models/workflow');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { sendNotification, sendReminderEmail } = require('./emailNotification.service');
const { checkSLABreach } = require('../../utils/workflow/slaCalculator');
const { Op } = require('sequelize');
const cron = require('node-cron');

/**
 * Main function to process all auto-actions
 * Runs periodically via cron job
 * @returns {Promise<Object>} Processing results
 */
const processAutoActions = async () => {
    try {
        console.log('🔄 Starting auto-action scheduler...');

        const results = {
            processedRequests: 0,
            autoApprovals: 0,
            autoRejections: 0,
            escalations: 0,
            remindersSent: 0,
            errors: []
        };

        // 1. Find all pending requests with SLA breach or approaching SLA
        const expiredRequests = await findExpiredRequests();

        console.log(`📊 Found ${expiredRequests.length} requests requiring auto-action`);

        // 2. Process each expired request
        for (const request of expiredRequests) {
            try {
                const stage = await HrmsWorkflowStage.findByPk(request.current_stage_id);

                if (!stage) {
                    console.warn(`⚠️  Stage not found for request ${request.request_number}`);
                    continue;
                }

                // Process based on pending_action configuration
                if (stage.pending_action === 'auto_approve') {
                    await autoApproveExpiredRequest(request.id, stage.id);
                    results.autoApprovals++;
                } else if (stage.pending_action === 'auto_reject') {
                    await autoRejectExpiredRequest(request.id, stage.id);
                    results.autoRejections++;
                } else if (stage.pending_action === 'escalate' && stage.escalate_to_stage_id) {
                    await escalateRequest(request.id, stage.id, stage.escalate_to_stage_id);
                    results.escalations++;
                } else if (stage.pending_action === 'remind') {
                    await sendPendingReminders(request.id, stage.id);
                    results.remindersSent++;
                }

                results.processedRequests++;

            } catch (error) {
                console.error(`Error processing request ${request.request_number}:`, error);
                results.errors.push({
                    requestId: request.id,
                    requestNumber: request.request_number,
                    error: error.message
                });
            }
        }

        console.log('✅ Auto-action scheduler completed:', results);

        return results;

    } catch (error) {
        console.error('Error in auto-action scheduler:', error);
        throw error;
    }
};

/**
 * Find requests that have exceeded SLA or are pending for configured duration
 * @returns {Promise<Array>} Expired requests
 */
const findExpiredRequests = async () => {
    try {
        const now = new Date();

        // Find all pending/in_progress requests with SLA breached
        const requests = await HrmsWorkflowRequest.findAll({
            where: {
                request_status: {
                    [Op.in]: ['pending', 'in_progress']
                },
                sla_due_date: {
                    [Op.lte]: now // SLA due date is in the past
                }
            },
            include: [
                {
                    model: HrmsWorkflowStage,
                    as: 'currentStage',
                    where: {
                        pending_action: {
                            [Op.in]: ['auto_approve', 'auto_reject', 'escalate', 'remind']
                        }
                    }
                }
            ]
        });

        return requests;

    } catch (error) {
        console.error('Error finding expired requests:', error);
        return [];
    }
};

/**
 * Auto-approve request after SLA timeout
 * @param {number} requestId - Request ID
 * @param {number} stageId - Current stage ID
 * @returns {Promise<void>}
 */
const autoApproveExpiredRequest = async (requestId, stageId) => {
    try {
        const request = await HrmsWorkflowRequest.findByPk(requestId, {
            include: [{ association: 'currentStage' }]
        });

        if (!request) {
            throw new Error('Request not found');
        }

        console.log(`🤖 Auto-approving request ${request.request_number} (SLA expired)`);

        // Create action record
        await HrmsWorkflowAction.create({
            request_id: requestId,
            stage_id: stageId,
            action_type: 'auto_approve',
            action_by_user_id: null, // System action
            approver_type: 'system',
            remarks: `Auto-approved after SLA timeout (${request.currentStage.pending_after_days} days)`,
            action_taken_at: new Date(),
            is_system_action: true
        });

        // Get next stage based on on_approve_next_stage_id
        const currentStage = request.currentStage;

        if (currentStage.on_approve_next_stage_id) {
            // Move to next stage
            await HrmsWorkflowRequest.update(
                {
                    current_stage_id: currentStage.on_approve_next_stage_id,
                    request_status: 'in_progress'
                },
                { where: { id: requestId } }
            );

            console.log(`✓ Request moved to stage ${currentStage.on_approve_next_stage_id}`);

            // Send notification
            await sendNotification(requestId, 'auto_approval').catch(err => {
                console.error('Error sending auto-approval email:', err);
            });

        } else {
            // Final approval - no next stage
            await HrmsWorkflowRequest.update(
                {
                    request_status: 'approved',
                    completed_at: new Date()
                },
                { where: { id: requestId } }
            );

            console.log(`✓ Request ${request.request_number} auto-approved (final)`);

            // Send final approval notification
            await sendNotification(requestId, 'final_approval').catch(err => {
                console.error('Error sending final approval email:', err);
            });
        }

    } catch (error) {
        console.error('Error auto-approving request:', error);
        throw error;
    }
};

/**
 * Auto-reject request after SLA timeout
 * @param {number} requestId - Request ID
 * @param {number} stageId - Current stage ID
 * @returns {Promise<void>}
 */
const autoRejectExpiredRequest = async (requestId, stageId) => {
    try {
        const request = await HrmsWorkflowRequest.findByPk(requestId, {
            include: [{ association: 'currentStage' }]
        });

        if (!request) {
            throw new Error('Request not found');
        }

        console.log(`🤖 Auto-rejecting request ${request.request_number} (SLA expired)`);

        // Create action record
        await HrmsWorkflowAction.create({
            request_id: requestId,
            stage_id: stageId,
            action_type: 'auto_reject',
            action_by_user_id: null, // System action
            approver_type: 'system',
            remarks: `Auto-rejected after SLA timeout (${request.currentStage.pending_after_days} days)`,
            action_taken_at: new Date(),
            is_system_action: true
        });

        // Update request status to rejected
        await HrmsWorkflowRequest.update(
            {
                request_status: 'rejected',
                completed_at: new Date()
            },
            { where: { id: requestId } }
        );

        console.log(`✓ Request ${request.request_number} auto-rejected`);

        // Send rejection notification
        await sendNotification(requestId, 'auto_rejection').catch(err => {
            console.error('Error sending auto-rejection email:', err);
        });

    } catch (error) {
        console.error('Error auto-rejecting request:', error);
        throw error;
    }
};

/**
 * Escalate request to higher level/stage
 * @param {number} requestId - Request ID
 * @param {number} currentStageId - Current stage ID
 * @param {number} escalateToStageId - Escalation stage ID
 * @returns {Promise<void>}
 */
const escalateRequest = async (requestId, currentStageId, escalateToStageId) => {
    try {
        const request = await HrmsWorkflowRequest.findByPk(requestId);

        if (!request) {
            throw new Error('Request not found');
        }

        console.log(`🔼 Escalating request ${request.request_number} to stage ${escalateToStageId}`);

        // Create action record
        await HrmsWorkflowAction.create({
            request_id: requestId,
            stage_id: currentStageId,
            action_type: 'escalate',
            action_by_user_id: null, // System action
            approver_type: 'system',
            remarks: 'Escalated due to SLA timeout',
            action_taken_at: new Date(),
            is_system_action: true
        });

        // Get escalation stage
        const escalationStage = await HrmsWorkflowStage.findByPk(escalateToStageId);

        if (!escalationStage) {
            throw new Error('Escalation stage not found');
        }

        // Calculate new SLA
        const newSLADueDate = new Date();
        if (escalationStage.sla_days) {
            newSLADueDate.setDate(newSLADueDate.getDate() + escalationStage.sla_days);
        }
        if (escalationStage.sla_hours) {
            newSLADueDate.setHours(newSLADueDate.getHours() + escalationStage.sla_hours);
        }

        // Update request to escalation stage
        await HrmsWorkflowRequest.update(
            {
                current_stage_id: escalateToStageId,
                sla_due_date: newSLADueDate,
                request_status: 'in_progress'
            },
            { where: { id: requestId } }
        );

        console.log(`✓ Request escalated to stage: ${escalationStage.stage_name}`);

        // Send escalation notification
        await sendNotification(requestId, 'escalation').catch(err => {
            console.error('Error sending escalation email:', err);
        });

        // TODO: Create new stage assignments for escalation stage approvers
        // This would require calling approverResolver and creating new assignments

    } catch (error) {
        console.error('Error escalating request:', error);
        throw error;
    }
};

/**
 * Send reminder emails to pending approvers
 * @param {number} requestId - Request ID
 * @param {number} stageId - Stage ID
 * @returns {Promise<void>}
 */
const sendPendingReminders = async (requestId, stageId) => {
    try {
        const request = await HrmsWorkflowRequest.findByPk(requestId);

        if (!request) {
            throw new Error('Request not found');
        }

        console.log(`📧 Sending reminder for request ${request.request_number}`);

        // Get all pending assignments for this stage
        const pendingAssignments = await HrmsWorkflowStageAssignment.findAll({
            where: {
                request_id: requestId,
                stage_id: stageId,
                assignment_status: 'pending'
            }
        });

        if (pendingAssignments.length === 0) {
            console.log(`No pending assignments found for request ${request.request_number}`);
            return;
        }

        // Get approver details
        const approverUserIds = pendingAssignments.map(a => a.assigned_to_user_id);
        const approvers = await HrmsEmployee.findAll({
            where: {
                user_id: {
                    [Op.in]: approverUserIds
                }
            },
            attributes: ['user_id', 'email', 'first_name', 'last_name']
        });

        // Send reminder to each approver
        const approverEmails = approvers.map(a => a.email);

        await sendReminderEmail(requestId, approverEmails);

        // Update reminder count
        for (const assignment of pendingAssignments) {
            await HrmsWorkflowStageAssignment.update(
                {
                    reminder_count: (assignment.reminder_count || 0) + 1,
                    last_reminder_sent_at: new Date()
                },
                { where: { id: assignment.id } }
            );
        }

        console.log(`✓ Reminders sent to ${approverEmails.length} approvers`);

    } catch (error) {
        console.error('Error sending reminders:', error);
        throw error;
    }
};

/**
 * Find requests approaching SLA (for early warnings)
 * @param {number} hoursBeforeSLA - Hours before SLA to trigger warning
 * @returns {Promise<Array>} Requests approaching SLA
 */
const findRequestsApproachingSLA = async (hoursBeforeSLA = 4) => {
    try {
        const now = new Date();
        const warningTime = new Date(now.getTime() + (hoursBeforeSLA * 60 * 60 * 1000));

        const requests = await HrmsWorkflowRequest.findAll({
            where: {
                request_status: {
                    [Op.in]: ['pending', 'in_progress']
                },
                sla_due_date: {
                    [Op.between]: [now, warningTime]
                }
            }
        });

        return requests;

    } catch (error) {
        console.error('Error finding requests approaching SLA:', error);
        return [];
    }
};

/**
 * Send SLA warning notifications
 * @returns {Promise<Object>} Results
 */
const processSLAWarnings = async () => {
    try {
        console.log('⚠️  Processing SLA warnings...');

        const requests = await findRequestsApproachingSLA(4); // 4 hours before SLA

        let warningsSent = 0;

        for (const request of requests) {
            try {
                await sendNotification(request.id, 'sla_warning').catch(err => {
                    console.error('Error sending SLA warning:', err);
                });
                warningsSent++;
            } catch (error) {
                console.error(`Error processing SLA warning for request ${request.request_number}:`, error);
            }
        }

        console.log(`✓ SLA warnings sent: ${warningsSent}`);

        return { warningsSent };

    } catch (error) {
        console.error('Error processing SLA warnings:', error);
        throw error;
    }
};

/**
 * Initialize cron jobs for auto-actions
 * @returns {Object} Cron job instances
 */
const initializeScheduler = () => {
    console.log('🚀 Initializing auto-action scheduler...');

    // Run every 1 hour to check for expired requests
    const mainScheduler = cron.schedule('0 * * * *', async () => {
        console.log('🕐 Running scheduled auto-action check...');
        try {
            await processAutoActions();
        } catch (error) {
            console.error('Error in scheduled auto-action check:', error);
        }
    });

    // Run every 30 minutes to check for SLA warnings
    const slaWarningScheduler = cron.schedule('*/30 * * * *', async () => {
        console.log('🕐 Running scheduled SLA warning check...');
        try {
            await processSLAWarnings();
        } catch (error) {
            console.error('Error in scheduled SLA warning check:', error);
        }
    });

    console.log('✅ Auto-action scheduler initialized');
    console.log('   - Main scheduler: Every 1 hour');
    console.log('   - SLA warnings: Every 30 minutes');

    return {
        mainScheduler,
        slaWarningScheduler
    };
};

/**
 * Stop all schedulers
 * @param {Object} schedulers - Scheduler instances
 */
const stopScheduler = (schedulers) => {
    if (schedulers.mainScheduler) {
        schedulers.mainScheduler.stop();
    }
    if (schedulers.slaWarningScheduler) {
        schedulers.slaWarningScheduler.stop();
    }
    console.log('⏹️  Auto-action scheduler stopped');
};

/**
 * Manual trigger for testing
 * @returns {Promise<Object>} Results
 */
const manualTrigger = async () => {
    console.log('🔧 Manual trigger of auto-action scheduler...');
    const autoActionResults = await processAutoActions();
    const slaWarningResults = await processSLAWarnings();

    return {
        autoActions: autoActionResults,
        slaWarnings: slaWarningResults
    };
};

module.exports = {
    processAutoActions,
    findExpiredRequests,
    autoApproveExpiredRequest,
    autoRejectExpiredRequest,
    escalateRequest,
    sendPendingReminders,
    findRequestsApproachingSLA,
    processSLAWarnings,
    initializeScheduler,
    stopScheduler,
    manualTrigger
};
