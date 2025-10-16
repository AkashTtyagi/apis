/**
 * Holiday Bank Model
 * Master list of all holidays
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsHolidayBank = sequelize.define('HrmsHolidayBank', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    holiday_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Name of the holiday (e.g., Independence Day, Christmas)'
    },
    holiday_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Date of the holiday'
    },
    is_national_holiday: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1=National Holiday, 0=Restricted/Optional Holiday'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional description about the holiday'
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
    tableName: 'hrms_holiday_bank',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_holiday_date',
            fields: ['holiday_date']
        },
        {
            name: 'idx_is_national_holiday',
            fields: ['is_national_holiday']
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

HrmsHolidayBank.associate = (models) => {
    // Holiday Bank has many Policy Mappings
    HrmsHolidayBank.hasMany(models.HrmsHolidayPolicyMapping, {
        foreignKey: 'holiday_id',
        as: 'policyMappings'
    });
};

module.exports = { HrmsHolidayBank };
