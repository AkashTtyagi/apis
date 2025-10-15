/**
 * Employee Type Master Model
 * Defines different types of employees (Full Time, Part Time, Contract, Intern, etc.)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsEmployeeTypeMaster = sequelize.define('HrmsEmployeeTypeMaster', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique code for employee type (e.g., FULL_TIME, PART_TIME)'
    },
    type_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Display name (e.g., Full Time, Part Time)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of employee type'
    },
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Active, 0=Inactive'
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 999,
        comment: 'Order for dropdown display'
    }
}, {
    tableName: 'hrms_employee_type_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_type_code',
            fields: ['type_code']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        },
        {
            name: 'idx_display_order',
            fields: ['display_order']
        }
    ]
});

HrmsEmployeeTypeMaster.associate = (models) => {
    // Employee Type has many Employees
    HrmsEmployeeTypeMaster.hasMany(models.HrmsEmployee, {
        foreignKey: 'employee_type_id',
        as: 'employees'
    });
};

module.exports = { HrmsEmployeeTypeMaster };
