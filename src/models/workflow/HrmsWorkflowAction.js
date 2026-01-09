/**
 * Workflow Action Model
 * Audit trail for all workflow actions (approvals, rejections, auto-actions, etc.)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsWorkflowAction = sequelize.define('HrmsWorkflowAction', {
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
        allowNull: true,
        comment: 'FK to hrms_workflow_stages'
    },
    action_type: {
        type: DataTypes.ENUM(
            'submit',
            'approve',
            'reject',
            'withdraw',
            'auto_approve',
            'auto_reject',
            'escalate',
            'delegate',
            'reassign',
            'skip',
            'send_back',
            'notify'
        ),
        allowNull: false,
        comment: 'Type of action performed'
    },
    action_by_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'User who performed action (NULL for auto actions)'
    },
    action_by_type: {
        type: DataTypes.ENUM('employee', 'approver', 'system', 'admin'),
        allowNull: false,
        comment: 'Who performed the action'
    },
    approver_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Type of approver (RM, HR_ADMIN, etc.)'
    },
    approver_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Actual approver user ID'
    },
    action_status: {
        type: DataTypes.ENUM('success', 'failed', 'pending'),
        allowNull: false,
        defaultValue: 'success',
        comment: 'Action status'
    },
    action_result: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Result of action (next stage, final status, etc.)'
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Action remarks/comments'
    },
    attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Attached files (if any)'
    },
    action_taken_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'When action was taken'
    },
    email_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Was email notification sent'
    },
    email_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When email was sent'
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP address of action taker'
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Browser/device info'
    },
    previous_stage_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Stage before this action'
    },
    next_stage_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Stage after this action'
    }
}, {
    tableName: 'hrms_workflow_actions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
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
            name: 'idx_action_type',
            fields: ['action_type']
        },
        {
            name: 'idx_action_by_user_id',
            fields: ['action_by_user_id']
        },
        {
            name: 'idx_action_taken_at',
            fields: ['action_taken_at']
        }
    ]
});

HrmsWorkflowAction.associate = (models) => {
    // Belongs to Request
    HrmsWorkflowAction.belongsTo(models.HrmsWorkflowRequest, {
        foreignKey: 'request_id',
        as: 'request'
    });

    // Belongs to Stage
    HrmsWorkflowAction.belongsTo(models.HrmsWorkflowStage, {
        foreignKey: 'stage_id',
        as: 'stage'
    });

    // Previous and Next Stage references
    HrmsWorkflowAction.belongsTo(models.HrmsWorkflowStage, {
        foreignKey: 'previous_stage_id',
        as: 'previousStage'
    });

    HrmsWorkflowAction.belongsTo(models.HrmsWorkflowStage, {
        foreignKey: 'next_stage_id',
        as: 'nextStage'
    });

    // Belongs to Action By User
    HrmsWorkflowAction.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'action_by_user_id',
        as: 'actionByUser'
    });

    // Belongs to Approver User
    HrmsWorkflowAction.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'approver_user_id',
        as: 'approverUser'
    });
};

module.exports = { HrmsWorkflowAction };
