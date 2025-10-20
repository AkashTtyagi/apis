/**
 * HRMS Roster Detail Model
 *
 * Purpose: Store date-shift mapping for each roster
 * Each roster has multiple detail entries defining which shift on which date
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsRosterDetail = sequelize.define('HrmsRosterDetail', {
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

    // Date and Shift
    roster_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Date for this roster entry'
    },

    shift_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Shift applicable on this date'
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
    tableName: 'hrms_roster_details',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['roster_id'] },
        { fields: ['roster_date'] },
        { fields: ['shift_id'] },
        { fields: ['is_active'] },
        { unique: true, fields: ['roster_id', 'roster_date', 'deleted_at'] }
    ]
});

HrmsRosterDetail.associate = (models) => {
    HrmsRosterDetail.belongsTo(models.HrmsRoster, {
        foreignKey: 'roster_id',
        as: 'roster'
    });

    HrmsRosterDetail.belongsTo(models.HrmsShiftMaster, {
        foreignKey: 'shift_id',
        as: 'shift'
    });
};

module.exports = {
    HrmsRosterDetail
};
