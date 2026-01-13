/**
 * HRMS Break Log Model
 * Tracks actual employee breaks (links to hrms_shift_break_rules)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../utils/database');

const HrmsBreakLog = sequelize.define('HrmsBreakLog', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },

    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_employees'
    },

    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    break_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Date of break'
    },

    // Link to configured break rule
    shift_break_rule_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK to hrms_shift_break_rules (null for ad-hoc breaks)'
    },

    break_start_time: {
        type: DataTypes.DATE,
        allowNull: false
    },

    break_end_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Null if break is ongoing'
    },

    break_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Calculated duration'
    },

    status: {
        type: DataTypes.ENUM('ongoing', 'completed'),
        allowNull: false,
        defaultValue: 'ongoing'
    },

    remarks: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'hrms_break_log',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    indexes: [
        { fields: ['employee_id', 'break_date'] },
        { fields: ['employee_id', 'status'] },
        { fields: ['company_id', 'break_date'] }
    ]
});

module.exports = { HrmsBreakLog };
