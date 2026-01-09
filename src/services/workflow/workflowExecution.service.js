/**
 * Workflow Execution Engine
 * Core service for workflow execution and orchestration
 */

const {
    HrmsWorkflowConfig,
    HrmsWorkflowMaster,
    HrmsWorkflowStage,
    HrmsWorkflowRequest,
    HrmsWorkflowAction,
    HrmsWorkflowStageAssignment,
    HrmsWorkflowApplicability
} = require('../../models/workflow');

const { evaluateConditions } = require('./conditionEvaluator.service');
const { resolveStageApprovers } = require('./approverResolver.service');
const { sendNotification } = require('./emailNotification.service');
const { generateRequestNumber } = require('../../utils/workflow/requestNumberGenerator');
const { calculateSLADueDate } = require('../../utils/workflow/slaCalculator');
const { db } = require('../../utils/database');
const { Op } = require('sequelize');

/**
 * Submit a new workflow request
 * @param {number} employeeId - Employee ID
 * @param {number} workflowMasterId - Workflow master ID
 * @param {Object} requestData - Request data
 * @param {number} submittedBy - User ID who submitted
 * @returns {Promise<Object>} Created request
 */
const submitRequest = async (employeeId, workflowMasterId, requestData, submittedBy = null) => {
    const transaction = await db.beginTransaction();

    try {
        // 1. Find applicable workflow
        const workflow = await findApplicableWorkflow(employeeId, workflowMasterId);

        if (!workflow) {
            throw new Error('No applicable workflow found for this employee');
        }

        // 2. Get employee data for context
        const employee = await getEmployeeData(employeeId);

        // 3. Get leave balance if applicable
        let leaveBalance = null;
        if (workflowMasterId === 1) { // Leave workflow
            leaveBalance = await getLeaveBalance(employeeId, requestData.leave_type);
        }

        // 4. Build context for condition evaluation
        const context = {
            employee,
            request: requestData,
            leaveBalance
        };

        // 5. Generate request number
        const workflowMaster = await HrmsWorkflowMaster.findByPk(workflowMasterId);
        const requestNumber = await generateRequestNumber(workflowMaster.workflow_code, employee.company_id);

        // 6. Create workflow request
        const requestPayload = {
            request_number: requestNumber,
            workflow_config_id: workflow.id,
            workflow_master_id: workflowMasterId,
            company_id: employee.company_id,
            employee_id: employeeId,
            submitted_by: submittedBy || employeeId,
            request_data: requestData,
            request_status: 'submitted',
            overall_status: 'in_progress',
            submitted_at: new Date()
        };

        // Add leave-specific fields if workflow is for Leave (workflow_master_id = 1)
        if (workflowMasterId === 1 && requestData) {
            requestPayload.leave_type = requestData.leave_type || null;
            requestPayload.from_date = requestData.from_date || null;
            requestPayload.to_date = requestData.to_date || null;
        }

        // Add date fields for OnDuty (workflow_master_id = 2) and WFH (workflow_master_id = 3)
        if ((workflowMasterId === 2 || workflowMasterId === 3) && requestData) {
            requestPayload.from_date = requestData.from_date || null;
            requestPayload.to_date = requestData.to_date || null;
        }

        const request = await HrmsWorkflowRequest.create(requestPayload, { transaction: transaction.trans_id });

        console.log(`✓ Request created: ${requestNumber}`);

        // 7. Evaluate global conditions (auto-approve/reject checks)
        const conditionResult = await evaluateConditions(workflow.id, null, context);

        if (conditionResult.matched) {
            console.log(`Condition matched: ${conditionResult.conditionName}, Action: ${conditionResult.action}`);

            if (conditionResult.action === 'auto_approve') {
                await autoApproveRequest(request.id, conditionResult.message, transaction.trans_id);
                await transaction.commit();
                return await getRequestDetails(request.id);
            }

            if (conditionResult.action === 'auto_reject') {
                await autoRejectRequest(request.id, conditionResult.message, transaction.trans_id);
                await transaction.commit();
                return await getRequestDetails(request.id);
            }
        }

        // 8. Get first stage
        const firstStage = await HrmsWorkflowStage.findOne({
            where: {
                workflow_config_id: workflow.id,
                stage_order: 1,
                is_active: true
            }
        });

        if (!firstStage) {
            throw new Error('No stages configured for this workflow');
        }

        // 9. Process first stage
        await processStage(request.id, firstStage.id, context, transaction.trans_id);

        await transaction.commit();
        console.log(`✓ Request submitted successfully: ${requestNumber}`);

        // 10. Send submission email (async - don't wait)
        if (workflow.send_submission_email) {
            sendNotification(request.id, 'submission').catch(err => {
                console.error('Error sending submission email:', err);
            });
        }

        return await getRequestDetails(request.id);

    } catch (error) {
        await transaction.rollback();
        console.error('Error submitting request:', error);
        throw error;
    }
};

