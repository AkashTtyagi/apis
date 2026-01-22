/**
 * Expense Per Diem Rate Model
 * Per diem rates by location and tier
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpensePerDiemRate = sequelize.define('ExpensePerDiemRate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rate_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    rate_code: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    // Rate Configuration
    location_group_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    city_tier: {
        type: DataTypes.ENUM('Metro', 'Tier_1', 'Tier_2', 'Tier_3', 'International'),
        defaultValue: 'Metro'
    },
    full_day_rate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    half_day_rate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    hourly_rate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },

    // Meal Rates
    breakfast_rate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    lunch_rate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    dinner_rate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    incidental_rate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },

    // Applicability
    grade_ids: {
        type: DataTypes.JSON,
        allowNull: true
    },
    designation_ids: {
        type: DataTypes.JSON,
        allowNull: true
    },
    effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    // Status
    is_active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'hrms_expense_per_diem_rates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'idx_company_code', unique: true, fields: ['company_id', 'rate_code'] },
        { name: 'idx_location_group', fields: ['location_group_id'] },
        { name: 'idx_city_tier', fields: ['city_tier'] },
        { name: 'idx_effective', fields: ['effective_from', 'effective_to'] },
        { name: 'idx_active', fields: ['is_active'] }
    ]
});

module.exports = { ExpensePerDiemRate };
