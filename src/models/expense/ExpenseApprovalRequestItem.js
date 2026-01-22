/**
 * Expense Approval Request Item Model
 * Line item level approval tracking
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseApprovalRequestItem = sequelize.define('ExpenseApprovalRequestItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    approval_request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_expense_approval_requests'
    },

    // Reference to Expense Item
    expense_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_expense_request_items'
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Category ID'
    },
    category_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Category name for display'
    },

    // Item Details (denormalized)
    original_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        comment: 'Original requested amount'
    },
    expense_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Date of expense'
    },

    // Item Stage Tracking (for Line_Item_Level approval)
    current_stage_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Current stage for this item'
    },
    current_stage_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Current stage order'
    },

    // Item Status
    item_status: {
        type: DataTypes.ENUM(
            'Pending',
            'In_Progress',
            'Approved',
            'Partially_Approved',
            'Rejected',
            'Sent_Back',
            'On_Hold'
        ),
        allowNull: false,
        defaultValue: 'Pending',
        comment: 'Item approval status'
    },

    // Approved Amount
    approved_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Approved amount (can differ from original)'
    },
    amount_modified: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: 'Whether amount was modified'
    },
    modification_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for modification'
    },

    // Action Details
    action_taken_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User who took final action'
    },
    action_taken_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When action was taken'
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
    approver_comments: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comments from approver'
    }
}, {
    tableName: 'hrms_expense_approval_request_items',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_approval_request',
            fields: ['approval_request_id']
        },
        {
            name: 'idx_expense_item',
            fields: ['expense_item_id']
        },
        {
            name: 'idx_category',
            fields: ['category_id']
        },
        {
            name: 'idx_status',
            fields: ['item_status']
        },
        {
            name: 'idx_expense_item_unique',
            unique: true,
            fields: ['expense_item_id']
        }
    ]
});

module.exports = { ExpenseApprovalRequestItem };
