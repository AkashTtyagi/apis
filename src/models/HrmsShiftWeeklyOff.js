/**
 * HRMS Shift Weekly Off Model
 * Sequelize model for hrms_shift_weekly_off table
 * Stores weekly off configuration with 5-week rotation support
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsShiftWeeklyOff = sequelize.define('HrmsShiftWeeklyOff', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Shift ID
    shift_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Shift ID is required'
            }
        },
        comment: 'Reference to hrms_shift_master'
    },

    // Week number
    week_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Week number is required'
            },
            min: 1,
            max: 5
        },
        comment: 'Week in rotation cycle (1-5)'
    },

    // Day of week
    day_of_week: {
        type: DataTypes.ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Day of week is required'
            }
        }
    },

    // Off type
    off_type: {
        type: DataTypes.ENUM('full_day', 'first_half', 'second_half', 'working'),
        allowNull: false,
        defaultValue: 'working',
        validate: {
            notNull: {
                msg: 'Off type is required'
            }
        },
        comment: 'Type of off'
    },

    // Is active
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'Must be 0 or 1'
            }
        },
        comment: '1=Active, 0=Inactive'
    }
}, {
    // Model options
    tableName: 'hrms_shift_weekly_off',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,

    // Indexes
    indexes: [
        {
            fields: ['shift_id']
        },
        {
            fields: ['shift_id', 'week_number', 'day_of_week']
        },
        {
            fields: ['is_active']
        },
        {
            unique: true,
            fields: ['shift_id', 'week_number', 'day_of_week'],
            name: 'unique_shift_week_day'
        }
    ]
});

// Define associations
HrmsShiftWeeklyOff.associate = (models) => {
    // Weekly off belongs to Shift
    HrmsShiftWeeklyOff.belongsTo(models.HrmsShiftMaster, {
        foreignKey: 'shift_id',
        as: 'shift'
    });
};

module.exports = {
    HrmsShiftWeeklyOff
};
