/**
 * Expense Mileage Rate Model
 * Mileage reimbursement rates by vehicle type and location
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseMileageRate = sequelize.define('ExpenseMileageRate', {
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
    vehicle_type: {
        type: DataTypes.ENUM('Two_Wheeler', 'Four_Wheeler', 'Public_Transport', 'Other'),
        defaultValue: 'Four_Wheeler'
    },
    fuel_type: {
        type: DataTypes.ENUM('Petrol', 'Diesel', 'CNG', 'Electric', 'Any'),
        defaultValue: 'Any'
    },
    rate_per_unit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    min_distance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    max_distance_per_day: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    max_distance_per_month: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },

    // Applicability
    location_group_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    grade_ids: {
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
    tableName: 'hrms_expense_mileage_rates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'idx_company_code', unique: true, fields: ['company_id', 'rate_code'] },
        { name: 'idx_vehicle_type', fields: ['vehicle_type'] },
        { name: 'idx_effective', fields: ['effective_from', 'effective_to'] },
        { name: 'idx_active', fields: ['is_active'] }
    ]
});

module.exports = { ExpenseMileageRate };
