/**
 * HRMS Shift Break Rules Model
 * Sequelize model for hrms_shift_break_rules table
 * Stores break rules for each shift with order management
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsShiftBreakRules = sequelize.define('HrmsShiftBreakRules', {
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

    // Break name
    break_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Break name is required'
            }
        },
        comment: 'Name of break (e.g., Lunch Break, Tea Break)'
    },

    // Break start after minutes
    break_start_after_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Break start time is required'
            },
            min: 0
        },
        comment: 'Break starts after N minutes from shift start'
    },

    // Break duration
    break_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        validate: {
            notNull: {
                msg: 'Break duration is required'
            },
            min: 1
        },
        comment: 'Duration of break in minutes'
    },

    // Break order
    break_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            notNull: {
                msg: 'Break order is required'
            },
            min: 1
        },
        comment: 'Order of break in the shift (1, 2, 3...)'
    },

    // Is paid break
    is_paid: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'Must be 0 or 1'
            }
        },
        comment: '1=Paid break, 0=Unpaid break'
    },

    // Is mandatory break
    is_mandatory: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'Must be 0 or 1'
            }
        },
        comment: '1=Mandatory break, 0=Optional break'
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
    tableName: 'hrms_shift_break_rules',
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
            fields: ['shift_id', 'break_order']
        },
        {
            fields: ['is_active']
        }
    ]
});

// Define associations
HrmsShiftBreakRules.associate = (models) => {
    // Break rule belongs to Shift
    HrmsShiftBreakRules.belongsTo(models.HrmsShiftMaster, {
        foreignKey: 'shift_id',
        as: 'shift'
    });
};

module.exports = {
    HrmsShiftBreakRules
};
