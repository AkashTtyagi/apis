/**
 * Workflow Applicability Service
 * Determines which workflow is applicable for an employee
 *
 * PRIORITY HIERARCHY (Highest to Lowest):
 * 1. custom_employee (Employee-specific)
 * 2. department
 * 3. designation
 * 4. level
 * 5. entity
 * 6. company
 *
 * RULES:
 * - If an employee is mapped with multiple rules, priority follows above order
 * - If same employee is tagged in multiple rules of same type, newest rule applies
 * - When creating new rule for same employee, older rules are automatically deactivated
 */

const { HrmsWorkflowConfig, HrmsWorkflowApplicability } = require('../../models/workflow');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { Op } = require('sequelize');

/**
 * Get built-in priority based on applicability type
 * Lower number = Higher priority
 * @param {string} applicabilityType - Applicability type
 * @returns {number} Priority value
 */
const getBuiltInPriority = (applicabilityType) => {
    const priorityMap = {
        'custom_employee': 1,  // Highest priority
        'department': 2,
        'designation': 3,
        'level': 4,
        'entity': 5,
        'company': 6,          // Lowest priority
        'sub_department': 7,   // Additional types
        'grade': 8,
        'location': 9
    };

    return priorityMap[applicabilityType] || 999;
};

/**
 * Find applicable workflow for an employee
 * @param {number} employeeId - Employee ID
 * @param {number} workflowMasterId - Workflow master ID
 * @returns {Promise<Object>} Applicable workflow config
 */
