/**
 * Workflow Condition Model
 * Stores conditional logic (IF/ELSE) for workflow decisions
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsWorkflowCondition = sequelize.define('HrmsWorkflowCondition', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    workflow_config_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_workflow_config'
    },
    stage_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_workflow_stages (NULL if global condition)'
    },
    condition_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Descriptive name (e.g., Auto reject if balance < 10)'
    },
    condition_type: {
        type: DataTypes.ENUM('stage_routing', 'auto_action', 'approver_selection'),
        allowNull: false,
        comment: 'Type of condition'
    },
    logic_operator: {
        type: DataTypes.ENUM('AND', 'OR'),
        allowNull: false,
        defaultValue: 'AND',
        comment: 'Operator if multiple rules'
    },
    action_type: {
        type: DataTypes.ENUM('auto_approve', 'auto_reject', 'move_to_stage', 'skip_stage', 'assign_approver', 'notify'),
        allowNull: false,
        comment: 'Action on condition match'
    },
    action_stage_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Target stage if action = move_to_stage'
    },
    action_approver_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Approver type if action = assign_approver'
    },
    action_custom_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Custom user if action = assign_approver'
    },
    else_action_type: {
        type: DataTypes.ENUM('continue', 'auto_approve', 'auto_reject', 'move_to_stage', 'notify'),
        allowNull: false,
        defaultValue: 'continue',
        comment: 'Action if condition fails'
    },
    else_stage_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Stage for else action'
    },
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Execution priority (lower = higher priority)'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    }
}, {
    tableName: 'hrms_workflow_conditions',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_workflow_config_id',
            fields: ['workflow_config_id']
        },
        {
            name: 'idx_stage_id',
            fields: ['stage_id']
        },
        {
            name: 'idx_condition_type',
            fields: ['condition_type']
        },
        {
            name: 'idx_priority',
            fields: ['priority']
        }
    ]
});

HrmsWorkflowCondition.associate = (models) => {
    // Belongs to Workflow Config
    HrmsWorkflowCondition.belongsTo(models.HrmsWorkflowConfig, {
        foreignKey: 'workflow_config_id',
        as: 'workflowConfig'
    });

    // Belongs to Stage (optional - NULL for global conditions)
    HrmsWorkflowCondition.belongsTo(models.HrmsWorkflowStage, {
        foreignKey: 'stage_id',
        as: 'stage'
    });

    // Has many Rules
    HrmsWorkflowCondition.hasMany(models.HrmsWorkflowConditionRule, {
        foreignKey: 'condition_id',
        as: 'rules'
    });

    // Stage references
    HrmsWorkflowCondition.belongsTo(models.HrmsWorkflowStage, {
        foreignKey: 'action_stage_id',
        as: 'actionStage'
    });

    HrmsWorkflowCondition.belongsTo(models.HrmsWorkflowStage, {
        foreignKey: 'else_stage_id',
        as: 'elseStage'
    });
};

module.exports = { HrmsWorkflowCondition };
