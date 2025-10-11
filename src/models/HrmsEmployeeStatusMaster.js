/**
 * Employee Status Master Model
 * Defines all possible employee status types
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsEmployeeStatusMaster = sequelize.define('HrmsEmployeeStatusMaster', {
    id: {
        type: DataTypes.TINYINT.UNSIGNED,
        primaryKey: true,
        comment: 'Status ID (0-6)'
    },
    status_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Status name (Active, Probation, etc.)'
    },
    status_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Short code for status'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of the status'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this status is currently active'
    },
    display_order: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order for display in UI'
    }
}, {
    tableName: 'hrms_employee_status_master',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_status_code',
            fields: ['status_code']
        }
    ],
    comment: 'Employee status master table - defines all possible employee statuses'
});

module.exports = { HrmsEmployeeStatusMaster };
