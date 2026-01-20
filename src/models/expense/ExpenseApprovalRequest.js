/**
 * Expense Approval Request Model
 * Tracks approval status for each expense request
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseApprovalRequest = sequelize.define('ExpenseApprovalRequest', {
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

    // Reference to Expense Request
    expense_request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_expense_requests'
    },
    expense_request_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Request number for reference'
    },

    // Workflow Used
    workflow_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_expense_approval_workflows'
    },

    // Request Details (denormalized)
    requester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Employee who submitted'
    },
    requester_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Name for quick display'
    },
    total_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Total request amount'
    },
    total_items: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Total line items'
    },

    // Current Status
    current_stage_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK to workflow_stages - Current pending stage'
    },
    current_stage_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Current stage order number'
    },
    current_approver_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Current approver user IDs'
    },

    // Overall Status
    approval_status: {
        type: DataTypes.ENUM(
            'Pending',
            'In_Progress',
            'Partially_Approved',
            'Fully_Approved',
            'Rejected',
            'Sent_Back',
            'On_Hold',
            'Withdrawn',
            'Auto_Approved',
            'Auto_Rejected',
            'Escalated'
        ),
        allowNull: false,
        defaultValue: 'Pending',
        comment: 'Overall approval status'
    },

    // Amount Summary
    approved_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total approved amount'
    },
    rejected_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total rejected amount'
    },
    pending_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Total pending amount'
    },
    modified_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'If approver modified amounts'
    },

    // Item Summary
    approved_items: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Count of approved items'
    },
    rejected_items: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Count of rejected items'
    },
    pending_items: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Count of pending items'
    },
    sent_back_items: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Count of sent back items'
    },

    // Timestamps
    submitted_at: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'When request was submitted'
    },
    first_action_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When first approval action taken'
    },
    last_action_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When last action was taken'
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When fully processed'
    },

    // SLA Tracking
    sla_due_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Current SLA deadline'
    },
    is_sla_breached: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: 'Whether SLA breached'
    },
    sla_breach_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When SLA was breached'
    },

    // Escalation Tracking
    escalation_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Times escalated'
    },
    last_escalation_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last escalation time'
    },
    escalated_to_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User escalated to'
    },

    // Send Back Tracking
    send_back_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Times sent back'
    },
    last_send_back_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last send back time'
    },
    last_send_back_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for last send back'
    }
}, {
    tableName: 'hrms_expense_approval_requests',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_company',
            fields: ['company_id']
        },
        {
            name: 'idx_expense_request',
            fields: ['expense_request_id']
        },
        {
            name: 'idx_workflow',
            fields: ['workflow_id']
        },
        {
            name: 'idx_requester',
            fields: ['requester_id']
        },
        {
            name: 'idx_status',
            fields: ['approval_status']
        },
        {
            name: 'idx_current_stage',
            fields: ['current_stage_id']
        },
        {
            name: 'idx_submitted_at',
            fields: ['submitted_at']
        },
        {
            name: 'idx_sla_due',
            fields: ['sla_due_at']
        },
        {
            name: 'idx_expense_request_unique',
            unique: true,
            fields: ['expense_request_id']
        }
    ]
});

module.exports = { ExpenseApprovalRequest };
