/**
 * HRMS Level Model
 * Sequelize model for hrms_levels table
 * Stores organizational hierarchy levels (Junior, Mid-Level, Senior, Lead, Principal, etc.)
 * Used to define career progression levels independent of designation
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsLevel = sequelize.define('HrmsLevel', {
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

    // Level Code (unique within company)
    level_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Level code is required'
            },
            notEmpty: {
                msg: 'Level code cannot be empty'
            }
        },
        comment: 'Unique code for level (e.g., L1, L2, L3, L4, L5)'
    },

    // Level Name
    level_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Level name is required'
            },
            notEmpty: {
                msg: 'Level name cannot be empty'
            }
        },
        comment: 'Display name (e.g., Entry Level, Junior, Mid-Level, Senior, Lead, Principal, Director)'
    },

    // Level Description
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Detailed description of level expectations and responsibilities'
    },

    // Hierarchy Order (higher = more senior)
    hierarchy_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Hierarchy level for org chart (higher number = more senior position)'
    },

    // Is Active
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    // Display Order
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order for displaying in dropdowns'
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
    tableName: 'hrms_levels',
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
            fields: ['company_id', 'level_code'],
            name: 'unique_company_level_code'
        },
        {
            fields: ['company_id']
        },
        {
            fields: ['hierarchy_order']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['display_order']
        },
        {
            fields: ['created_by']
        },
        {
            fields: ['updated_by']
        },
        {
            fields: ['deleted_at']
        }
    ]
});

/**
 * Define associations
 */
HrmsLevel.associate = (models) => {
    // Level belongs to Company
    HrmsLevel.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    // Level has many Employees
    HrmsLevel.hasMany(models.HrmsEmployee, {
        foreignKey: 'level_id',
        as: 'employees'
    });
};

module.exports = {
    HrmsLevel
};
