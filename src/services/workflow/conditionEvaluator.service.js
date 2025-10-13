/**
 * Conditional Logic Evaluator Service
 * Evaluates workflow conditions (IF/ELSE logic)
 */

const { HrmsWorkflowCondition, HrmsWorkflowConditionRule } = require('../../models/workflow');
const { Op } = require('sequelize');

/**
 * Evaluate all conditions for a workflow or stage
 * @param {number} workflowId - Workflow config ID
 * @param {number|null} stageId - Stage ID (NULL for global conditions)
 * @param {Object} context - Context data for evaluation
 * @returns {Promise<Object>} Evaluation result with action
 */
const evaluateConditions = async (workflowId, stageId = null, context) => {
    try {
        // Get all active conditions for this workflow/stage ordered by priority
        const conditions = await HrmsWorkflowCondition.findAll({
            where: {
                workflow_config_id: workflowId,
                stage_id: stageId,
                is_active: true
            },
            include: [{
                model: HrmsWorkflowConditionRule,
                as: 'rules',
                where: { is_active: true },
                required: true
            }],
            order: [['priority', 'ASC']]
        });

        if (!conditions || conditions.length === 0) {
            return {
                matched: false,
                action: 'continue',
                message: 'No conditions to evaluate'
            };
        }

        // Evaluate each condition in priority order
        for (const condition of conditions) {
            const result = await evaluateCondition(condition, context);

            if (result.matched) {
                return result;
            }
        }

        // No condition matched
        return {
            matched: false,
            action: 'continue',
            message: 'No conditions matched'
        };

    } catch (error) {
        console.error('Error evaluating conditions:', error);
        throw error;
    }
};

/**
 * Evaluate a single condition
 * @param {Object} condition - Condition object with rules
 * @param {Object} context - Context data
 * @returns {Promise<Object>} Evaluation result
 */
const evaluateCondition = async (condition, context) => {
    try {
        const rules = condition.rules || [];

        if (rules.length === 0) {
            return { matched: false, action: 'continue' };
        }

        // Evaluate all rules
        const ruleResults = [];
        for (const rule of rules) {
            const ruleResult = await evaluateRule(rule, context);
            ruleResults.push(ruleResult);
        }

        // Apply logic operator (AND/OR)
        let finalResult = false;

        if (condition.logic_operator === 'AND') {
            finalResult = ruleResults.every(r => r === true);
        } else { // OR
            finalResult = ruleResults.some(r => r === true);
        }

        // Return action based on result
        if (finalResult) {
            return {
                matched: true,
                conditionId: condition.id,
                conditionName: condition.condition_name,
                action: condition.action_type,
                targetStageId: condition.action_stage_id,
                approverType: condition.action_approver_type,
                customUserId: condition.action_custom_user_id,
                message: `Condition matched: ${condition.condition_name}`
            };
        } else {
            // Check else action
            if (condition.else_action_type && condition.else_action_type !== 'continue') {
                return {
                    matched: true,
                    conditionId: condition.id,
                    conditionName: condition.condition_name,
                    action: condition.else_action_type,
                    targetStageId: condition.else_stage_id,
                    message: `Condition not matched, executing else action: ${condition.else_action_type}`
                };
            }

            return { matched: false, action: 'continue' };
        }

    } catch (error) {
        console.error('Error evaluating condition:', error);
        throw error;
    }
};

/**
 * Evaluate a single rule
 * @param {Object} rule - Rule object
 * @param {Object} context - Context data
 * @returns {Promise<boolean>} Rule evaluation result
 */
const evaluateRule = async (rule, context) => {
    try {
        // Extract field value from context
        const fieldValue = extractFieldValue(rule.field_source, rule.field_name, context);

        // Get compare value
        let compareValue = rule.compare_value;

        if (rule.compare_value_type === 'field_reference') {
            compareValue = extractFieldValue(rule.compare_field_source, rule.compare_field_name, context);
        }

        // Compare values using operator
        const result = compareValues(fieldValue, rule.operator, compareValue, rule.field_type);

        console.log(`Rule evaluation: ${rule.field_name} ${rule.operator} ${compareValue} = ${result}`);

        return result;

    } catch (error) {
        console.error('Error evaluating rule:', error);
        return false;
    }
};

