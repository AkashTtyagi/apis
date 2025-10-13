/**
 * Workflow Stage Approver Model
 * Stores approvers for each stage
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsWorkflowStageApprover = sequelize.define('HrmsWorkflowStageApprover', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    stage_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_workflow_stages'
    },
    approver_type: {
        type: DataTypes.ENUM(
            'RM',
            'RM_OF_RM',
            'HR_ADMIN',
            'HOD',
            'FUNCTIONAL_HEAD',
            'SUB_ADMIN',
            'SECONDARY_RM',
            'SELF',
            'AUTO_APPROVE',
            'CUSTOM_USER'
        ),
        allowNull: false,
        comment: 'Type of approver'
    },
    custom_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Specific user ID if approver_type = CUSTOM_USER'
    },
    approver_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Order if multiple approvers (for AND logic)'
    },
    has_condition: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Is this a conditional approver'
    },
    condition_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_workflow_conditions'
    },
    allow_delegation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Can approver delegate'
    },
    delegate_to_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Delegate to specific user'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    }
}, {
    tableName: 'hrms_workflow_stage_approvers',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_stage_id',
            fields: ['stage_id']
        },
        {
            name: 'idx_approver_type',
            fields: ['approver_type']
        },
        {
            name: 'idx_approver_order',
            fields: ['approver_order']
        }
    ]
});

HrmsWorkflowStageApprover.associate = (models) => {
    // Belongs to Stage
    HrmsWorkflowStageApprover.belongsTo(models.HrmsWorkflowStage, {
        foreignKey: 'stage_id',
        as: 'stage'
    });

    // Belongs to Condition (optional)
    HrmsWorkflowStageApprover.belongsTo(models.HrmsWorkflowCondition, {
        foreignKey: 'condition_id',
        as: 'condition'
    });
};

module.exports = { HrmsWorkflowStageApprover };
