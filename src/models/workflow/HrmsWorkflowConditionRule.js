/**
 * Workflow Condition Rule Model
 * Stores individual rules that make up a condition
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsWorkflowConditionRule = sequelize.define('HrmsWorkflowConditionRule', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    condition_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_workflow_conditions'
    },
    rule_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Order of rule evaluation'
    },
    field_source: {
        type: DataTypes.ENUM('employee', 'request', 'leave_balance', 'custom'),
        allowNull: false,
        comment: 'Source of field data'
    },
    field_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Field to check (e.g., designation, location, leave_type, available_balance)'
    },
    field_type: {
        type: DataTypes.ENUM('string', 'number', 'boolean', 'date', 'array'),
        allowNull: false,
        comment: 'Data type of field'
    },
    operator: {
        type: DataTypes.ENUM('=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'CONTAINS', 'NOT CONTAINS', 'IS NULL', 'IS NOT NULL'),
        allowNull: false,
        comment: 'Comparison operator'
    },
    compare_value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Value to compare against (JSON for arrays)'
    },
    compare_value_type: {
        type: DataTypes.ENUM('static', 'dynamic', 'field_reference'),
        allowNull: false,
        defaultValue: 'static',
        comment: 'Type of comparison value'
    },
    compare_field_source: {
        type: DataTypes.ENUM('employee', 'request', 'leave_balance', 'custom'),
        allowNull: true,
        comment: 'Source if comparing with another field'
    },
    compare_field_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Field name if comparing with another field'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'hrms_workflow_condition_rules',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_condition_id',
            fields: ['condition_id']
        },
        {
            name: 'idx_rule_order',
            fields: ['rule_order']
        }
    ]
});

HrmsWorkflowConditionRule.associate = (models) => {
    // Belongs to Condition
    HrmsWorkflowConditionRule.belongsTo(models.HrmsWorkflowCondition, {
        foreignKey: 'condition_id',
        as: 'condition'
    });
};

module.exports = { HrmsWorkflowConditionRule };
