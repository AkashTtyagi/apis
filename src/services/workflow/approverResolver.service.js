/**
 * Approver Resolver Service
 * Resolves approvers based on type (RM, HOD, HR_ADMIN, etc.)
 */

const { HrmsWorkflowStageApprover } = require('../../models/workflow');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { evaluateCondition } = require('./conditionEvaluator.service');

/**
 * Resolve all approvers for a stage
 * @param {number} stageId - Stage ID
 * @param {number} employeeId - Employee ID
 * @param {Object} context - Context for conditional approvers
 * @returns {Promise<Array>} Array of approver objects
 */
const resolveStageApprovers = async (stageId, employeeId, context = {}) => {
    try {
        // Get all approvers configured for this stage
        const stageApprovers = await HrmsWorkflowStageApprover.findAll({
            where: {
                stage_id: stageId,
                is_active: true
            },
            order: [['approver_order', 'ASC']]
        });

        if (!stageApprovers || stageApprovers.length === 0) {
            throw new Error('No approvers configured for this stage');
        }

        const resolvedApprovers = [];

        for (const approverConfig of stageApprovers) {
            // Check if this is a conditional approver
            if (approverConfig.has_condition && approverConfig.condition_id) {
                const condition = await HrmsWorkflowCondition.findByPk(approverConfig.condition_id, {
                    include: ['rules']
                });

                const conditionResult = await evaluateCondition(condition, context);

                if (!conditionResult.matched) {
                    console.log(`Skipping conditional approver - condition not matched`);
                    continue;
                }
            }

            // Resolve approver user based on type
            const approver = await resolveApproverUser(approverConfig.approver_type, employeeId, approverConfig);

            if (approver) {
                resolvedApprovers.push({
                    user_id: approver.user_id,
                    approver_type: approverConfig.approver_type,
                    order: approverConfig.approver_order,
                    allow_delegation: approverConfig.allow_delegation,
                    user_name: approver.user_name,
                    user_email: approver.user_email
                });
            }
        }

        if (resolvedApprovers.length === 0) {
            throw new Error('No approvers could be resolved for this stage');
        }

        console.log(`✓ Resolved ${resolvedApprovers.length} approver(s) for stage ${stageId}`);

        return resolvedApprovers;

    } catch (error) {
        console.error('Error resolving stage approvers:', error);
        throw error;
    }
};

/**
 * Resolve approver user based on approver type
 * @param {string} approverType - Type of approver
 * @param {number} employeeId - Employee ID
 * @param {Object} config - Approver config
 * @returns {Promise<Object>} Approver user object
 */
const resolveApproverUser = async (approverType, employeeId, config = {}) => {
    try {
        let approverUser = null;

        switch (approverType) {
            case 'RM':
                approverUser = await resolveRM(employeeId);
                break;

            case 'RM_OF_RM':
                approverUser = await resolveRMOfRM(employeeId);
                break;

            case 'HR_ADMIN':
                const employee = await HrmsEmployee.findByPk(employeeId);
                approverUser = await resolveHRAdmin(employee.company_id);
                break;

            case 'HOD':
                approverUser = await resolveHOD(employeeId);
                break;

            case 'FUNCTIONAL_HEAD':
                approverUser = await resolveFunctionalHead(employeeId);
                break;

            case 'SUB_ADMIN':
                const emp = await HrmsEmployee.findByPk(employeeId);
                approverUser = await resolveSubAdmin(emp.company_id);
                break;

            case 'SECONDARY_RM':
                approverUser = await resolveSecondaryRM(employeeId);
                break;

            case 'SELF':
                approverUser = await resolveSelf(employeeId);
                break;

            case 'CUSTOM_USER':
                if (!config.custom_user_id) {
                    throw new Error('Custom user ID not specified');
                }
                approverUser = await resolveCustomUser(config.custom_user_id);
                break;

            case 'AUTO_APPROVE':
                // Auto approve doesn't need a user
                approverUser = {
                    user_id: null,
                    user_name: 'System (Auto Approve)',
                    user_email: null
                };
                break;

            default:
                throw new Error(`Unknown approver type: ${approverType}`);
        }

        return approverUser;

    } catch (error) {
        console.error(`Error resolving approver type ${approverType}:`, error);
        throw error;
    }
};

