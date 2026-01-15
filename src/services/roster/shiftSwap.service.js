/**
 * Shift Swap Service
 *
 * Purpose: Employee-to-employee shift swap requests
 * Employee requests to swap shift with another employee on specific date
 * Goes through target consent and workflow approval process
 *
 * Flow:
 * 1. Requester creates swap request (target_consent = 0)
 * 2. Target employee approves/rejects (target_consent = 1/2)
 * 3. If approved, workflow request created (approval_status = 0)
 * 4. Workflow approver approves/rejects (approval_status = 1/2)
 */

const { HrmsShiftSwapRequest } = require('../../models/HrmsShiftSwapRequest');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsShiftMaster } = require('../../models/HrmsShiftMaster');
const { HrmsCompany } = require('../../models/HrmsCompany');
const { HrmsWorkflowConfig, HrmsWorkflowMaster } = require('../../models/workflow');
const { getEmployeeShift } = require('./shiftCalculation.service');
const { submitRequest: submitWorkflowRequest } = require('../workflow/workflowExecution.service');
const { Op } = require('sequelize');

/**
 * Create shift swap request
 * @param {Object} data - Swap request data
 * @param {number} requester_employee_id - Requesting employee ID
 * @returns {Object} Created swap request
 */
async function createShiftSwapRequest(data, requester_employee_id) {
    try {
        const {
            company_id,
            target_employee_id,
            swap_date,
            swap_reason
        } = data;

        // Validate requester and target are different
        if (requester_employee_id === target_employee_id) {
            throw new Error('Cannot swap shift with yourself');
        }

        // Validate both employees exist
        const [requester, target] = await Promise.all([
            HrmsEmployee.findOne({
                where: { id: requester_employee_id, company_id: company_id, is_active: true }
            }),
            HrmsEmployee.findOne({
                where: { id: target_employee_id, company_id: company_id, is_active: true }
            })
        ]);

        if (!requester) {
            throw new Error('Requester employee not found or inactive');
        }

        if (!target) {
            throw new Error('Target employee not found or inactive');
        }

        // Get current shifts for both employees on swap_date
        const [requesterShiftData, targetShiftData] = await Promise.all([
            getEmployeeShift(requester_employee_id, swap_date),
            getEmployeeShift(target_employee_id, swap_date)
        ]);

        const requester_current_shift_id = requesterShiftData.shift_id;
        const target_current_shift_id = targetShiftData.shift_id;

        if (!requester_current_shift_id || !target_current_shift_id) {
            throw new Error('Unable to determine current shifts for swap date');
        }

        // Check if swap request already exists for this date
        const existingSwap = await HrmsShiftSwapRequest.findOne({
            where: {
                swap_date: swap_date,
                is_active: true,
                [Op.or]: [
                    {
                        requester_employee_id: requester_employee_id,
                        target_employee_id: target_employee_id
                    },
                    {
                        requester_employee_id: target_employee_id,
                        target_employee_id: requester_employee_id
                    }
                ]
            }
        });

        if (existingSwap) {
            throw new Error('Shift swap request already exists for this date between these employees');
        }

        // Create swap request
        const swapRequest = await HrmsShiftSwapRequest.create({
            company_id,
            requester_employee_id,
            target_employee_id,
            swap_date,
            requester_current_shift_id,
            target_current_shift_id,
            swap_reason,
            target_consent: 0, // Pending
            approval_status: 0, // Pending
            is_active: true,
            created_by: requester_employee_id
        });

        // Fetch complete data with associations
        const completeSwap = await HrmsShiftSwapRequest.findByPk(swapRequest.id, {
            include: [
                {
                    model: HrmsEmployee,
                    as: 'requester',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsEmployee,
                    as: 'target',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'requesterShift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'targetShift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                }
            ]
        });

        return {
            success: true,
            message: 'Shift swap request created successfully. Waiting for target employee consent.',
            data: completeSwap
        };

    } catch (error) {
        console.error('Error creating shift swap request:', error);
        throw error;
    }
}

/**
 * Target employee responds to swap request
 * @param {number} swap_id - Swap request ID
 * @param {number} target_employee_id - Target employee ID
 * @param {number} consent - 1=Approve, 2=Reject
 * @param {string} rejection_reason - Reason if rejecting
 * @returns {Object} Updated swap request
 */
