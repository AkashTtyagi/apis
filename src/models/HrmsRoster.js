/**
 * HRMS Roster Model (Master Table)
 *
 * Purpose: Store roster master information
 * Admin creates roster with name, description
 * Roster contains date-shift pattern in details table
 * Roster can be assigned to multiple employees
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsRoster = sequelize.define('HrmsRoster', {
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

    // Roster Info
    roster_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: 'Name of the roster (e.g., "Week 1 Rotation", "Monthly Roster Jan 2025")'
    },

    roster_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of roster pattern'
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
    tableName: 'hrms_rosters',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['company_id'] },
        { fields: ['is_active'] },
        { fields: ['roster_name'] }
    ]
});

HrmsRoster.associate = (models) => {
    HrmsRoster.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    // Has many roster details (date-shift mapping)
    HrmsRoster.hasMany(models.HrmsRosterDetail, {
        foreignKey: 'roster_id',
        as: 'details'
    });

    // Has many roster-employee assignments
    HrmsRoster.hasMany(models.HrmsRosterEmployee, {
        foreignKey: 'roster_id',
        as: 'employees'
    });
};

module.exports = {
    HrmsRoster
};
