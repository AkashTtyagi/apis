/**
 * HRMS Roster Assignment Model
 *
 * Purpose: Date-based shift override
 * Admin assigns different shift to employees on specific DATE
 * Each date gets separate entry
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsRosterAssignment = sequelize.define('HrmsRosterAssignment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_companies'
    },

    // Employee
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Employee for this roster assignment'
    },

    // Single Date
    roster_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Specific date for roster shift'
    },

    // Roster Shift (overrides primary shift)
    shift_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Shift to assign on this date (overrides employee primary shift)'
    },

    // Optional label
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Admin notes for this roster'
    },

    // Status
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    // Audit
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Admin user ID who created this assignment'
    },

    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'hrms_roster_assignments',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['company_id'] },
        { fields: ['employee_id'] },
        { fields: ['roster_date'] },
        { fields: ['shift_id'] },
        { fields: ['is_active'] },
        {
            unique: true,
            fields: ['employee_id', 'roster_date', 'deleted_at'],
            name: 'unique_employee_date'
        }
    ]
});

HrmsRosterAssignment.associate = (models) => {
    HrmsRosterAssignment.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    HrmsRosterAssignment.belongsTo(models.HrmsEmployee, {
        foreignKey: 'employee_id',
        as: 'employee'
    });

    HrmsRosterAssignment.belongsTo(models.HrmsShiftMaster, {
        foreignKey: 'shift_id',
        as: 'shift'
    });
};

module.exports = {
    HrmsRosterAssignment
};
