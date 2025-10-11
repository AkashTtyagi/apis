/**
 * HRMS Leave Policy Master Model
 * Sequelize model for hrms_leave_policy_master table
 * Stores leave policy configurations
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsLeavePolicyMaster = sequelize.define('HrmsLeavePolicyMaster', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Company ID
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Company ID is required'
            }
        },
        comment: 'Foreign key to hrms_companies'
    },

    // Policy Name
    policy_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Policy name is required'
            }
        }
    },

    // Policy Description
    policy_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Active flag
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    // Created by user ID
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who created this record'
    },

    // Updated by user ID
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last updated this record'
    },

    // Soft delete timestamp
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp when record was soft deleted'
    }
}, {
    // Model options
    tableName: 'hrms_leave_policy_master',
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
            fields: ['company_id', 'policy_name'],
            name: 'unique_company_policy_name'
        },
        {
            fields: ['company_id', 'is_active']
        },
        {
            fields: ['created_by']
        }
    ]
});

// Define associations
HrmsLeavePolicyMaster.associate = (models) => {
    // Policy has many mappings
    HrmsLeavePolicyMaster.hasMany(models.HrmsLeavePolicyMapping, {
        foreignKey: 'policy_id',
        as: 'policyMappings'
    });
};

module.exports = {
    HrmsLeavePolicyMaster
};