const findApplicableWorkflow = async (employeeId, workflowMasterId) => {
    try {
        // Get employee details
        const employee = await HrmsEmployee.findByPk(employeeId, {
            attributes: [
                'id', 'company_id', 'entity_id', 'department_id', 'sub_department_id',
                'designation_id', 'level_id', 'grade_id', 'location_id'
            ]
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        // Get all active workflows for this workflow master and company
        const workflows = await HrmsWorkflowConfig.findAll({
            where: {
                company_id: employee.company_id,
                workflow_master_id: workflowMasterId,
                is_active: true
            },
            include: [{
                model: HrmsWorkflowApplicability,
                as: 'applicability',
                where: { is_active: true },
                required: false,
                // Order by created_at DESC to get newest rules first for same type
                order: [['created_at', 'DESC']]
            }],
            order: [['is_default', 'DESC']] // Default workflows first
        });

        if (!workflows || workflows.length === 0) {
            throw new Error('No workflows configured for this workflow type');
        }

        // Find the most applicable workflow based on built-in priority hierarchy
        // Priority: Employee > Department > Designation > Level > Entity > Company
        let applicableWorkflow = null;
        let highestPriority = 999999;
        let matchedRuleType = null;

        for (const workflow of workflows) {
            const applicabilityRules = workflow.applicability || [];

            // If no applicability rules, this is a company-wide default (lowest priority)
            if (applicabilityRules.length === 0 && workflow.is_default) {
                const defaultPriority = 1000; // Lower than all specific rules
                if (defaultPriority < highestPriority) {
                    applicableWorkflow = workflow;
                    highestPriority = defaultPriority;
                    matchedRuleType = 'default';
                }
                continue;
            }

            // Check each applicability rule (already sorted by created_at DESC)
            for (const rule of applicabilityRules) {
                const matches = await checkApplicabilityRule(rule, employee);

                if (matches) {
                    // Get built-in priority based on applicability type
                    const builtInPriority = getBuiltInPriority(rule.applicability_type);

                    // Use built-in priority (if same priority, first one wins due to created_at DESC sort)
                    if (builtInPriority < highestPriority) {
                        applicableWorkflow = workflow;
                        highestPriority = builtInPriority;
                        matchedRuleType = rule.applicability_type;
                    }
                }
            }
        }

        if (!applicableWorkflow) {
            throw new Error('No applicable workflow found for this employee');
        }

        console.log(`✓ Found applicable workflow: ${applicableWorkflow.workflow_name} (Matched by: ${matchedRuleType})`);

        return applicableWorkflow;

    } catch (error) {
        console.error('Error finding applicable workflow:', error);
        throw error;
    }
};

/**
 * Check if an applicability rule matches the employee
 * @param {Object} rule - Applicability rule
 * @param {Object} employee - Employee object
 * @returns {Promise<boolean>} True if matches
 */
const checkApplicabilityRule = async (rule, employee) => {
    try {
        let matches = false;

        switch (rule.applicability_type) {
            case 'company':
                matches = rule.company_id === employee.company_id;
                break;

            case 'entity':
                matches = rule.entity_id === employee.entity_id;
                break;

            case 'department':
                matches = rule.department_id === employee.department_id;
                break;

            case 'sub_department':
                matches = rule.sub_department_id === employee.sub_department_id;
                break;

            case 'designation':
                matches = rule.designation_id === employee.designation_id;
                break;

            case 'level':
                matches = rule.level_id === employee.level_id;
                break;

            case 'grade':
                matches = rule.grade_id === employee.grade_id;
                break;

            case 'location':
                matches = rule.location_id === employee.location_id;
                break;

            case 'custom_employee':
                matches = rule.employee_id === employee.id;
                break;

            default:
                matches = false;
        }

        // Handle exclusion logic
        if (rule.is_excluded) {
            matches = !matches;
        }

        return matches;

    } catch (error) {
        console.error('Error checking applicability rule:', error);
        return false;
    }
};

/**
 * Check if a workflow is applicable to an employee
 * @param {number} workflowId - Workflow config ID
 * @param {number} employeeId - Employee ID
 * @returns {Promise<boolean>} True if applicable
 */
const checkApplicability = async (workflowId, employeeId) => {
    try {
        const employee = await HrmsEmployee.findByPk(employeeId, {
            attributes: [
                'id', 'company_id', 'entity_id', 'department_id', 'sub_department_id',
                'designation_id', 'level_id', 'grade_id', 'location_id'
            ]
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        const workflow = await HrmsWorkflowConfig.findByPk(workflowId, {
            include: [{
                model: HrmsWorkflowApplicability,
                as: 'applicability',
                where: { is_active: true },
                required: false
            }]
        });

        if (!workflow) {
            throw new Error('Workflow not found');
        }

        const applicabilityRules = workflow.applicability || [];

        // If no rules and is default, applicable to all
        if (applicabilityRules.length === 0 && workflow.is_default) {
            return true;
        }

        // Check each rule
        for (const rule of applicabilityRules) {
            const matches = await checkApplicabilityRule(rule, employee);
            if (matches) {
                return true;
            }
        }

        return false;

    } catch (error) {
        console.error('Error checking applicability:', error);
        throw error;
    }
};

/**
 * Add applicability rule to workflow
 * Auto-deactivates older rules for the same employee to ensure newest rule applies
 *
 * @param {number} workflowId - Workflow config ID
 * @param {Object} applicabilityData - Applicability data
 * @returns {Promise<Object>} Created applicability rule
 */
const addApplicability = async (workflowId, applicabilityData) => {
    const { sequelize } = require('../../utils/database');
    const transaction = await sequelize.transaction();

    try {
        const {
            applicability_type,
            company_id,
            entity_id,
            department_id,
            sub_department_id,
            designation_id,
            level_id,
            grade_id,
            location_id,
            employee_id,
            is_excluded,
            priority,
            created_by
        } = applicabilityData;

        // If this is a custom_employee rule, deactivate older rules for the same employee
        if (applicability_type === 'custom_employee' && employee_id) {
            const deactivatedCount = await HrmsWorkflowApplicability.update(
                { is_active: false },
                {
                    where: {
                        workflow_config_id: workflowId,
                        applicability_type: 'custom_employee',
                        employee_id: employee_id,
                        is_active: true
                    },
                    transaction
                }
            );

            if (deactivatedCount[0] > 0) {
                console.log(`✓ Deactivated ${deactivatedCount[0]} older rule(s) for employee ${employee_id}`);
            }
        }

        // Create new applicability rule
        const applicability = await HrmsWorkflowApplicability.create({
            workflow_config_id: workflowId,
            applicability_type,
            company_id: company_id || null,
            entity_id: entity_id || null,
            department_id: department_id || null,
            sub_department_id: sub_department_id || null,
            designation_id: designation_id || null,
            level_id: level_id || null,
            grade_id: grade_id || null,
            location_id: location_id || null,
            employee_id: employee_id || null,
            is_excluded: is_excluded || false,
            priority: priority || getBuiltInPriority(applicability_type), // Use built-in priority
            is_active: true,
            created_by: created_by || null
        }, { transaction });

        await transaction.commit();

        console.log(`✓ Applicability rule added to workflow ${workflowId} (Type: ${applicability_type}, Priority: ${applicability.priority})`);

        return applicability;

    } catch (error) {
        await transaction.rollback();
        console.error('Error adding applicability:', error);
        throw error;
    }
};

/**
 * Remove applicability rule
 * @param {number} applicabilityId - Applicability ID
 * @returns {Promise<void>}
 */
const removeApplicability = async (applicabilityId) => {
    try {
        await HrmsWorkflowApplicability.update(
            { is_active: false },
            { where: { id: applicabilityId } }
        );

        console.log(`✓ Applicability rule ${applicabilityId} removed`);

    } catch (error) {
        console.error('Error removing applicability:', error);
        throw error;
    }
};

/**
 * Get all applicability rules for a workflow
 * @param {number} workflowId - Workflow config ID
 * @returns {Promise<Array>} Applicability rules
 */
const getApplicabilityRules = async (workflowId) => {
    try {
        const rules = await HrmsWorkflowApplicability.findAll({
            where: {
                workflow_config_id: workflowId,
                is_active: true
            },
            order: [['priority', 'ASC']]
        });

        return rules;

    } catch (error) {
        console.error('Error getting applicability rules:', error);
        throw error;
    }
};

/**
 * Get all employees to whom a workflow is applicable
 * @param {number} workflowId - Workflow config ID
 * @returns {Promise<Array>} Employee IDs
 */
const getApplicableEmployees = async (workflowId) => {
    try {
        const workflow = await HrmsWorkflowConfig.findByPk(workflowId, {
            include: [{
                model: HrmsWorkflowApplicability,
                as: 'applicability',
                where: { is_active: true },
                required: false
            }]
        });

        if (!workflow) {
            throw new Error('Workflow not found');
        }

        const applicabilityRules = workflow.applicability || [];

        // If no rules and is default, return all employees of company
        if (applicabilityRules.length === 0 && workflow.is_default) {
            const employees = await HrmsEmployee.findAll({
                where: {
                    company_id: workflow.company_id,
                    is_active: true
                },
                attributes: ['id']
            });
            return employees.map(e => e.id);
        }

        // Build WHERE clause based on applicability rules
        const orConditions = [];

        for (const rule of applicabilityRules) {
            const condition = {};

            switch (rule.applicability_type) {
                case 'company':
                    condition.company_id = rule.company_id;
                    break;
                case 'entity':
                    condition.entity_id = rule.entity_id;
                    break;
                case 'department':
                    condition.department_id = rule.department_id;
                    break;
                case 'sub_department':
                    condition.sub_department_id = rule.sub_department_id;
                    break;
                case 'designation':
                    condition.designation_id = rule.designation_id;
                    break;
                case 'level':
                    condition.level_id = rule.level_id;
                    break;
                case 'grade':
                    condition.grade_id = rule.grade_id;
                    break;
                case 'location':
                    condition.location_id = rule.location_id;
                    break;
                case 'custom_employee':
                    condition.id = rule.employee_id;
                    break;
            }

            if (Object.keys(condition).length > 0) {
                if (rule.is_excluded) {
                    // For exclusion, we'll handle separately
                    // This is a simplified version
                } else {
                    orConditions.push(condition);
                }
            }
        }

        if (orConditions.length === 0) {
            return [];
        }

        const employees = await HrmsEmployee.findAll({
            where: {
                company_id: workflow.company_id,
                is_active: true,
                [Op.or]: orConditions
            },
            attributes: ['id']
        });

        return employees.map(e => e.id);

    } catch (error) {
        console.error('Error getting applicable employees:', error);
        throw error;
    }
};

module.exports = {
    findApplicableWorkflow,
    checkApplicabilityRule,
    checkApplicability,
    addApplicability,
    removeApplicability,
    getApplicabilityRules,
    getApplicableEmployees,
    getBuiltInPriority  // Export for use in other modules
};
