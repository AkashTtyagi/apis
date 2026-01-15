/**
 * Leave Validation
 * Shared validation logic based on HrmsLeaveMaster configuration
 * Used by employee, manager, and admin attendance request APIs
 */

const { HrmsLeaveMaster } = require('../../models/HrmsLeaveMaster');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsWorkflowRequest } = require('../../models/workflow');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Validate leave request based on HrmsLeaveMaster configuration
 * @param {Object} params - Validation parameters
 * @param {string} params.leave_type - Leave type code (e.g., 'CL', 'SL', 'EL')
 * @param {number} params.employee_id - Employee ID
 * @param {number} params.company_id - Company ID
 * @param {string} params.from_date - Start date (YYYY-MM-DD)
 * @param {string} params.to_date - End date (YYYY-MM-DD)
 * @param {Array} params.specific_dates - Specific dates array (optional)
 * @param {number} params.duration - Leave duration in days
 * @param {string} params.requested_by_role - Role: 'employee', 'manager', 'admin'
 * @param {string} params.attachment - Attachment URL (optional)
 * @returns {Promise<Object>} Validation result with leave master configuration
 */
const validateLeaveRequest = async (params) => {
    const {
        leave_type,
        employee_id,
        company_id,
        from_date,
        to_date,
        specific_dates,
        duration,
        requested_by_role = 'employee',
        attachment
    } = params;

    // Get leave master configuration
    const leaveMaster = await HrmsLeaveMaster.findOne({
        where: {
            company_id: company_id,
            leave_code: leave_type,
            is_active: true
        },
        raw: true
    });

    if (!leaveMaster) {
        throw new Error(`Leave type '${leave_type}' not found or not active`);
    }

    // Get employee details
    const employee = await HrmsEmployee.findByPk(employee_id, {
        attributes: ['id', 'employee_code', 'first_name', 'last_name', 'gender',
                     'status', 'date_of_joining', 'company_id'],
        raw: true
    });

    if (!employee) {
        throw new Error('Employee not found');
    }

    // 1. Check if employee can request this leave type
    if (requested_by_role === 'employee' && !leaveMaster.can_employee_request) {
        throw new Error(`${leaveMaster.leave_name} cannot be requested by employees. Please contact your manager or HR.`);
    }

    // 2. Check gender eligibility
    if (leaveMaster.applicable_to_gender !== 'all') {
        if (employee.gender !== leaveMaster.applicable_to_gender) {
            throw new Error(`${leaveMaster.leave_name} is only applicable to ${leaveMaster.applicable_to_gender} employees`);
        }
    }

    // 3. Check ESI eligibility
    // Note: esi_applicable field not in employee model - skip ESI validation for now
    // TODO: Add esi_applicable column to hrms_employees if ESI-based leave rules are needed

    // 4. Check employee status eligibility
    const applicableStatuses = leaveMaster.applicable_to_status.split(',').map(s => s.trim());
    if (!applicableStatuses.includes('all') && !applicableStatuses.includes(String(employee.status))) {
        throw new Error(`${leaveMaster.leave_name} is not applicable to your current employment status`);
    }

    // 5. Check marital status (for leaves that require married status)
    // Note: marital_status field not in employee model - skip marital validation for now
    // TODO: Add marital_status column to hrms_employees if marriage-based leave rules are needed

    // 6. Check joining period restriction
    if (leaveMaster.restrict_after_joining_period !== 'no_restriction' && employee.date_of_joining) {
        const joiningDate = moment(employee.date_of_joining);
        const today = moment();
        const monthsSinceJoining = today.diff(joiningDate, 'months', true);

        switch (leaveMaster.restrict_after_joining_period) {
            case 'exclude_joining_month':
                if (monthsSinceJoining < 1) {
                    throw new Error(`${leaveMaster.leave_name} cannot be applied in the joining month`);
                }
                break;
            case 'exclude_first_3_months':
                if (monthsSinceJoining < 3) {
                    throw new Error(`${leaveMaster.leave_name} cannot be applied in the first 3 months of joining`);
                }
                break;
            case 'exclude_probation_period':
                // status: 1 = Probation (from hrms_employee_status_master)
                if (employee.status === 1) {
                    throw new Error(`${leaveMaster.leave_name} cannot be applied during probation period`);
                }
                break;
        }
    }

    // 7. Check minimum leaves per request
    if (duration < leaveMaster.min_leaves_per_request) {
        throw new Error(
            `Minimum ${leaveMaster.min_leaves_per_request} day(s) required for ${leaveMaster.leave_name}. ` +
            `You are requesting ${duration} day(s).`
        );
    }

    // 8. Check maximum continuous leave
    if (leaveMaster.max_continuous_leave && duration > leaveMaster.max_continuous_leave) {
        throw new Error(
            `Maximum ${leaveMaster.max_continuous_leave} continuous days allowed for ${leaveMaster.leave_name}. ` +
            `You are requesting ${duration} day(s).`
        );
    }

    // 9. Check backdate/future date restrictions
    const requestStartDate = moment(from_date);
    const today = moment().startOf('day');

    if (requested_by_role === 'employee') {
        // Employee restrictions
        if (requestStartDate.isBefore(today)) {
            if (!leaveMaster.backdated_leave_allowed) {
                throw new Error(`Backdated ${leaveMaster.leave_name} requests are not allowed`);
            }
            if (leaveMaster.days_allowed_for_backdated_leave) {
                const daysDiff = today.diff(requestStartDate, 'days');
                if (daysDiff > leaveMaster.days_allowed_for_backdated_leave) {
                    throw new Error(
                        `Backdated ${leaveMaster.leave_name} can only be applied for up to ` +
                        `${leaveMaster.days_allowed_for_backdated_leave} days in the past`
                    );
                }
            }
        }

        if (requestStartDate.isAfter(today) && !leaveMaster.future_dated_leave_allowed) {
            throw new Error(`Future dated ${leaveMaster.leave_name} requests are not allowed`);
        }
    }

    if (requested_by_role === 'manager') {
        // Manager restrictions
        if (requestStartDate.isBefore(today)) {
            if (!leaveMaster.manager_can_apply_backdated) {
                throw new Error(`Managers cannot apply backdated ${leaveMaster.leave_name} requests`);
            }
            if (leaveMaster.days_allowed_manager_backdated) {
                const daysDiff = today.diff(requestStartDate, 'days');
                if (daysDiff > leaveMaster.days_allowed_manager_backdated) {
                    throw new Error(
                        `Managers can apply backdated ${leaveMaster.leave_name} for up to ` +
                        `${leaveMaster.days_allowed_manager_backdated} days in the past`
                    );
                }
            }
        }

        if (requestStartDate.isAfter(today) && !leaveMaster.manager_can_apply_future_dated) {
            throw new Error(`Managers cannot apply future dated ${leaveMaster.leave_name} requests`);
        }
    }

    // Admin has no date restrictions

    // 10. Check document requirement
    if (leaveMaster.document_required && !attachment) {
        throw new Error(`${leaveMaster.leave_name} requires document attachment`);
    }

    // 11. Check for duplicate/overlapping leave on same dates
    // Get the leave_mode from params (passed from service layer)
    const requestedLeaveMode = params.leave_mode || 'full_day';

    const requestedDates = [];
    if (specific_dates && specific_dates.length > 0) {
        // Multiple dates mode
        specific_dates.forEach(item => {
            const date = typeof item === 'string' ? item : item.date;
            const dayType = typeof item === 'string' ? 'full_day' : (item.day_type || 'full_day');
            requestedDates.push({ date, day_type: dayType });
        });
    } else if (from_date && to_date) {
        // Date range mode - generate all dates in range
        let currentDate = moment(from_date);
        const endDate = moment(to_date);
        while (currentDate.isSameOrBefore(endDate)) {
            requestedDates.push({
                date: currentDate.format('YYYY-MM-DD'),
                day_type: requestedLeaveMode
            });
            currentDate.add(1, 'day');
        }
    }

    if (requestedDates.length > 0) {
        // Check for existing leave requests on these dates
        const existingRequests = await HrmsWorkflowRequest.findAll({
            where: {
                employee_id: employee_id,
                workflow_master_id: 1, // Leave workflow
                request_status: {
                    [Op.in]: ['pending', 'approved', 'submitted', 'in_progress']
                },
                [Op.or]: [
                    // Date range overlaps with requested dates
                    {
                        from_date: { [Op.lte]: to_date || from_date },
                        to_date: { [Op.gte]: from_date }
                    }
                ]
            },
            attributes: ['id', 'request_number', 'from_date', 'to_date', 'request_data'],
            raw: true
        });

        // Check for date overlap considering half-day scenarios
        for (const existingReq of existingRequests) {
            const existingFrom = moment(existingReq.from_date);
            const existingTo = moment(existingReq.to_date);
            const existingLeaveMode = existingReq.request_data?.leave_mode || 'full_day';

            for (const reqDateObj of requestedDates) {
                const checkDate = moment(reqDateObj.date);
                const newLeaveMode = reqDateObj.day_type;

                if (checkDate.isBetween(existingFrom, existingTo, 'day', '[]')) {
                    // Check if it's a half-day conflict
                    // Allow: first_half + second_half on same day
                    // Block: full_day + any, first_half + first_half, second_half + second_half

                    const isHalfDayConflict = (
                        existingLeaveMode === 'full_day' ||
                        newLeaveMode === 'full_day' ||
                        existingLeaveMode === newLeaveMode
                    );

                    if (isHalfDayConflict) {
                        const conflictMsg = existingLeaveMode !== 'full_day'
                            ? ` (${existingLeaveMode})`
                            : '';
                        throw new Error(
                            `Leave already applied for ${reqDateObj.date}${conflictMsg}. ` +
                            `Existing request: ${existingReq.request_number}`
                        );
                    }
                }
            }
        }
    }

    // 12. Check max requests per month
    if (leaveMaster.max_requests_per_month) {
        const currentMonth = moment(from_date).format('YYYY-MM');
        const requestsThisMonth = await HrmsWorkflowRequest.count({
            where: {
                employee_id: employee_id,
                workflow_master_id: 1, // Leave workflow
                request_status: {
                    [Op.in]: ['pending', 'approved']
                },
                created_at: {
                    [Op.gte]: moment(currentMonth, 'YYYY-MM').startOf('month').toDate(),
                    [Op.lte]: moment(currentMonth, 'YYYY-MM').endOf('month').toDate()
                }
            }
        });

        if (requestsThisMonth >= leaveMaster.max_requests_per_month) {
            throw new Error(
                `Maximum ${leaveMaster.max_requests_per_month} ${leaveMaster.leave_name} requests per month allowed. ` +
                `You have already submitted ${requestsThisMonth} request(s) this month.`
            );
        }
    }

    // 12. Check max requests per tenure (for this specific leave type)
    if (leaveMaster.max_requests_per_tenure) {
        const requestsInTenure = await HrmsWorkflowRequest.count({
            where: {
                employee_id: employee_id,
                workflow_master_id: 1, // Leave workflow
                leave_type: leaveMaster.id, // Filter by specific leave type
                request_status: {
                    [Op.in]: ['pending', 'approved']
                }
            }
        });

        if (requestsInTenure >= leaveMaster.max_requests_per_tenure) {
            throw new Error(
                `Maximum ${leaveMaster.max_requests_per_tenure} ${leaveMaster.leave_name} requests allowed in entire tenure. ` +
                `You have already submitted ${requestsInTenure} request(s).`
            );
        }
    }

    // 13. Check max leaves per month (for this specific leave type)
    if (leaveMaster.max_leaves_per_month) {
        const monthStart = moment(from_date).startOf('month').format('YYYY-MM-DD');
        const monthEnd = moment(from_date).endOf('month').format('YYYY-MM-DD');

        const existingRequests = await HrmsWorkflowRequest.findAll({
            where: {
                employee_id: employee_id,
                workflow_master_id: 1,
                leave_type: leaveMaster.id,
                request_status: {
                    [Op.in]: ['pending', 'approved']
                },
                from_date: {
                    [Op.between]: [monthStart, monthEnd]
                }
            },
            raw: true
        });

        let totalLeavesThisMonth = duration;
        existingRequests.forEach(req => {
            if (req.request_data) {
                totalLeavesThisMonth += parseFloat(req.request_data.duration || 0);
            }
        });

        if (totalLeavesThisMonth > leaveMaster.max_leaves_per_month) {
            throw new Error(
                `Maximum ${leaveMaster.max_leaves_per_month} ${leaveMaster.leave_name} days per month allowed. ` +
                `You would have ${totalLeavesThisMonth} days this month.`
            );
        }
    }

    // 14. Check max leaves per year (for this specific leave type)
    if (leaveMaster.max_leaves_per_year) {
        const yearStart = moment(from_date).startOf('year').format('YYYY-MM-DD');
        const yearEnd = moment(from_date).endOf('year').format('YYYY-MM-DD');

        const existingRequests = await HrmsWorkflowRequest.findAll({
            where: {
                employee_id: employee_id,
                workflow_master_id: 1,
                leave_type: leaveMaster.id,
                request_status: {
                    [Op.in]: ['pending', 'approved']
                },
                from_date: {
                    [Op.between]: [yearStart, yearEnd]
                }
            },
            raw: true
        });

        let totalLeavesThisYear = duration;
        existingRequests.forEach(req => {
            if (req.request_data) {
                totalLeavesThisYear += parseFloat(req.request_data.duration || 0);
            }
        });

        if (totalLeavesThisYear > leaveMaster.max_leaves_per_year) {
            throw new Error(
                `Maximum ${leaveMaster.max_leaves_per_year} ${leaveMaster.leave_name} days per year allowed. ` +
                `You would have ${totalLeavesThisYear} days this year.`
            );
        }
    }

    // 15. Check if half day is allowed
    if (duration === 0.5 && !leaveMaster.can_request_half_day) {
        throw new Error(`Half day ${leaveMaster.leave_name} is not allowed`);
    }

    // Return validation success with leave master config
    return {
        valid: true,
        leaveMaster: leaveMaster,
        employee: employee
    };
};

module.exports = {
    validateLeaveRequest
};
