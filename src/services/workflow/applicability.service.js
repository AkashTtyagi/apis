/**
 * Workflow Applicability Service
 * Determines which workflow is applicable for an employee
 *
 * PRIMARY APPLICABILITY (WHERE workflow applies):
 * - Company, Entity (Business Unit), Location, Level, Designation, Department, Sub department, Employee
 *
 * ADVANCED APPLICABILITY (Additional filter ON TOP of primary):
 * - None, Employee Type, Branch, Region
 *
 * PRIORITY HIERARCHY (Highest to Lowest):
 * 1. employee (Employee-specific)
 * 2. sub_department
 * 3. department
 * 4. designation
 * 5. level
 * 6. location
 * 7. entity (Business Unit)
 * 8. company
 *
 * RULES:
 * - If an employee is mapped with multiple rules, priority follows above order
 * - If multiple workflows of same type exist, latest (newest created_at) applies
 * - Advanced applicability adds additional filter on top of primary match
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
        'employee': 1,         // Highest priority - specific employees
        'sub_department': 2,
        'department': 3,
        'designation': 4,
        'level': 5,
        'location': 6,
        'entity': 7,           // Business Unit
        'company': 8,          // Lowest priority
        'grade': 9             // Additional type
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
                'designation_id', 'level_id', 'grade_id', 'location_id', 'employee_type_id',
                'branch_id', 'region_id'
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
 * Handles both primary and advanced applicability with comma-separated values
 * @param {Object} rule - Applicability rule
 * @param {Object} employee - Employee object
 * @returns {Promise<boolean>} True if matches
 */
const checkApplicabilityRule = async (rule, employee) => {
    try {
        // Helper function to check if employee value is in comma-separated list
        const isInList = (commaSeparatedValues, employeeValue) => {
            if (!commaSeparatedValues || !employeeValue) return false;
            const values = commaSeparatedValues.split(',').map(v => parseInt(v.trim()));
            return values.includes(parseInt(employeeValue));
        };

        // Step 1: Check PRIMARY applicability
        let primaryMatches = false;
        const applicabilityValue = rule.applicability_value;

        switch (rule.applicability_type) {
            case 'company':
                // For company type, if applicability_value is NULL, it applies to all employees in that company
                // Otherwise, check if employee's company_id is in the list
                if (!applicabilityValue || applicabilityValue === null) {
                    primaryMatches = (rule.company_id === employee.company_id);
                } else {
                    primaryMatches = isInList(applicabilityValue, employee.company_id);
                }
                break;

            case 'entity':
                primaryMatches = isInList(applicabilityValue, employee.entity_id);
                break;

            case 'location':
                primaryMatches = isInList(applicabilityValue, employee.location_id);
                break;

            case 'level':
                primaryMatches = isInList(applicabilityValue, employee.level_id);
                break;

            case 'designation':
                primaryMatches = isInList(applicabilityValue, employee.designation_id);
                break;

            case 'department':
                primaryMatches = isInList(applicabilityValue, employee.department_id);
                break;

            case 'sub_department':
                primaryMatches = isInList(applicabilityValue, employee.sub_department_id);
                break;

            case 'employee':
                primaryMatches = isInList(applicabilityValue, employee.id);
                break;

            case 'grade':
                primaryMatches = isInList(applicabilityValue, employee.grade_id);
                break;

            default:
                primaryMatches = false;
        }

        // If primary doesn't match, return false immediately
        if (!primaryMatches) {
            return false;
        }

        // Step 2: Check ADVANCED applicability (if specified)
        const advancedType = rule.advanced_applicability_type;
        const advancedValue = rule.advanced_applicability_value;

        // If advanced type is 'none' or not specified, primary match is enough
        if (!advancedType || advancedType === 'none') {
            return !rule.is_excluded ? primaryMatches : false;
        }

        // Check advanced applicability
        let advancedMatches = false;

        switch (advancedType) {
            case 'employee_type':
                advancedMatches = isInList(advancedValue, employee.employee_type_id);
                break;

            case 'branch':
                advancedMatches = isInList(advancedValue, employee.branch_id);
                break;

            case 'region':
                advancedMatches = isInList(advancedValue, employee.region_id);
                break;

            default:
                advancedMatches = false;
        }

        // Both primary AND advanced must match
        const finalMatch = primaryMatches && advancedMatches;

        // Handle exclusion logic
        return rule.is_excluded ? !finalMatch : finalMatch;

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
 * Uses new 4-column structure: applicability_type, applicability_value, advanced_applicability_type, advanced_applicability_value
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
            applicability_value,
            advanced_applicability_type,
            advanced_applicability_value,
            company_id,
            is_excluded,
            priority,
            created_by
        } = applicabilityData;

        // Helper function to convert array to comma-separated string
        const toCommaSeparated = (value) => {
            if (!value) return null;
            if (Array.isArray(value)) return value.join(',');
            return value.toString();
        };

        // Create new applicability rule with new structure
        const applicability = await HrmsWorkflowApplicability.create({
            workflow_config_id: workflowId,
            applicability_type,
            applicability_value: toCommaSeparated(applicability_value),
            advanced_applicability_type: advanced_applicability_type || 'none',
            advanced_applicability_value: toCommaSeparated(advanced_applicability_value),
            company_id: company_id || null,
            is_excluded: is_excluded || false,
            priority: priority || getBuiltInPriority(applicability_type),
            is_active: true,
            created_by: created_by || null
        }, { transaction });

        await transaction.commit();

        console.log(`✓ Applicability rule added to workflow ${workflowId}`);
        console.log(`  Primary: ${applicability_type} = ${applicability.applicability_value}`);
        if (advanced_applicability_type && advanced_applicability_type !== 'none') {
            console.log(`  Advanced: ${advanced_applicability_type} = ${advanced_applicability_value}`);
        }
        console.log(`  Priority: ${applicability.priority}`);

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
 * Uses new 4-column applicability structure with primary + advanced filters
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
                    is_deleted: 0
                },
                attributes: ['id']
            });
            return employees.map(e => e.id);
        }

        // Helper to convert comma-separated string to array of integers
        const toArray = (commaSeparatedValues) => {
            if (!commaSeparatedValues) return [];
            return commaSeparatedValues.split(',').map(v => parseInt(v.trim()));
        };

        // Get all employees and filter programmatically (since advanced filters are complex for SQL)
        const allEmployees = await HrmsEmployee.findAll({
            where: {
                company_id: workflow.company_id,
                is_deleted: 0
            },
            attributes: [
                'id', 'company_id', 'entity_id', 'department_id', 'sub_department_id',
                'designation_id', 'level_id', 'grade_id', 'location_id', 'employee_type_id',
                'branch_id', 'region_id'
            ],
            raw: true
        });

        const applicableEmployeeIds = new Set();

        // Check each employee against each rule
        for (const employee of allEmployees) {
            for (const rule of applicabilityRules) {
                const matches = await checkApplicabilityRule(rule, employee);
                if (matches) {
                    applicableEmployeeIds.add(employee.id);
                    break; // Employee matched, no need to check other rules
                }
            }
        }

        return Array.from(applicableEmployeeIds);

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
