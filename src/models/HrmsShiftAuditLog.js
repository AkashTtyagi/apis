/**
 * HRMS Shift Audit Log Model
 * Sequelize model for hrms_shift_audit_log table
 * Stores audit trail for all shift-related changes
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsShiftAuditLog = sequelize.define('HrmsShiftAuditLog', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Shift ID
    shift_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Shift ID is required'
            }
        },
        comment: 'Reference to hrms_shift_master'
    },

    // Action type
    action_type: {
        type: DataTypes.ENUM('created', 'updated', 'deleted', 'activated', 'deactivated'),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Action type is required'
            }
        }
    },

    // Changed by
    changed_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Changed by user ID is required'
            }
        },
        comment: 'User ID who made the change'
    },

    // Changed at
    changed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    // Old values
    old_values: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Old values before change'
    },

    // New values
    new_values: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'New values after change'
    },

    // Change description
    change_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Human-readable description of change'
    },

    // IP address
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP address of user who made change'
    }
}, {
    // Model options
    tableName: 'hrms_shift_audit_log',
    timestamps: false,
    underscored: true,

    // Indexes
    indexes: [
        {
            fields: ['shift_id']
        },
        {
            fields: ['changed_by']
        },
        {
            fields: ['changed_at']
        },
        {
            fields: ['action_type']
        }
    ]
});

// Define associations
HrmsShiftAuditLog.associate = (models) => {
    // Audit log belongs to Shift
    HrmsShiftAuditLog.belongsTo(models.HrmsShiftMaster, {
        foreignKey: 'shift_id',
        as: 'shift'
    });

    // Audit log belongs to User (who made the change)
    HrmsShiftAuditLog.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'changed_by',
        as: 'changedByUser'
    });
};

module.exports = {
    HrmsShiftAuditLog
};
