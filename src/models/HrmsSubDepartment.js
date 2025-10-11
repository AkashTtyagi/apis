/**
 * HRMS Sub-Department Model
 * Sequelize model for hrms_sub_departments table
 * Stores sub-departments under parent departments
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsSubDepartment = sequelize.define('HrmsSubDepartment', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Organization Department ID (links to hrms_org_departments)
    org_dept_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Organization Department ID is required'
            }
        },
        comment: 'Reference to hrms_org_departments.id'
    },

    // Sub-Department Name
    sub_department_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Sub-department name is required'
            }
        }
    },

    // Sub-Department Code
    sub_department_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Optional sub-department code/identifier'
    },

    // Description
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Sub-Department Head ID
    head_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Employee ID of sub-department head'
    },

    // Is Active
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
    tableName: 'hrms_sub_departments',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    // Indexes
    indexes: [
        {
            fields: ['org_dept_id']
        },
        {
            fields: ['sub_department_code']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['head_id']
        },
        {
            fields: ['created_by']
        },
        {
            fields: ['updated_by']
        },
        {
            fields: ['deleted_at']
        },
        {
            unique: true,
            fields: ['org_dept_id', 'sub_department_name'],
            name: 'unique_org_dept_subdept_name'
        }
    ]
});

module.exports = {
    HrmsSubDepartment
};
