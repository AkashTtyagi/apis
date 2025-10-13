/**
 * Workflow Stage Assignment Model
 * Tracks current approver assignments for each request stage
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsWorkflowStageAssignment = sequelize.define('HrmsWorkflowStageAssignment', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    request_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_workflow_requests'
    },
    stage_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_workflow_stages'
    },
    assigned_to_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'User assigned as approver'
    },
    approver_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'RM, HR_ADMIN, HOD, etc.'
    },
    assignment_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'delegated', 'skipped', 'expired'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Assignment status'
    },
    requires_all_approval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'For AND logic - all must approve'
    },
    approval_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Order for sequential AND approvals'
    },
    is_delegated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    delegated_to_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'If delegated, who is the delegate'
    },
    delegated_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    action_taken: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Has approver taken action'
    },
    action_taken_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    action_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_workflow_actions'
    },
    sla_due_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'SLA due date for this assignment'
    },
    is_sla_breached: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    notification_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    notification_sent_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reminder_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of reminders sent'
    },
    last_reminder_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'hrms_workflow_stage_assignments',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_request_id',
            fields: ['request_id']
        },
        {
            name: 'idx_stage_id',
            fields: ['stage_id']
        },
        {
            name: 'idx_assigned_to_user_id',
            fields: ['assigned_to_user_id']
        },
        {
            name: 'idx_assignment_status',
            fields: ['assignment_status']
        },
        {
            name: 'idx_action_taken',
            fields: ['action_taken']
        },
        {
            name: 'idx_sla_due_date',
            fields: ['sla_due_date']
        }
    ]
});

HrmsWorkflowStageAssignment.associate = (models) => {
    // Belongs to Request
    HrmsWorkflowStageAssignment.belongsTo(models.HrmsWorkflowRequest, {
        foreignKey: 'request_id',
        as: 'request'
    });

    // Belongs to Stage
    HrmsWorkflowStageAssignment.belongsTo(models.HrmsWorkflowStage, {
        foreignKey: 'stage_id',
        as: 'stage'
    });

    // Belongs to Action
    HrmsWorkflowStageAssignment.belongsTo(models.HrmsWorkflowAction, {
        foreignKey: 'action_id',
        as: 'action'
    });
};

module.exports = { HrmsWorkflowStageAssignment };