async function respondToSwapRequest(swap_id, target_employee_id, consent, rejection_reason = null) {
    try {
        const swapRequest = await HrmsShiftSwapRequest.findByPk(swap_id);

        if (!swapRequest) {
            throw new Error('Shift swap request not found');
        }

        // Validate this is the target employee
        if (swapRequest.target_employee_id !== target_employee_id) {
            throw new Error('Only target employee can respond to this request');
        }

        // Validate consent is not already given
        if (swapRequest.target_consent !== 0) {
            throw new Error('Consent already given for this swap request');
        }

        // Validate consent value
        if (![1, 2].includes(consent)) {
            throw new Error('Invalid consent value. Use 1 for approve, 2 for reject');
        }

        // Update swap request
        await swapRequest.update({
            target_consent: consent,
            target_consent_at: new Date(),
            target_rejection_reason: consent === 2 ? rejection_reason : null,
            updated_by: target_employee_id
        });

        // If approved by target, create workflow request
        if (consent === 1) {
            await createWorkflowForSwapRequest(swapRequest);
        }

        // Fetch updated data
        const updatedSwap = await HrmsShiftSwapRequest.findByPk(swap_id, {
            include: [
                {
                    model: HrmsEmployee,
                    as: 'requester',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsEmployee,
                    as: 'target',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'requesterShift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'targetShift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                }
            ]
        });

        return {
            success: true,
            message: consent === 1
                ? 'Swap request approved by target. Workflow request created for final approval.'
                : 'Swap request rejected by target',
            data: updatedSwap
        };

    } catch (error) {
        console.error('Error responding to swap request:', error);
        throw error;
    }
}

/**
 * Create workflow request for shift swap (internal function)
 * @param {Object} swapRequest - Shift swap request object
 * @returns {Promise<void>}
 */
async function createWorkflowForSwapRequest(swapRequest) {
    try {
        // Find shift swap workflow master
        const workflowMaster = await HrmsWorkflowMaster.findOne({
            where: {
                workflow_code: 'SHIFT_SWAP',
                is_active: true
            }
        });

        if (!workflowMaster) {
            console.warn('Shift swap workflow master not found. Skipping workflow creation.');
            return;
        }

        // Prepare request data for workflow
        const requestData = {
            shift_swap_id: swapRequest.id,
            requester_employee_id: swapRequest.requester_employee_id,
            target_employee_id: swapRequest.target_employee_id,
            swap_date: swapRequest.swap_date,
            requester_shift_id: swapRequest.requester_current_shift_id,
            target_shift_id: swapRequest.target_current_shift_id,
            swap_reason: swapRequest.swap_reason
        };

        // Submit workflow request
        const workflowRequest = await submitWorkflowRequest(
            swapRequest.requester_employee_id,
            workflowMaster.id,
            requestData,
            swapRequest.requester_employee_id
        );

        // Update swap request with workflow details
        await swapRequest.update({
            workflow_config_id: workflowRequest.workflow_config_id,
            workflow_request_id: workflowRequest.id
        });

        console.log(`Workflow request created for shift swap ID: ${swapRequest.id}`);

    } catch (error) {
        console.error('Error creating workflow for swap request:', error);
        // Don't throw - just log. Swap request is still valid even if workflow fails
    }
}

/**
 * Handle workflow approval callback
 * Called by workflow system when shift swap is approved/rejected
 * @param {number} swap_id - Swap request ID
 * @param {number} approval_status - 1=Approved, 2=Rejected
 * @param {number} approved_by - User who approved/rejected
 * @param {string} rejection_reason - Reason if rejected
 * @returns {Object} Updated swap request
 */
async function handleWorkflowApproval(swap_id, approval_status, approved_by, rejection_reason = null) {
    try {
        const swapRequest = await HrmsShiftSwapRequest.findByPk(swap_id);

        if (!swapRequest) {
            throw new Error('Shift swap request not found');
        }

        // Validate target has approved
        if (swapRequest.target_consent !== 1) {
            throw new Error('Cannot process workflow approval before target consent');
        }

        // Validate not already approved/rejected
        if (swapRequest.approval_status !== 0) {
            throw new Error('Swap request already processed by workflow approver');
        }

        // Validate approval_status value
        if (![1, 2].includes(approval_status)) {
            throw new Error('Invalid approval status. Use 1 for approve, 2 for reject');
        }

        // Update swap request
        await swapRequest.update({
            approval_status: approval_status,
            approved_by: approved_by,
            approved_at: new Date(),
            rejection_reason: approval_status === 2 ? rejection_reason : null,
            updated_by: approved_by
        });

        // Fetch updated data
        const updatedSwap = await HrmsShiftSwapRequest.findByPk(swap_id, {
            include: [
                {
                    model: HrmsEmployee,
                    as: 'requester',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsEmployee,
                    as: 'target',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'requesterShift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'targetShift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                }
            ]
        });

        return {
            success: true,
            message: approval_status === 1
                ? 'Shift swap approved successfully'
                : 'Shift swap rejected by workflow approver',
            data: updatedSwap
        };

    } catch (error) {
        console.error('Error handling workflow approval:', error);
        throw error;
    }
}

