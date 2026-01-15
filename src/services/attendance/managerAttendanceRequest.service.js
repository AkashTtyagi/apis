/**
 * Manager/Admin Attendance Request Service
 * Allows managers and admins to apply attendance requests on behalf of employees
 * Reuses existing services with role-based validation
 */

const leaveApplicationService = require('./leaveApplication.service');
const onDutyApplicationService = require('./onDutyApplication.service');
const wfhApplicationService = require('./wfhApplication.service');
const shortLeaveApplicationService = require('./shortLeaveApplication.service');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { validateLeaveRequest } = require('../../validations/attendance/leaveValidation');
const workflowExecutionService = require('../workflow/workflowExecution.service');
const moment = require('moment');

/**
 * Apply leave on behalf of employee (Manager/Admin)
 * @param {Object} leaveData - Leave application data
 * @param {number} target_employee_id - Employee ID for whom leave is being applied
 * @param {number} requester_user_id - Manager/Admin user ID
 * @param {number} requester_employee_id - Manager/Admin employee ID
 * @param {string} requester_role - 'manager' or 'admin'
 * @returns {Promise<Object>} Created leave request
 */
const applyLeaveOnBehalf = async (leaveData, target_employee_id, requester_user_id, requester_employee_id, requester_role = 'manager') => {
    // Validate target employee exists
    const targetEmployee = await HrmsEmployee.findByPk(target_employee_id, { raw: true });
    if (!targetEmployee) {
        throw new Error('Target employee not found');
    }

    // Validate requester
    const requester = await HrmsEmployee.findByPk(requester_employee_id, { raw: true });
    if (!requester) {
        throw new Error('Requester not found');
    }

    // TODO: Add manager-employee relationship check
    // if (requester_role === 'manager') {
    //     const isManager = await checkIfManager(requester_employee_id, target_employee_id);
    //     if (!isManager) {
    //         throw new Error('You can only apply leave for your direct reportees');
    //     }
    // }

    // Use existing leave application service with manager/admin role
    const result = await leaveApplicationService.applyLeave(leaveData, target_employee_id, requester_user_id, requester_role);

    return result;
};

/**
 * Apply on duty on behalf of employee (Manager/Admin)
 * @param {Object} onDutyData - On duty application data
 * @param {number} target_employee_id - Employee ID
 * @param {number} requester_user_id - Manager/Admin user ID
 * @param {number} requester_employee_id - Manager/Admin employee ID
 * @param {string} requester_role - 'manager' or 'admin'
 * @returns {Promise<Object>} Created on duty request
 */
const applyOnDutyOnBehalf = async (onDutyData, target_employee_id, requester_user_id, requester_employee_id, requester_role = 'manager') => {
    // Validate target employee exists
    const targetEmployee = await HrmsEmployee.findByPk(target_employee_id, { raw: true });
    if (!targetEmployee) {
        throw new Error('Target employee not found');
    }

    // Use existing on duty application service
    const result = await onDutyApplicationService.applyOnDuty(onDutyData, target_employee_id, requester_user_id);

    return result;
};

/**
 * Apply WFH on behalf of employee (Manager/Admin)
 * @param {Object} wfhData - WFH application data
 * @param {number} target_employee_id - Employee ID
 * @param {number} requester_user_id - Manager/Admin user ID
 * @param {number} requester_employee_id - Manager/Admin employee ID
 * @param {string} requester_role - 'manager' or 'admin'
 * @returns {Promise<Object>} Created WFH request
 */
const applyWFHOnBehalf = async (wfhData, target_employee_id, requester_user_id, requester_employee_id, requester_role = 'manager') => {
    // Validate target employee exists
    const targetEmployee = await HrmsEmployee.findByPk(target_employee_id, { raw: true });
    if (!targetEmployee) {
        throw new Error('Target employee not found');
    }

    // Use existing WFH application service
    const result = await wfhApplicationService.applyWFH(wfhData, target_employee_id, requester_user_id);

    return result;
};

