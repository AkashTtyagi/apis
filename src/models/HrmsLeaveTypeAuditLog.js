/**
 * HRMS Leave Type Audit Log Model
 * Sequelize model for hrms_leave_type_audit_logs table
 * Tracks all changes to leave types with field-level change history
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsLeaveTypeAuditLog = sequelize.define('HrmsLeaveTypeAuditLog', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Leave Type ID
    leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_leave_master'
    },

    // Company ID
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_companies'
    },

    // Action Type
    action: {
        type: DataTypes.ENUM('create', 'update', 'delete'),
        allowNull: false
    },

    // Field Name (for update actions)
    field_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Name of the field that was changed (null for create/delete)'
    },

    // Old Value
    old_value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Previous value before change'
    },

    // New Value
    new_value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'New value after change'
    },

    // User ID (who made the change)
    changed_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User ID who made this change'
    },

    // IP Address
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP address of the user'
    },

    // User Agent
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Browser/client user agent'
    },

    // Change Summary
    change_summary: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Brief description of the change'
    }
}, {
    // Model options
    tableName: 'hrms_leave_type_audit_logs',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false, // Audit logs are never updated
    paranoid: false,   // No soft deletes for audit logs

    // Indexes
    indexes: [
        {
            fields: ['leave_type_id', 'created_at'],
            name: 'idx_leave_type_date'
        },
        {
            fields: ['company_id']
        },
        {
            fields: ['action']
        },
        {
            fields: ['changed_by']
        },
        {
            fields: ['created_at']
        },
        {
            fields: ['field_name']
        }
    ]
});

module.exports = {
    HrmsLeaveTypeAuditLog
};