/**
 * Process a workflow stage
 * @param {number} requestId - Request ID
 * @param {number} stageId - Stage ID
 * @param {Object} context - Context data
 * @param {Object} transaction - Transaction object
 * @returns {Promise<void>}
 */
const processStage = async (requestId, stageId, context, transaction = null) => {
    try {
        const queryOptions = transaction ? { transaction } : {};
        const stage = await HrmsWorkflowStage.findByPk(stageId, queryOptions);
        const request = await HrmsWorkflowRequest.findByPk(requestId, queryOptions);

        if (!request) {
            throw new Error(`Workflow request not found with ID: ${requestId}`);
        }

        console.log(`Processing stage: ${stage.stage_name} for request ${request.request_number}`);

        // Evaluate stage-specific conditions
        const conditionResult = await evaluateConditions(stage.workflow_config_id, stageId, context);

        if (conditionResult.matched && conditionResult.action === 'skip_stage') {
            console.log(`Skipping stage: ${stage.stage_name}`);
            await moveToNextStage(requestId, stageId, transaction);
            return;
        }

        // Resolve approvers for this stage
        const approvers = await resolveStageApprovers(stageId, request.employee_id, context);

        if (!approvers || approvers.length === 0) {
            throw new Error(`No approvers found for stage: ${stage.stage_name}`);
        }

        // Create stage assignments
        await createStageAssignments(requestId, stageId, stage, approvers, transaction);

        // Calculate SLA due date
        const slaDueDate = calculateSLADueDate(stage.sla_days, stage.sla_hours);

        // Update request with current stage
        await HrmsWorkflowRequest.update({
            current_stage_id: stageId,
            current_stage_order: stage.stage_order,
            request_status: 'pending',
            sla_due_date: slaDueDate
        }, {
            where: { id: requestId },
            transaction
        });

        console.log(`✓ Stage ${stage.stage_name} assigned to ${approvers.length} approver(s)`);

        // Send stage assignment emails (async)
        if (stage.send_email_on_assign) {
            for (const approver of approvers) {
                sendNotification(requestId, 'stage_assignment', approver.user_id).catch(err => {
                    console.error('Error sending stage assignment email:', err);
                });
            }
        }

    } catch (error) {
        console.error('Error processing stage:', error);
        throw error;
    }
};

/**
 * Create stage assignments for approvers
 * @param {number} requestId - Request ID
 * @param {number} stageId - Stage ID
 * @param {Object} stage - Stage object
 * @param {Array} approvers - Approvers array
 * @param {Object} transaction - Transaction object
 */
