/**
 * Leave Balance Controller
 * Handles HTTP requests for leave balance operations
 */

const leaveBalanceService = require('../services/leaveBalance.service');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Get employee leave balance
 * GET /api/leave-balance/:employeeId
 */
const getEmployeeLeaveBalance = async (req, res, next) => {
    try {
        const employee_id = parseInt(req.params.employeeId);
        const { leave_cycle_year } = req.query;

        const balances = await leaveBalanceService.getEmployeeLeaveBalance(
            employee_id,
            leave_cycle_year ? parseInt(leave_cycle_year) : null
        );

        return sendSuccess(res, 'Leave balance fetched successfully', { balances });
    } catch (error) {
        next(error);
    }
};

/**
 * Process leave transaction (credit, debit, reverse, etc.)
 * POST /api/leave-balance/transaction
 * Body: { transaction_type, employee_id, leave_type_id, leave_cycle_year, amount, reference_type, reference_id, remarks, original_transaction_id }
 */
const processLeaveTransaction = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const { transaction_type } = req.body;

        let result;
        let message;

        switch (transaction_type) {
            case 'credit':
            case 'adjustment_credit':
            case 'carry_forward':
                result = await leaveBalanceService.creditLeaves({
                    ...req.body,
                    created_by: user_id
                });
                message = 'Leaves credited successfully';
                break;

            case 'debit':
            case 'adjustment_debit':
            case 'penalty':
            case 'encashment':
            case 'lapse':
                result = await leaveBalanceService.debitLeaves({
                    ...req.body,
                    created_by: user_id
                });
                message = 'Leaves debited successfully';
                break;

            case 'reversal':
                const { original_transaction_id } = req.body;
                if (!original_transaction_id) {
                    return res.status(400).json({
                        success: false,
                        message: 'original_transaction_id is required for reversal'
                    });
                }
                result = await leaveBalanceService.reverseLeaveTransaction(
                    original_transaction_id,
                    user_id
                );
                message = 'Leave transaction reversed successfully';
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid transaction_type. Valid types: credit, debit, adjustment_credit, adjustment_debit, carry_forward, encashment, lapse, reversal, penalty'
                });
        }

        return sendSuccess(res, message, result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get saved leave balance from HrmsEmployeeLeaveBalance table
 * GET /api/leave-balance/saved/:employeeId
 */
const getSavedLeaveBalance = async (req, res, next) => {
    try {
        const employee_id = parseInt(req.params.employeeId);
        const { leave_cycle_year, year, month } = req.query;

        const balances = await leaveBalanceService.getSavedLeaveBalance(
            employee_id,
            leave_cycle_year ? parseInt(leave_cycle_year) : null,
            year ? parseInt(year) : null,
            month ? parseInt(month) : null
        );

        return sendSuccess(res, 'Saved leave balance fetched successfully', { balances });
    } catch (error) {
        next(error);
    }
};

/**
 * Get leave ledger history
 * POST /api/leave-balance/ledger
 */
const getLeaveLedger = async (req, res, next) => {
    try {
        const employee_id = req.user.employee_id;
        const { leave_type_id, leave_cycle_year, reference_type, page_number, total_number_of_record } = req.body;

        const result = await leaveBalanceService.getEmployeeLeaveLedger(employee_id, {
            leave_type_id: leave_type_id ? parseInt(leave_type_id) : null,
            leave_cycle_year: leave_cycle_year ? parseInt(leave_cycle_year) : null,
            reference_type: reference_type || null,
            page_number: page_number || 1,
            total_number_of_record: total_number_of_record || 20
        });

        return sendSuccess(res, 'Leave ledger fetched successfully', result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEmployeeLeaveBalance,
    processLeaveTransaction,
    getSavedLeaveBalance,
    getLeaveLedger
};
