/**
 * HRMS Rotating Shift Model
 *
 * Purpose: Frequency-based shift rotation pattern
 * Admin selects shift order and frequency
 *
 * Example 1: Daily rotation
 * Shift Order: [Morning (id=1), Evening (id=2), Night (id=3)]
 * Frequency: daily
 * Result: Day 1=Morning, Day 2=Evening, Day 3=Night, Day 4=Morning, Day 5=Evening...
 *
 * Example 2: Weekly rotation
 * Shift Order: [Morning, Evening, Night]
 * Frequency: weekly
 * Result: Week 1=Morning, Week 2=Evening, Week 3=Night, Week 4=Morning...
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsRotatingShift = sequelize.define('HrmsRotatingShift', {
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

    // Pattern Name
    pattern_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: 'Name of rotation pattern (e.g., "Day-Evening-Night Rotation")'
    },

    pattern_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Shift Order (JSON array)
    shift_order: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array of shift IDs in rotation order: [1, 2, 3] means Shift A, B, C'
    },

    // Frequency
    frequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'bi-weekly', 'monthly'),
        allowNull: false,
        defaultValue: 'weekly',
        comment: 'daily=change every day, weekly=change every week, bi-weekly=change every 2 weeks, monthly=change every month'
    },

    // Start Date for this rotation pattern
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Date when rotation pattern starts'
    },

    // End Date (optional, NULL = ongoing)
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date when rotation pattern ends (NULL = ongoing)'
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
    tableName: 'hrms_rotating_shift_patterns',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['company_id'] },
        { fields: ['start_date'] },
        { fields: ['end_date'] },
        { fields: ['is_active'] },
        { fields: ['frequency'] }
    ]
});

HrmsRotatingShift.associate = (models) => {
    HrmsRotatingShift.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    // Applicability rules for this pattern
    HrmsRotatingShift.hasMany(models.HrmsRotatingShiftApplicability, {
        foreignKey: 'pattern_id',
        as: 'applicability'
    });
};

module.exports = {
    HrmsRotatingShift
};