const createStageAssignments = async (requestId, stageId, stage, approvers, transaction = null) => {
    try {
        const assignments = [];
        const slaDueDate = calculateSLADueDate(stage.sla_days, stage.sla_hours);

        for (const approver of approvers) {
            assignments.push({
                request_id: requestId,
                stage_id: stageId,
                assigned_to_user_id: approver.user_id,
                approver_type: approver.approver_type,
                assignment_status: 'pending',
                requires_all_approval: stage.approver_logic === 'AND',
                approval_order: approver.order || 1,
                sla_due_date: slaDueDate,
                assigned_at: new Date()
            });
        }

        await HrmsWorkflowStageAssignment.bulkCreate(assignments, { transaction });

        console.log(`✓ Created ${assignments.length} stage assignments`);

    } catch (error) {
        console.error('Error creating stage assignments:', error);
        throw error;
    }
};

/**
 * Handle approval action
 * @param {number} requestId - Request ID
 * @param {number} approverUserId - Approver user ID
 * @param {string} remarks - Approval remarks
 * @param {Array} attachments - Attachments
 * @param {Object} ipInfo - IP and user agent info
 * @returns {Promise<Object>} Result
 */
const handleApproval = async (requestId, approverUserId, remarks = null, attachments = null, ipInfo = {}) => {
    const transaction = await db.beginTransaction();

    try {
        const request = await HrmsWorkflowRequest.findByPk(requestId);

        if (!request) {
            throw new Error('Request not found');
        }

        if (!request.current_stage_id) {
            throw new Error('Request has no current stage. It may be already completed or auto-approved/rejected.');
        }

        const currentStage = await HrmsWorkflowStage.findByPk(request.current_stage_id);

        if (!currentStage) {
            throw new Error('Current stage not found');
        }

        // Find assignment for this approver
        const assignment = await HrmsWorkflowStageAssignment.findOne({
            where: {
                request_id: requestId,
                stage_id: currentStage.id,
                assigned_to_user_id: approverUserId,
                assignment_status: 'pending'
            }
        });

        if (!assignment) {
            throw new Error('No pending assignment found for this approver');
        }

        // Log approval action
        const action = await HrmsWorkflowAction.create({
            request_id: requestId,
            stage_id: currentStage.id,
            action_type: 'approve',
            action_by_user_id: approverUserId,
            action_by_type: 'approver',
            approver_type: assignment.approver_type,
            approver_user_id: approverUserId,
            remarks: remarks,
            attachments: attachments,
            action_taken_at: new Date(),
            ip_address: ipInfo.ip,
            user_agent: ipInfo.userAgent,
            previous_stage_id: currentStage.id
        }, { transaction: transaction.trans_id });

        // Update assignment
        await HrmsWorkflowStageAssignment.update({
            assignment_status: 'approved',
            action_taken: true,
            action_taken_at: new Date(),
            action_id: action.id
        }, {
            where: { id: assignment.id },
            transaction: transaction.trans_id
        });

        console.log(`✓ Approval recorded for request ${request.request_number}`);

        // Check if all required approvals are complete
        const canMoveForward = await checkStageApprovalComplete(requestId, currentStage.id, currentStage.approver_logic);

        if (canMoveForward) {
            // Move to next stage or finalize
            if (currentStage.on_approve_next_stage_id) {
                const nextStage = await HrmsWorkflowStage.findByPk(currentStage.on_approve_next_stage_id);

                // Update action with next stage
                await HrmsWorkflowAction.update({
                    next_stage_id: nextStage.id,
                    action_result: `Moving to next stage: ${nextStage.stage_name}`
                }, {
                    where: { id: action.id },
                    transaction: transaction.trans_id
                });

                // Get context for next stage
                const employee = await getEmployeeData(request.employee_id);
                const context = {
                    employee,
                    request: request.request_data
                };

                await processStage(requestId, nextStage.id, context, transaction.trans_id);
            } else {
                // Final approval
                await finalizeRequest(requestId, 'approved', transaction.trans_id);
            }
        }

        await transaction.commit();

        // Send approval email (async)
        if (currentStage.send_email_on_approve) {
            sendNotification(requestId, 'approval').catch(err => {
                console.error('Error sending approval email:', err);
            });
        }

        return await getRequestDetails(requestId);

    } catch (error) {
        await transaction.rollback();
        console.error('Error handling approval:', error);
        throw error;
    }
};

