/**
 * Holiday Policy Mapping Model
 * Links holidays from holiday bank to holiday policies
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsHolidayPolicyMapping = sequelize.define('HrmsHolidayPolicyMapping', {
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
    holiday_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_holiday_bank'
    },
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Active, 0=Inactive'
    }
}, {
    tableName: 'hrms_holiday_policy_mapping',
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
            name: 'idx_holiday_id',
            fields: ['holiday_id']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        },
        {
            name: 'idx_policy_holiday',
            unique: true,
            fields: ['policy_id', 'holiday_id']
        }
    ]
});

HrmsHolidayPolicyMapping.associate = (models) => {
    // Mapping belongs to Holiday Policy
    HrmsHolidayPolicyMapping.belongsTo(models.HrmsHolidayPolicy, {
        foreignKey: 'policy_id',
        as: 'policy'
    });

    // Mapping belongs to Holiday Bank
    HrmsHolidayPolicyMapping.belongsTo(models.HrmsHolidayBank, {
        foreignKey: 'holiday_id',
        as: 'holiday'
    });
};

module.exports = { HrmsHolidayPolicyMapping };