/**
 * Get swap request by ID
 * @param {number} id - Swap request ID
 * @returns {Object} Swap request details
 */
async function getSwapRequestById(id) {
    try {
        const swapRequest = await HrmsShiftSwapRequest.findByPk(id, {
            include: [
                {
                    model: HrmsCompany,
                    as: 'company',
                    attributes: ['id', 'org_name']
                },
                {
                    model: HrmsEmployee,
                    as: 'requester',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsEmployee,
                    as: 'target',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'requesterShift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'targetShift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                }
            ]
        });

        if (!swapRequest) {
            throw new Error('Swap request not found');
        }

        return {
            success: true,
            data: swapRequest
        };

    } catch (error) {
        console.error('Error getting swap request:', error);
        throw error;
    }
}

/**
 * Get swap requests with filters
 * @param {Object} filters - Filter criteria
 * @returns {Object} List of swap requests
 */
async function getSwapRequests(filters = {}) {
    try {
        const {
            company_id,
            requester_employee_id,
            target_employee_id,
            employee_id, // Either requester or target
            swap_date,
            target_consent,
            approval_status,
            is_active,
            page = 1,
            limit = 50
        } = filters;

        const where = {};

        if (company_id) where.company_id = company_id;
        if (requester_employee_id) where.requester_employee_id = requester_employee_id;
        if (target_employee_id) where.target_employee_id = target_employee_id;
        if (swap_date) where.swap_date = swap_date;
        if (target_consent !== undefined) where.target_consent = target_consent;
        if (approval_status !== undefined) where.approval_status = approval_status;
        if (is_active !== undefined) where.is_active = is_active;

        // Filter for either requester or target
        if (employee_id) {
            where[Op.or] = [
                { requester_employee_id: employee_id },
                { target_employee_id: employee_id }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await HrmsShiftSwapRequest.findAndCountAll({
            where,
            include: [
                {
                    model: HrmsEmployee,
                    as: 'requester',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsEmployee,
                    as: 'target',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'requesterShift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'targetShift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                }
            ],
            order: [['swap_date', 'DESC'], ['id', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(count / limit)
            }
        };

    } catch (error) {
        console.error('Error getting swap requests:', error);
        throw error;
    }
}

/**
 * Cancel swap request (by requester before target consent)
 * @param {number} swap_id - Swap request ID
 * @param {number} requester_employee_id - Requester employee ID
 * @returns {Object} Success message
 */
async function cancelSwapRequest(swap_id, requester_employee_id) {
    try {
        const swapRequest = await HrmsShiftSwapRequest.findByPk(swap_id);

        if (!swapRequest) {
            throw new Error('Swap request not found');
        }

        // Validate this is the requester
        if (swapRequest.requester_employee_id !== requester_employee_id) {
            throw new Error('Only requester can cancel this swap request');
        }

        // Can only cancel if target hasn't responded yet
        if (swapRequest.target_consent !== 0) {
            throw new Error('Cannot cancel swap request after target has responded');
        }

        // Soft delete
        await swapRequest.update({
            is_active: false,
            updated_by: requester_employee_id
        });

        await swapRequest.destroy();

        return {
            success: true,
            message: 'Swap request cancelled successfully'
        };

    } catch (error) {
        console.error('Error cancelling swap request:', error);
        throw error;
    }
}

/**
 * Get pending swap requests for target employee
 * @param {number} target_employee_id - Target employee ID
 * @returns {Object} List of pending swap requests
 */
async function getPendingSwapRequestsForTarget(target_employee_id) {
    try {
        const swapRequests = await HrmsShiftSwapRequest.findAll({
            where: {
                target_employee_id: target_employee_id,
                target_consent: 0, // Pending
                is_active: true
            },
            include: [
                {
                    model: HrmsEmployee,
                    as: 'requester',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'requesterShift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'targetShift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                }
            ],
            order: [['swap_date', 'ASC']]
        });

        return {
            success: true,
            data: swapRequests,
            total: swapRequests.length
        };

    } catch (error) {
        console.error('Error getting pending swap requests:', error);
        throw error;
    }
}

module.exports = {
    createShiftSwapRequest,
    respondToSwapRequest,
    handleWorkflowApproval,
    getSwapRequestById,
    getSwapRequests,
    cancelSwapRequest,
    getPendingSwapRequestsForTarget
};
