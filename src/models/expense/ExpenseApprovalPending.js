/**
 * Expense Approval Pending Model
 * Current pending approvals (for approver dashboard)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseApprovalPending = sequelize.define('ExpenseApprovalPending', {
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
        comment: 'FK to expense items'
    },

    // Stage
    stage_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to workflow stages'
    },
    stage_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Order of the stage'
    },
    stage_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Name of the stage'
    },

    // Approver
    approver_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User who needs to approve'
    },
    approver_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Type of approver assignment'
    },
    is_primary_approver: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: 'Primary or alternate approver'
    },

    // Request Details (denormalized for dashboard)
    requester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Employee who submitted'
    },
    requester_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Name of requester'
    },
    requester_department: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Department of requester'
    },
    request_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Request number'
    },
    category_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Category name (for item-level)'
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        comment: 'Amount pending approval'
    },
    expense_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date of expense'
    },
    submitted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When request was submitted'
    },

    // SLA
    sla_due_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'SLA deadline'
    },
    is_overdue: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: 'Whether overdue'
    },
    hours_pending: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Hours since assignment'
    },

    // Priority
    priority: {
        type: DataTypes.ENUM('Low', 'Normal', 'High', 'Urgent'),
        allowNull: false,
        defaultValue: 'Normal',
        comment: 'Priority level'
    },

    // Status
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '0 when action taken'
    },

    // Timestamps
    assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'When assigned to approver'
    },
    reminded_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last reminder time'
    },
    escalated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When escalated'
    }
}, {
    tableName: 'hrms_expense_approval_pending',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            name: 'idx_company',
            fields: ['company_id']
        },
        {
            name: 'idx_approver',
            fields: ['approver_user_id']
        },
        {
            name: 'idx_approval_request',
            fields: ['approval_request_id']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        },
        {
            name: 'idx_sla_due',
            fields: ['sla_due_at']
        },
        {
            name: 'idx_priority',
            fields: ['priority']
        },
        {
            name: 'idx_approver_active',
            fields: ['approver_user_id', 'is_active']
        }
    ]
});

module.exports = { ExpenseApprovalPending };
