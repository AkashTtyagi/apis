/**
 * Expense Approval Workflow Model
 * Master table for expense approval workflows
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseApprovalWorkflow = sequelize.define('ExpenseApprovalWorkflow', {
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

    // Workflow Identification
    workflow_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: 'Name of the workflow'
    },
    workflow_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Unique code for the workflow'
    },
    workflow_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of the workflow'
    },

    // Workflow Scope
    workflow_scope: {
        type: DataTypes.ENUM('All_Expenses', 'Category_Specific', 'Amount_Based', 'Policy_Specific'),
        allowNull: false,
        defaultValue: 'All_Expenses',
        comment: 'Determines when this workflow applies'
    },

    // Approval Mode
    approval_mode: {
        type: DataTypes.ENUM('Sequential', 'Parallel', 'Any_One'),
        allowNull: false,
        defaultValue: 'Sequential',
        comment: 'Sequential=Stage by stage, Parallel=All stages at once'
    },

    // Line Item Settings
    approval_level: {
        type: DataTypes.ENUM('Request_Level', 'Line_Item_Level'),
        allowNull: false,
        defaultValue: 'Line_Item_Level',
        comment: 'Request_Level=All items same decision, Line_Item_Level=Each item independent'
    },
    allow_partial_approval: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: 'Allow some items approved, some rejected'
    },
    allow_partial_amount_approval: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: 'Allow approving partial amount of a line item'
    },

    // Amount Modification
    allow_amount_modification: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: 'Approver can reduce approved amount'
    },
    max_amount_reduction_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100.00,
        comment: 'Max % approver can reduce'
    },

    // Escalation Settings
    escalation_enabled: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: 'Enable escalation feature'
    },
    escalation_after_hours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 48,
        comment: 'Escalate after X hours of inaction'
    },
    escalation_reminder_hours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 24,
        comment: 'Send reminder X hours before escalation'
    },
    max_escalation_levels: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 3,
        comment: 'Max times to escalate'
    },
    escalation_to: {
        type: DataTypes.ENUM('Skip_Level_Manager', 'Department_Head', 'HR', 'Finance_Head', 'Specific_User'),
        allowNull: false,
        defaultValue: 'Skip_Level_Manager',
        comment: 'Who to escalate to'
    },
    escalation_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'When escalation_to = Specific_User'
    },

    // Auto-Approval Settings
    auto_approve_enabled: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: 'Enable auto-approval'
    },
    auto_approve_max_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Auto-approve if total <= this amount'
    },
    auto_approve_categories: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Category IDs eligible for auto-approval'
    },
    auto_approve_for_grades: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Grade IDs eligible for auto-approval'
    },

    // Auto-Reject Settings
    auto_reject_enabled: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: 'Enable auto-rejection'
    },
    auto_reject_after_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Auto-reject if no action after X days'
    },

    // Send Back Settings
    allow_send_back: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: 'Allow sending back for correction'
    },
    max_send_back_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 3,
        comment: 'Max times request can be sent back'
    },

    // Email Notification Settings
    email_notifications_enabled: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: 'Enable email notifications'
    },
    notify_requester_on_submit: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    notify_approver_on_submit: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    notify_requester_on_approve: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    notify_requester_on_reject: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    notify_requester_on_send_back: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    notify_requester_on_payment: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    notify_finance_on_approval: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0
    },

    // Approver Notifications
    notify_approver_on_escalation: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    notify_next_approver: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },

    // Reminder Notifications
    enable_pending_reminders: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    pending_reminder_hours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 24
    },
    pending_reminder_frequency_hours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 24
    },
    max_pending_reminders: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 3
    },

    // Push Notifications
    push_notifications_enabled: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    push_on_submit: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    push_on_action: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    push_on_reminder: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },

    // CC/BCC Settings
    cc_manager_on_approval: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0
    },
    cc_hr_on_rejection: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0
    },
    additional_cc_emails: {
        type: DataTypes.JSON,
        allowNull: true
    },

    // Email Template IDs
    email_template_submit: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    email_template_approval: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    email_template_rejection: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    email_template_send_back: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    email_template_reminder: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    email_template_escalation: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    // Status
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Active, 0=Inactive'
    },
    is_default: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: 'Default workflow for company'
    },

    // Audit fields
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User ID who created this record'
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last updated this record'
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp'
    },
    deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who deleted this record'
    }
}, {
    tableName: 'hrms_expense_approval_workflows',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_company_active',
            fields: ['company_id', 'is_active']
        },
        {
            name: 'idx_workflow_code',
            fields: ['workflow_code']
        },
        {
            name: 'idx_is_default',
            fields: ['company_id', 'is_default']
        },
        {
            name: 'idx_company_workflow_code',
            unique: true,
            fields: ['company_id', 'workflow_code']
        }
    ]
});

module.exports = { ExpenseApprovalWorkflow };
