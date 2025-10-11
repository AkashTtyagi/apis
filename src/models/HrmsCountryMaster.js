/**
 * Country Master Model
 * Stores all countries with timezone, currency, and tax details
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsCountryMaster = sequelize.define('HrmsCountryMaster', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Country ID'
    },
    country_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Full country name'
    },
    country_code: {
        type: DataTypes.STRING(3),
        allowNull: false,
        unique: true,
        comment: 'ISO 3166-1 alpha-2 or alpha-3 code'
    },
    iso_code_2: {
        type: DataTypes.CHAR(2),
        allowNull: false,
        comment: 'ISO 3166-1 alpha-2 code'
    },
    iso_code_3: {
        type: DataTypes.CHAR(3),
        allowNull: false,
        comment: 'ISO 3166-1 alpha-3 code'
    },
    phone_code: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'International dialing code'
    },
    abbreviation: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Country abbreviation'
    },
    primary_timezone: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Primary timezone of the country (e.g., Asia/Kolkata)'
    },
    utc_offset: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'UTC offset (e.g., +5:30, -8:00)'
    },
    currency: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Main currency name (e.g., Indian Rupee)'
    },
    currency_code: {
        type: DataTypes.CHAR(3),
        allowNull: true,
        comment: 'ISO 4217 currency code (e.g., INR, USD)'
    },
    currency_symbol: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Currency symbol (e.g., ₹, $)'
    },
    sub_currency: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Sub-currency name (e.g., Paisa, Cent)'
    },
    service_tax: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: 'Default service tax percentage'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this country is active'
    },
    display_order: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order for display in UI'
    }
}, {
    tableName: 'hrms_country_master',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_country_code',
            fields: ['country_code']
        },
        {
            name: 'idx_iso_code_2',
            fields: ['iso_code_2']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        }
    ],
    comment: 'Country master table - stores all countries with timezone and currency details'
});

/**
 * Define associations
 */
HrmsCountryMaster.associate = (models) => {
    // Country has many States
    HrmsCountryMaster.hasMany(models.HrmsStateMaster, {
        foreignKey: 'country_id',
        as: 'states'
    });

    // Country has many Cities
    HrmsCountryMaster.hasMany(models.HrmsCityMaster, {
        foreignKey: 'country_id',
        as: 'cities'
    });
};

module.exports = { HrmsCountryMaster };
