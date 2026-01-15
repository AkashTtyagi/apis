/**
 * Holiday Policy Applicability Model
 * Defines which employees/departments/locations get which holiday policy
 * Uses same structure as workflow applicability
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsHolidayPolicyApplicability = sequelize.define('HrmsHolidayPolicyApplicability', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    policy_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_holiday_policy'
    },

    // Primary Applicability (WHERE policy applies)
    applicability_type: {
        type: DataTypes.ENUM(
            'company',
            'entity',
            'location',
            'level',
            'designation',
            'department',
            'sub_department',
            'employee',
            'grade'
        ),
        allowNull: false,
        comment: 'Primary applicability type'
    },
    applicability_value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comma-separated IDs for primary applicability (NULL for company-wide)'
    },

    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Company ID for filtering'
    },

    is_excluded: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1=Exclude this criteria, 0=Include'
    },
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Priority if multiple policies match (lower = higher priority)'
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
    }
}, {
    tableName: 'hrms_holiday_policy_applicability',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_policy_id',
            fields: ['policy_id']
        },
        {
            name: 'idx_applicability_type',
            fields: ['applicability_type']
        },
        {
            name: 'idx_applicability_value',
            fields: ['applicability_value'],
            length: { applicability_value: 100 }
        },
        {
            name: 'idx_company_id',
            fields: ['company_id']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        },
        {
            name: 'idx_created_by',
            fields: ['created_by']
        }
    ]
});

HrmsHolidayPolicyApplicability.associate = (models) => {
    // Applicability belongs to Holiday Policy
    HrmsHolidayPolicyApplicability.belongsTo(models.HrmsHolidayPolicy, {
        foreignKey: 'policy_id',
        as: 'policy'
    });

    // Applicability belongs to Company
    HrmsHolidayPolicyApplicability.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });
};

module.exports = { HrmsHolidayPolicyApplicability };
