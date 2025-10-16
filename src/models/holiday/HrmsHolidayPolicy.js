/**
 * Holiday Policy Model
 * Defines holiday calendars for companies
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsHolidayPolicy = sequelize.define('HrmsHolidayPolicy', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_companies'
    },
    calendar_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Name of the holiday calendar (e.g., India Calendar 2025)'
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Calendar year for this policy'
    },
    is_restricted_holiday_applicable: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1=Restricted holidays allowed, 0=No restricted holidays'
    },
    restricted_holiday_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Number of restricted holidays employees can take (if applicable)'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional notes about this holiday policy'
    },
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Active, 0=Inactive'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who created this record'
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last updated this record'
    }
}, {
    tableName: 'hrms_holiday_policy',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_company_id',
            fields: ['company_id']
        },
        {
            name: 'idx_year',
            fields: ['year']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        },
        {
            name: 'idx_created_by',
            fields: ['created_by']
        },
        {
            name: 'idx_company_year',
            fields: ['company_id', 'year']
        }
    ]
});

HrmsHolidayPolicy.associate = (models) => {
    // Holiday Policy belongs to Company
    HrmsHolidayPolicy.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    // Holiday Policy has many Mappings
    HrmsHolidayPolicy.hasMany(models.HrmsHolidayPolicyMapping, {
        foreignKey: 'policy_id',
        as: 'holidayMappings'
    });

    // Holiday Policy has many Applicability rules
    HrmsHolidayPolicy.hasMany(models.HrmsHolidayPolicyApplicability, {
        foreignKey: 'policy_id',
        as: 'applicability'
    });
};

module.exports = { HrmsHolidayPolicy };
