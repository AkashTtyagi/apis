/**
 * HRMS Designation Master Model
 * Sequelize model for hrms_designation_master table
 * Stores default designations by industry (like department_master)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsDesignationMaster = sequelize.define('HrmsDesignationMaster', {
    // Primary key
    designation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Industry ID (nullable for generic designations)
    industry_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_industry_master, NULL for generic designations'
    },

    // Designation Code
    designation_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Designation code is required'
            },
            notEmpty: {
                msg: 'Designation code cannot be empty'
            }
        },
        comment: 'Unique code (e.g., MGR, SR_DEV, JR_DEV, CEO)'
    },

    // Designation Name
    designation_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Designation name is required'
            },
            notEmpty: {
                msg: 'Designation name cannot be empty'
            }
        }
    },

    // Description
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Level (hierarchy level)
    level: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Hierarchy level (higher = more senior)'
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
        defaultValue: 0
    },

    // Timestamps
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    // Model options
    tableName: 'hrms_designation_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,

    // Indexes
    indexes: [
        {
            unique: true,
            fields: ['industry_id', 'designation_code'],
            name: 'unique_industry_designation_code'
        },
        {
            fields: ['industry_id']
        },
        {
            fields: ['designation_code']
        },
        {
            fields: ['level']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['display_order']
        }
    ]
});

/**
 * Define associations
 */
HrmsDesignationMaster.associate = (models) => {
    // Designation Master belongs to Industry
    HrmsDesignationMaster.belongsTo(models.HrmsIndustryMaster, {
        foreignKey: 'industry_id',
        as: 'industry'
    });

    // Designation Master has many Company Designations
    HrmsDesignationMaster.hasMany(models.HrmsCompanyDesignation, {
        foreignKey: 'designation_id',
        as: 'companyDesignations'
    });
};

module.exports = {
    HrmsDesignationMaster
};