/**
 * Handle rejection action
 * @param {number} requestId - Request ID
 * @param {number} approverUserId - Approver user ID
 * @param {string} remarks - Rejection remarks
 * @param {Object} ipInfo - IP and user agent info
 * @returns {Promise<Object>} Result
 */
const handleRejection = async (requestId, approverUserId, remarks = null, ipInfo = {}) => {
    const transaction = await db.beginTransaction();

    try {
        const request = await HrmsWorkflowRequest.findByPk(requestId);

        if (!request) {
            throw new Error('Request not found');
        }

        if (!request.current_stage_id) {
            throw new Error('Request has no current stage. It may be already completed or auto-approved/rejected.');
        }

        const currentStage = await HrmsWorkflowStage.findByPk(request.current_stage_id);

        if (!currentStage) {
            throw new Error('Current stage not found');
        }

        // Find assignment
        const assignment = await HrmsWorkflowStageAssignment.findOne({
            where: {
                request_id: requestId,
                stage_id: currentStage.id,
                assigned_to_user_id: approverUserId,
                assignment_status: 'pending'
            }
        });

        if (!assignment) {
            throw new Error('No pending assignment found for this approver');
        }

        // Log rejection action
        const action = await HrmsWorkflowAction.create({
            request_id: requestId,
            stage_id: currentStage.id,
            action_type: 'reject',
            action_by_user_id: approverUserId,
            action_by_type: 'approver',
            approver_type: assignment.approver_type,
            approver_user_id: approverUserId,
            remarks: remarks,
            action_taken_at: new Date(),
            ip_address: ipInfo.ip,
            user_agent: ipInfo.userAgent,
            previous_stage_id: currentStage.id
        }, { transaction: transaction.trans_id });

        // Update assignment
        await HrmsWorkflowStageAssignment.update({
            assignment_status: 'rejected',
            action_taken: true,
            action_taken_at: new Date(),
            action_id: action.id
        }, {
            where: { id: assignment.id },
            transaction: transaction.trans_id
        });

        // Handle rejection based on stage configuration
        if (currentStage.on_reject_action === 'final_reject') {
            await finalizeRequest(requestId, 'rejected', transaction.trans_id);
        } else if (currentStage.on_reject_action === 'move_to_stage') {
            // Move to rejection stage
            const rejectStage = await HrmsWorkflowStage.findByPk(currentStage.on_reject_stage_id);
            const employee = await getEmployeeData(request.employee_id);
            const context = { employee, request: request.request_data };
            await processStage(requestId, rejectStage.id, context, transaction.trans_id);
        }

        await transaction.commit();

        // Send rejection email (async)
        if (currentStage.send_email_on_reject) {
            sendNotification(requestId, 'rejection').catch(err => {
                console.error('Error sending rejection email:', err);
            });
        }

        return await getRequestDetails(requestId);

    } catch (error) {
        await transaction.rollback();
        console.error('Error handling rejection:', error);
        throw error;
    }
};

/**
 * Check if stage approval is complete
 * @param {number} requestId - Request ID
 * @param {number} stageId - Stage ID
 * @param {string} approverLogic - AND or OR
 * @returns {Promise<boolean>} Can move forward
 */
const checkStageApprovalComplete = async (requestId, stageId, approverLogic) => {
    try {
        const assignments = await HrmsWorkflowStageAssignment.findAll({
            where: {
                request_id: requestId,
                stage_id: stageId
            }
        });

        if (approverLogic === 'AND') {
            // All must approve
            return assignments.every(a => a.assignment_status === 'approved');
        } else {
            // Any one approval is enough
            return assignments.some(a => a.assignment_status === 'approved');
        }

    } catch (error) {
        console.error('Error checking stage approval:', error);
        return false;
    }
};

/**
 * Auto-approve request
 * @param {number} requestId - Request ID
 * @param {string} reason - Reason for auto-approval
 * @param {Object} transaction - Transaction
 */
