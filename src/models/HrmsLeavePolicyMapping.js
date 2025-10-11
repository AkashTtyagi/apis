/**
 * HRMS Leave Policy Mapping Model
 * Sequelize model for hrms_leave_policy_mapping table
 * Maps leave types to leave policies
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsLeavePolicyMapping = sequelize.define('HrmsLeavePolicyMapping', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Policy ID
    policy_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Policy ID is required'
            }
        },
        comment: 'Foreign key to hrms_leave_policy_master'
    },

    // Leave Type ID
    leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Leave type ID is required'
            }
        },
        comment: 'Foreign key to hrms_leave_master'
    },

    // Display Order
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order in which leave types should be displayed'
    },

    // Active flag
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this leave type is active in this policy'
    },

    // Soft delete timestamp
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp when record was soft deleted'
    }
}, {
    // Model options
    tableName: 'hrms_leave_policy_mapping',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    // Indexes
    indexes: [
        {
            unique: true,
            fields: ['policy_id', 'leave_type_id'],
            name: 'unique_policy_leave'
        },
        {
            fields: ['policy_id', 'is_active']
        },
        {
            fields: ['leave_type_id']
        },
        {
            fields: ['display_order']
        }
    ]
});

// Define associations
HrmsLeavePolicyMapping.associate = (models) => {
    // Mapping belongs to leave type
    HrmsLeavePolicyMapping.belongsTo(models.HrmsLeaveMaster, {
        foreignKey: 'leave_type_id',
        as: 'leaveType'
    });
};

module.exports = {
    HrmsLeavePolicyMapping
};