/**
 * Extract field value from context
 * @param {string} fieldSource - employee, request, leave_balance, custom
 * @param {string} fieldName - Field name
 * @param {Object} context - Context object
 * @returns {*} Field value
 */
const extractFieldValue = (fieldSource, fieldName, context) => {
    try {
        switch (fieldSource) {
            case 'employee':
                return context.employee?.[fieldName];

            case 'request':
                return context.request?.[fieldName];

            case 'leave_balance':
                return context.leaveBalance?.[fieldName];

            case 'custom':
                // Custom fields from request_data JSON
                return context.request?.request_data?.[fieldName];

            default:
                return null;
        }
    } catch (error) {
        console.error('Error extracting field value:', error);
        return null;
    }
};

/**
 * Compare two values using operator
 * @param {*} value1 - First value
 * @param {string} operator - Comparison operator
 * @param {*} value2 - Second value
 * @param {string} fieldType - Field type (string, number, etc.)
 * @returns {boolean} Comparison result
 */
const compareValues = (value1, operator, value2, fieldType) => {
    try {
        // Handle NULL checks first
        if (operator === 'IS NULL') {
            return value1 === null || value1 === undefined || value1 === '';
        }

        if (operator === 'IS NOT NULL') {
            return value1 !== null && value1 !== undefined && value1 !== '';
        }

        // If value1 is null/undefined for other operators, return false
        if (value1 === null || value1 === undefined) {
            return false;
        }

        // Convert values based on field type
        let val1 = value1;
        let val2 = value2;

        if (fieldType === 'number') {
            val1 = Number(value1);
            val2 = Number(value2);
        } else if (fieldType === 'string') {
            val1 = String(value1);
            val2 = String(value2);
        } else if (fieldType === 'boolean') {
            val1 = Boolean(value1);
            val2 = Boolean(value2);
        } else if (fieldType === 'date') {
            val1 = new Date(value1);
            val2 = new Date(value2);
        }

        // Perform comparison
        switch (operator) {
            case '=':
                return val1 == val2;

            case '!=':
                return val1 != val2;

            case '>':
                return val1 > val2;

            case '<':
                return val1 < val2;

            case '>=':
                return val1 >= val2;

            case '<=':
                return val1 <= val2;

            case 'IN': {
                const array = JSON.parse(val2);
                return Array.isArray(array) && array.includes(val1);
            }

            case 'NOT IN': {
                const array = JSON.parse(val2);
                return Array.isArray(array) && !array.includes(val1);
            }

            case 'CONTAINS':
                return String(val1).toLowerCase().includes(String(val2).toLowerCase());

            case 'NOT CONTAINS':
                return !String(val1).toLowerCase().includes(String(val2).toLowerCase());

            default:
                console.warn(`Unknown operator: ${operator}`);
                return false;
        }

    } catch (error) {
        console.error('Error comparing values:', error);
        return false;
    }
};

/**
 * Test a condition with sample data (for testing/preview)
 * @param {number} conditionId - Condition ID
 * @param {Object} testData - Sample test data
 * @returns {Promise<Object>} Test result
 */
const testCondition = async (conditionId, testData) => {
    try {
        const condition = await HrmsWorkflowCondition.findByPk(conditionId, {
            include: [{
                model: HrmsWorkflowConditionRule,
                as: 'rules',
                where: { is_active: true }
            }]
        });

        if (!condition) {
            throw new Error('Condition not found');
        }

        const result = await evaluateCondition(condition, testData);

        return {
            success: true,
            conditionName: condition.condition_name,
            matched: result.matched,
            action: result.action,
            targetStageId: result.targetStageId,
            message: result.message,
            testData: testData
        };

    } catch (error) {
        console.error('Error testing condition:', error);
        throw error;
    }
};

module.exports = {
    evaluateConditions,
    evaluateCondition,
    evaluateRule,
    extractFieldValue,
    compareValues,
    testCondition
};
