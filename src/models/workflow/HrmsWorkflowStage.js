/**
 * Workflow Stage Model
 * Stores workflow stages configuration
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsWorkflowStage = sequelize.define('HrmsWorkflowStage', {
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
    stage_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Stage name (e.g., RM Approval, HR Approval)'
    },
    stage_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Order of execution (1, 2, 3...)'
    },
    stage_type: {
        type: DataTypes.ENUM('approval', 'notify_only', 'auto_action'),
        allowNull: false,
        defaultValue: 'approval',
        comment: 'Type of stage'
    },
    approver_logic: {
        type: DataTypes.ENUM('AND', 'OR'),
        allowNull: false,
        defaultValue: 'OR',
        comment: 'If multiple approvers: AND (all must approve), OR (any can approve)'
    },
    is_mandatory: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Is this stage mandatory'
    },
    can_skip: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Can this stage be skipped'
    },
    skip_condition: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON condition for skipping stage'
    },
    sla_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'SLA in days for this stage'
    },
    sla_hours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'SLA in hours for this stage'
    },
    pending_action: {
        type: DataTypes.ENUM('auto_approve', 'auto_reject', 'escalate', 'notify'),
        allowNull: true,
        comment: 'Action when pending exceeds SLA'
    },
    escalate_to_stage_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_workflow_stages - escalate to this stage'
    },
    on_approve_next_stage_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_workflow_stages - next stage on approval'
    },
    on_reject_action: {
        type: DataTypes.ENUM('final_reject', 'move_to_stage', 'send_back'),
        allowNull: false,
        defaultValue: 'final_reject',
        comment: 'Action on rejection'
    },
    on_reject_stage_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_workflow_stages - stage to move on rejection'
    },
    send_email_on_assign: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Send email when stage assigned to approver'
    },
    send_email_on_approve: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Send email on approval'
    },
    send_email_on_reject: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Send email on rejection'
    },
    email_template_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_workflow_email_templates'
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
    tableName: 'hrms_workflow_stages',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'unique_workflow_stage_order',
            unique: true,
            fields: ['workflow_config_id', 'stage_order']
        },
        {
            name: 'idx_workflow_config_id',
            fields: ['workflow_config_id']
        },
        {
            name: 'idx_stage_order',
            fields: ['stage_order']
        },
        {
            name: 'idx_stage_type',
            fields: ['stage_type']
        }
    ]
});

HrmsWorkflowStage.associate = (models) => {
    // Belongs to Workflow Config
    HrmsWorkflowStage.belongsTo(models.HrmsWorkflowConfig, {
        foreignKey: 'workflow_config_id',
        as: 'workflowConfig'
    });

    // Has many Approvers
    HrmsWorkflowStage.hasMany(models.HrmsWorkflowStageApprover, {
        foreignKey: 'stage_id',
        as: 'approvers'
    });

    // Has many Conditions
    HrmsWorkflowStage.hasMany(models.HrmsWorkflowCondition, {
        foreignKey: 'stage_id',
        as: 'conditions'
    });

    // Has many Stage Assignments
    HrmsWorkflowStage.hasMany(models.HrmsWorkflowStageAssignment, {
        foreignKey: 'stage_id',
        as: 'assignments'
    });

    // Self-references for stage routing
    HrmsWorkflowStage.belongsTo(models.HrmsWorkflowStage, {
        foreignKey: 'escalate_to_stage_id',
        as: 'escalateToStage'
    });

    HrmsWorkflowStage.belongsTo(models.HrmsWorkflowStage, {
        foreignKey: 'on_approve_next_stage_id',
        as: 'nextStageOnApprove'
    });

    HrmsWorkflowStage.belongsTo(models.HrmsWorkflowStage, {
        foreignKey: 'on_reject_stage_id',
        as: 'stageOnReject'
    });
};

module.exports = { HrmsWorkflowStage };
