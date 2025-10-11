/**
 * HRMS Grade Model
 * Sequelize model for hrms_grades table
 * Stores employee grades/levels
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsGrade = sequelize.define('HrmsGrade', {
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

    // Grade Code (unique within company)
    grade_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Grade code is required'
            },
            notEmpty: {
                msg: 'Grade code cannot be empty'
            }
        },
        comment: 'Unique code for grade (e.g., G1, G2, L1, L2)'
    },

    // Grade Name
    grade_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Grade name is required'
            },
            notEmpty: {
                msg: 'Grade name cannot be empty'
            }
        }
    },

    // Grade Description
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Level/Seniority (higher = more senior)
    level: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Hierarchy level (higher number = senior grade)'
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
    tableName: 'hrms_grades',
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
            fields: ['company_id', 'grade_code'],
            name: 'unique_company_grade_code'
        },
        {
            fields: ['company_id']
        },
        {
            fields: ['level']
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
HrmsGrade.associate = (models) => {
    // Grade belongs to Company
    HrmsGrade.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    // Grade has many Company Designations
    HrmsGrade.hasMany(models.HrmsCompanyDesignation, {
        foreignKey: 'grade_id',
        as: 'designations'
    });
};

module.exports = {
    HrmsGrade
};
