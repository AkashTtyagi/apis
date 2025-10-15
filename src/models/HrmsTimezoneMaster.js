/**
 * HRMS Timezone Master Model
 * Sequelize model for hrms_timezone_master table
 * Stores all world timezones with UTC offsets
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsTimezoneMaster = sequelize.define('HrmsTimezoneMaster', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Timezone Name (e.g., Asia/Kolkata)
    timezone_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                msg: 'Timezone name is required'
            }
        },
        comment: 'Timezone identifier (e.g., Asia/Kolkata)'
    },

    // Timezone Offset (e.g., +05:30)
    timezone_offset: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Timezone offset is required'
            }
        },
        comment: 'UTC offset (e.g., +05:30, -08:00)'
    },

    // Timezone Offset in Minutes
    timezone_offset_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Timezone offset in minutes is required'
            }
        },
        comment: 'Offset in minutes from UTC'
    },

    // Country Code
    country_code: {
        type: DataTypes.STRING(5),
        allowNull: true,
        comment: 'ISO country code'
    },

    // Timezone Abbreviation
    timezone_abbr: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Timezone abbreviation (e.g., IST, PST)'
    },

    // Display Name
    display_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Display name is required'
            }
        },
        comment: 'Human readable timezone name'
    },

    // Is Active
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Active, 0=Inactive'
    }
}, {
    // Model options
    tableName: 'hrms_timezone_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    // Indexes
    indexes: [
        {
            unique: true,
            fields: ['timezone_name']
        },
        {
            fields: ['country_code']
        },
        {
            fields: ['is_active']
        }
    ]
});

module.exports = {
    HrmsTimezoneMaster
};