/**
 * Apply short leave on behalf of employee (Manager/Admin)
 * @param {Object} shortLeaveData - Short leave application data
 * @param {number} target_employee_id - Employee ID
 * @param {number} requester_user_id - Manager/Admin user ID
 * @param {number} requester_employee_id - Manager/Admin employee ID
 * @param {string} requester_role - 'manager' or 'admin'
 * @returns {Promise<Object>} Created short leave request
 */
const applyShortLeaveOnBehalf = async (shortLeaveData, target_employee_id, requester_user_id, requester_employee_id, requester_role = 'manager') => {
    // Validate target employee exists
    const targetEmployee = await HrmsEmployee.findByPk(target_employee_id, { raw: true });
    if (!targetEmployee) {
        throw new Error('Target employee not found');
    }

    // Use existing short leave application service
    const result = await shortLeaveApplicationService.applyShortLeave(shortLeaveData, target_employee_id, requester_user_id);

    return result;
};

/**
 * Apply regularization on behalf of employee (Manager/Admin)
 * @param {Object} regularizationData - Regularization application data
 * @param {number} target_employee_id - Employee ID
 * @param {number} requester_user_id - Manager/Admin user ID
 * @param {number} requester_employee_id - Manager/Admin employee ID
 * @param {string} requester_role - 'manager' or 'admin'
 * @returns {Promise<Object>} Created regularization request
 */
const applyRegularizationOnBehalf = async (regularizationData, target_employee_id, requester_user_id, requester_employee_id, requester_role = 'manager') => {
    // Validate target employee exists
    const targetEmployee = await HrmsEmployee.findByPk(target_employee_id, { raw: true });
    if (!targetEmployee) {
        throw new Error('Target employee not found');
    }

    const {
        attendance_date,
        punch_in,
        punch_out,
        reason,
        attachment
    } = regularizationData;

    // Validation
    if (!attendance_date || !reason) {
        throw new Error('Required fields: attendance_date, reason');
    }

    if (!punch_in && !punch_out) {
        throw new Error('At least one of punch_in or punch_out is required');
    }

    // Validate date is not future
    if (moment(attendance_date).isAfter(moment(), 'day')) {
        throw new Error('Cannot apply regularization for future dates');
    }

    // Calculate working hours
    let working_hours = null;
    if (punch_in && punch_out) {
        const start = moment(punch_in);
        const end = moment(punch_out);
        working_hours = end.diff(start, 'hours', true);
    }

    // Prepare request data
    const requestData = {
        attendance_date,
        punch_in: punch_in || null,
        punch_out: punch_out || null,
        working_hours,
        reason,
        attachment: attachment || null,
        applied_at: new Date(),
        applied_by_role: requester_role
    };

    // Submit workflow request (workflow_master_id = 4 for Regularization)
    const request = await workflowExecutionService.submitRequest(
        target_employee_id,
        4,  // workflow_master_id for Regularization
        requestData,
        requester_user_id  // submittedBy
    );

    return {
        request,
        attendance_date,
        punch_in,
        punch_out,
        working_hours
    };
};

/**
 * Get leave balance for an employee (Manager/Admin view)
 * @param {number} employee_id - Employee ID
 * @returns {Promise<Object>} Leave balance
 */
const getEmployeeLeaveBalance = async (employee_id) => {
    // Validate employee exists
    const employee = await HrmsEmployee.findByPk(employee_id);
    if (!employee) {
        throw new Error('Employee not found');
    }

    // Use existing leave application service
    const result = await leaveApplicationService.getLeaveBalance(employee_id);

    return result;
};

module.exports = {
    applyLeaveOnBehalf,
    applyOnDutyOnBehalf,
    applyWFHOnBehalf,
    applyShortLeaveOnBehalf,
    applyRegularizationOnBehalf,
    getEmployeeLeaveBalance
};