/**
 * Resolve Reporting Manager (RM)
 * @param {number} employeeId - Employee ID
 * @returns {Promise<Object>} RM user object
 */
const resolveRM = async (employeeId) => {
    try {
        const employee = await HrmsEmployee.findByPk(employeeId, {
            attributes: ['id', 'reporting_manager_id']
        });

        if (!employee || !employee.reporting_manager_id) {
            throw new Error('No reporting manager found for this employee');
        }

        const rm = await HrmsEmployee.findByPk(employee.reporting_manager_id, {
            attributes: ['id', 'user_id', 'first_name', 'last_name', 'email']
        });

        if (!rm) {
            throw new Error('Reporting manager record not found');
        }

        return {
            user_id: rm.user_id,
            user_name: `${rm.first_name} ${rm.last_name}`,
            user_email: rm.email
        };

    } catch (error) {
        console.error('Error resolving RM:', error);
        throw error;
    }
};

/**
 * Resolve RM's Reporting Manager (RM of RM)
 * @param {number} employeeId - Employee ID
 * @returns {Promise<Object>} RM's RM user object
 */
const resolveRMOfRM = async (employeeId) => {
    try {
        const employee = await HrmsEmployee.findByPk(employeeId, {
            attributes: ['reporting_manager_id']
        });

        if (!employee || !employee.reporting_manager_id) {
            throw new Error('No reporting manager found');
        }

        const rm = await HrmsEmployee.findByPk(employee.reporting_manager_id, {
            attributes: ['reporting_manager_id']
        });

        if (!rm || !rm.reporting_manager_id) {
            throw new Error('RM does not have a reporting manager');
        }

        const rmOfRM = await HrmsEmployee.findByPk(rm.reporting_manager_id, {
            attributes: ['id', 'user_id', 'first_name', 'last_name', 'email']
        });

        if (!rmOfRM) {
            throw new Error('RM of RM record not found');
        }

        return {
            user_id: rmOfRM.user_id,
            user_name: `${rmOfRM.first_name} ${rmOfRM.last_name}`,
            user_email: rmOfRM.email
        };

    } catch (error) {
        console.error('Error resolving RM of RM:', error);
        throw error;
    }
};

/**
 * Resolve Head of Department (HOD)
 * @param {number} employeeId - Employee ID
 * @returns {Promise<Object>} HOD user object
 */
const resolveHOD = async (employeeId) => {
    try {
        const employee = await HrmsEmployee.findByPk(employeeId, {
            attributes: ['department_id']
        });

        if (!employee || !employee.department_id) {
            throw new Error('Employee department not found');
        }

        // Find HOD for this department
        // Assuming there's a field is_hod or role that identifies HOD
        const hod = await HrmsEmployee.findOne({
            where: {
                department_id: employee.department_id,
                is_hod: true, // Assuming this field exists
                is_active: true
            },
            attributes: ['id', 'user_id', 'first_name', 'last_name', 'email']
        });

        if (!hod) {
            throw new Error('No HOD found for this department');
        }

        return {
            user_id: hod.user_id,
            user_name: `${hod.first_name} ${hod.last_name}`,
            user_email: hod.email
        };

    } catch (error) {
        console.error('Error resolving HOD:', error);
        throw error;
    }
};

/**
 * Resolve Functional Head
 * @param {number} employeeId - Employee ID
 * @returns {Promise<Object>} Functional Head user object
 */
