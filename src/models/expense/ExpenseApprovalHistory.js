/**
 * Expense Approval History Model
 * Complete audit trail of all approval actions
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseApprovalHistory = sequelize.define('ExpenseApprovalHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_companies'
    },

    // References
    approval_request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to approval requests'
    },
    approval_item_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK to approval items (null if request-level)'
    },
    expense_request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to expense requests'
    },
    expense_item_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK to expense items (null if request-level)'
    },

    // Stage Information
    stage_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Stage where action was taken'
    },
    stage_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Order of the stage'
    },
    stage_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Name of the stage'
    },

    // Action Details
    action: {
        type: DataTypes.ENUM(
            'Submitted',
            'Approved',
            'Partially_Approved',
            'Rejected',
            'Sent_Back',
            'Put_On_Hold',
            'Released_From_Hold',
            'Delegated',
            'Escalated',
            'Withdrawn',
            'Auto_Approved',
            'Auto_Rejected',
            'Amount_Modified',
            'Document_Requested',
            'Document_Uploaded',
            'Comment_Added',
            'Reminder_Sent',
            'SLA_Breached'
        ),
        allowNull: false,
        comment: 'Type of action'
    },

    // Action By
    action_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User who performed action'
    },
    action_by_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Name of user'
    },
    action_by_role: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Role of user'
    },

    // Action Target
    action_to_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Target user (for delegation/escalation)'
    },
    action_to_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Target user name'
    },

    // Amount Details
    amount_before: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Amount before action'
    },
    amount_after: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Amount after action'
    },
    amount_change: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Change in amount'
    },

    // Comments/Reasons
    comments: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'General comments'
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for rejection'
    },
    send_back_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for send back'
    },
    modification_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for modification'
    },

    // Metadata
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP address of user'
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Browser/client info'
    },
    action_source: {
        type: DataTypes.ENUM('Web', 'Mobile', 'API', 'System', 'Email'),
        allowNull: false,
        defaultValue: 'Web',
        comment: 'Source of action'
    },

    // Timestamps
    action_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'When action was taken'
    }
}, {
    tableName: 'hrms_expense_approval_history',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            name: 'idx_company',
            fields: ['company_id']
        },
        {
            name: 'idx_approval_request',
            fields: ['approval_request_id']
        },
        {
            name: 'idx_approval_item',
            fields: ['approval_item_id']
        },
        {
            name: 'idx_expense_request',
            fields: ['expense_request_id']
        },
        {
            name: 'idx_action',
            fields: ['action']
        },
        {
            name: 'idx_action_by',
            fields: ['action_by_user_id']
        },
        {
            name: 'idx_action_at',
            fields: ['action_at']
        }
    ]
});

module.exports = { ExpenseApprovalHistory };
