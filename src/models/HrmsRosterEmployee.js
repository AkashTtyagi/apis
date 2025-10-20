/**
 * HRMS Roster Employee Model
 *
 * Purpose: Store roster-employee assignment
 * Links roster to employees (many-to-many relationship)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsRosterEmployee = sequelize.define('HrmsRosterEmployee', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    roster_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_rosters'
    },

    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_employees'
    },

    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_companies'
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
        allowNull: true
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
    tableName: 'hrms_roster_employees',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['roster_id'] },
        { fields: ['employee_id'] },
        { fields: ['company_id'] },
        { fields: ['is_active'] },
        { unique: true, fields: ['roster_id', 'employee_id', 'deleted_at'] }
    ]
});

HrmsRosterEmployee.associate = (models) => {
    HrmsRosterEmployee.belongsTo(models.HrmsRoster, {
        foreignKey: 'roster_id',
        as: 'roster'
    });

    HrmsRosterEmployee.belongsTo(models.HrmsEmployee, {
        foreignKey: 'employee_id',
        as: 'employee'
    });

    HrmsRosterEmployee.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });
};

module.exports = {
    HrmsRosterEmployee
};
