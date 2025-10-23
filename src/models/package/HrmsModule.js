/**
 * HRMS Module Model
 * Sequelize model for hrms_modules table
 * Stores modules (Employee, Payroll, Attendance, etc.)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsModule = sequelize.define('HrmsModule', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    module_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'EMPLOYEE, PAYROLL, ATTENDANCE'
    },
    module_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    module_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    module_icon: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'hrms_modules',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['module_code'] },
        { fields: ['is_active'] }
    ]
});

module.exports = { HrmsModule };