const autoApproveRequest = async (requestId, reason, transaction = null) => {
    try {
        await HrmsWorkflowAction.create({
            request_id: requestId,
            action_type: 'auto_approve',
            action_by_type: 'system',
            remarks: reason,
            action_taken_at: new Date()
        }, { transaction });

        await finalizeRequest(requestId, 'auto_approved', transaction);

        console.log(`✓ Request ${requestId} auto-approved: ${reason}`);

    } catch (error) {
        console.error('Error auto-approving request:', error);
        throw error;
    }
};

/**
 * Auto-reject request
 * @param {number} requestId - Request ID
 * @param {string} reason - Reason for auto-rejection
 * @param {Object} transaction - Transaction
 */
const autoRejectRequest = async (requestId, reason, transaction = null) => {
    try {
        await HrmsWorkflowAction.create({
            request_id: requestId,
            action_type: 'auto_reject',
            action_by_type: 'system',
            remarks: reason,
            action_taken_at: new Date()
        }, { transaction });

        await finalizeRequest(requestId, 'auto_rejected', transaction);

        console.log(`✓ Request ${requestId} auto-rejected: ${reason}`);

    } catch (error) {
        console.error('Error auto-rejecting request:', error);
        throw error;
    }
};

/**
 * Finalize request (final approval or rejection)
 * @param {number} requestId - Request ID
 * @param {string} status - Final status
 * @param {Object} transaction - Transaction
 */
const finalizeRequest = async (requestId, status, transaction = null) => {
    try {
        const overallStatus = ['approved', 'auto_approved'].includes(status) ? 'completed' : 'rejected';

        await HrmsWorkflowRequest.update({
            request_status: status,
            overall_status: overallStatus,
            completed_at: new Date()
        }, {
            where: { id: requestId },
            transaction
        });

        console.log(`✓ Request ${requestId} finalized with status: ${status}`);

    } catch (error) {
        console.error('Error finalizing request:', error);
        throw error;
    }
};

/**
 * Move to next stage
 * @param {number} requestId - Request ID
 * @param {number} currentStageId - Current stage ID
 * @param {Object} transaction - Transaction
 */
const moveToNextStage = async (requestId, currentStageId, transaction = null) => {
    try {
        const currentStage = await HrmsWorkflowStage.findByPk(currentStageId);
        const nextStage = await HrmsWorkflowStage.findByPk(currentStage.on_approve_next_stage_id);

        if (!nextStage) {
            await finalizeRequest(requestId, 'approved', transaction);
            return;
        }

        const request = await HrmsWorkflowRequest.findByPk(requestId);
        const employee = await getEmployeeData(request.employee_id);
        const context = { employee, request: request.request_data };

        await processStage(requestId, nextStage.id, context, transaction);

    } catch (error) {
        console.error('Error moving to next stage:', error);
        throw error;
    }
};

// Helper functions (to be implemented in separate files)
const findApplicableWorkflow = async (employeeId, workflowMasterId) => {
    // Implementation in applicability.service.js
    return require('./applicability.service').findApplicableWorkflow(employeeId, workflowMasterId);
};

const getEmployeeData = async (employeeId) => {
    const { HrmsEmployee } = require('../../models/HrmsEmployee');
    return await HrmsEmployee.findByPk(employeeId, { raw: true });
};

const getLeaveBalance = async (employeeId, leaveType) => {
    // Implementation in leave balance service
    return { available_balance: 10 }; // Placeholder
};

const getRequestDetails = async (requestId) => {
    return await HrmsWorkflowRequest.findByPk(requestId, {
        include: [
            { association: 'workflowConfig' },
            { association: 'currentStage' },
            { association: 'actions' }
        ]
    });
};

module.exports = {
    submitRequest,
    processStage,
    handleApproval,
    handleRejection,
    autoApproveRequest,
    autoRejectRequest,
    finalizeRequest,
    moveToNextStage
};
