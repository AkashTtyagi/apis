/**
 * Rotating Shift Applicability Model
 * Defines where a rotating shift pattern is applicable
 * Same structure as workflow applicability
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsRotatingShiftApplicability = sequelize.define('HrmsRotatingShiftApplicability', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    pattern_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_rotating_shift_patterns'
    },

    // Primary Applicability
    applicability_type: {
        type: DataTypes.ENUM(
            'company',
            'department',
            'sub_department',
            'designation',
            'branch',
            'location',
            'employee_type',
            'grade',
            'level',
            'employee'
        ),
        allowNull: false,
        comment: 'Primary applicability type'
    },

    applicability_value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comma-separated IDs for primary applicability (e.g., "1,2,3" for departments)'
    },

    company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Specific company (usually inherited from pattern)'
    },

    is_excluded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'TRUE = exclude this criteria, FALSE = include'
    },

    // Advanced Applicability
    advanced_applicability_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'none',
        comment: 'Advanced filter: none, employee_type, branch, region, zone, etc.'
    },

    advanced_applicability_value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comma-separated IDs for advanced applicability filter'
    },

    // Priority
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Priority if multiple patterns match (lower = higher priority)'
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
    tableName: 'hrms_rotating_shift_applicability',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['pattern_id'] },
        { fields: ['applicability_type'] },
        { fields: ['company_id'] },
        { fields: ['applicability_value'] },
        { fields: ['advanced_applicability_type'] },
        { fields: ['advanced_applicability_value'] },
        { fields: ['priority'] },
        { fields: ['is_active'] }
    ]
});

HrmsRotatingShiftApplicability.associate = (models) => {
    HrmsRotatingShiftApplicability.belongsTo(models.HrmsRotatingShift, {
        foreignKey: 'pattern_id',
        as: 'pattern'
    });

    HrmsRotatingShiftApplicability.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });
};

module.exports = {
    HrmsRotatingShiftApplicability
};