const resolveFunctionalHead = async (employeeId) => {
    try {
        const employee = await HrmsEmployee.findByPk(employeeId, {
            attributes: ['department_id', 'company_id']
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        // Find Functional Head for this department/function
        const functionalHead = await HrmsEmployee.findOne({
            where: {
                company_id: employee.company_id,
                department_id: employee.department_id,
                is_functional_head: true, // Assuming this field exists
                is_active: true
            },
            attributes: ['id', 'user_id', 'first_name', 'last_name', 'email']
        });

        if (!functionalHead) {
            throw new Error('No Functional Head found');
        }

        return {
            user_id: functionalHead.user_id,
            user_name: `${functionalHead.first_name} ${functionalHead.last_name}`,
            user_email: functionalHead.email
        };

    } catch (error) {
        console.error('Error resolving Functional Head:', error);
        throw error;
    }
};

/**
 * Resolve HR Admin
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} HR Admin user object
 */
const resolveHRAdmin = async (companyId) => {
    try {
        // Find HR Admin for this company
        // Assuming there's a role field or is_hr_admin flag
        const hrAdmin = await HrmsEmployee.findOne({
            where: {
                company_id: companyId,
                is_hr_admin: true, // Assuming this field exists
                is_active: true
            },
            attributes: ['id', 'user_id', 'first_name', 'last_name', 'email']
        });

        if (!hrAdmin) {
            throw new Error('No HR Admin found for this company');
        }

        return {
            user_id: hrAdmin.user_id,
            user_name: `${hrAdmin.first_name} ${hrAdmin.last_name}`,
            user_email: hrAdmin.email
        };

    } catch (error) {
        console.error('Error resolving HR Admin:', error);
        throw error;
    }
};

/**
 * Resolve Sub Admin
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Sub Admin user object
 */
const resolveSubAdmin = async (companyId) => {
    try {
        const subAdmin = await HrmsEmployee.findOne({
            where: {
                company_id: companyId,
                is_sub_admin: true, // Assuming this field exists
                is_active: true
            },
            attributes: ['id', 'user_id', 'first_name', 'last_name', 'email']
        });

        if (!subAdmin) {
            throw new Error('No Sub Admin found for this company');
        }

        return {
            user_id: subAdmin.user_id,
            user_name: `${subAdmin.first_name} ${subAdmin.last_name}`,
            user_email: subAdmin.email
        };

    } catch (error) {
        console.error('Error resolving Sub Admin:', error);
        throw error;
    }
};

/**
 * Resolve Secondary Reporting Manager
 * @param {number} employeeId - Employee ID
 * @returns {Promise<Object>} Secondary RM user object
 */
const resolveSecondaryRM = async (employeeId) => {
    try {
        const employee = await HrmsEmployee.findByPk(employeeId, {
            attributes: ['secondary_reporting_manager_id']
        });

        if (!employee || !employee.secondary_reporting_manager_id) {
            throw new Error('No secondary reporting manager found');
        }

        const secondaryRM = await HrmsEmployee.findByPk(employee.secondary_reporting_manager_id, {
            attributes: ['id', 'user_id', 'first_name', 'last_name', 'email']
        });

        if (!secondaryRM) {
            throw new Error('Secondary RM record not found');
        }

        return {
            user_id: secondaryRM.user_id,
            user_name: `${secondaryRM.first_name} ${secondaryRM.last_name}`,
            user_email: secondaryRM.email
        };

    } catch (error) {
        console.error('Error resolving Secondary RM:', error);
        throw error;
    }
};

/**
 * Resolve Self (employee themselves)
 * @param {number} employeeId - Employee ID
 * @returns {Promise<Object>} Employee user object
 */
const resolveSelf = async (employeeId) => {
    try {
        const employee = await HrmsEmployee.findByPk(employeeId, {
            attributes: ['id', 'user_id', 'first_name', 'last_name', 'email']
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        return {
            user_id: employee.user_id,
            user_name: `${employee.first_name} ${employee.last_name}`,
            user_email: employee.email
        };

    } catch (error) {
        console.error('Error resolving Self:', error);
        throw error;
    }
};

/**
 * Resolve Custom User
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Custom user object
 */
const resolveCustomUser = async (userId) => {
    try {
        const employee = await HrmsEmployee.findOne({
            where: { user_id: userId, is_active: true },
            attributes: ['id', 'user_id', 'first_name', 'last_name', 'email']
        });

        if (!employee) {
            throw new Error(`Custom user not found: ${userId}`);
        }

        return {
            user_id: employee.user_id,
            user_name: `${employee.first_name} ${employee.last_name}`,
            user_email: employee.email
        };

    } catch (error) {
        console.error('Error resolving Custom User:', error);
        throw error;
    }
};

module.exports = {
    resolveStageApprovers,
    resolveApproverUser,
    resolveRM,
    resolveRMOfRM,
    resolveHOD,
    resolveFunctionalHead,
    resolveHRAdmin,
    resolveSubAdmin,
    resolveSecondaryRM,
    resolveSelf,
    resolveCustomUser
};
