/**
 * Expense Category Model
 * Defines expense categories with different expense types
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseCategory = sequelize.define('ExpenseCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_companies'
    },

    // Basic Information
    category_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Name of the category (e.g., Travel, Food)'
    },
    category_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Unique code for the category'
    },
    category_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of the category'
    },
    category_icon: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Icon name or URL for UI'
    },

    // Category Hierarchy
    parent_category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK to self for sub-categories'
    },

    // Expense Type
    expense_type: {
        type: DataTypes.ENUM('Amount', 'Mileage', 'Per_Diem', 'Time_Based'),
        allowNull: false,
        defaultValue: 'Amount',
        comment: 'Amount=Fixed/Variable, Mileage=Distance-based, Per_Diem=Daily allowance, Time_Based=Hourly'
    },

    // Mileage Configuration (when expense_type = 'Mileage')
    mileage_rate_per_km: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Rate per kilometer'
    },
    mileage_vehicle_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Vehicle type (Car, Bike, etc.)'
    },

    // Per Diem Configuration (when expense_type = 'Per_Diem')
    per_diem_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Daily rate amount'
    },
    per_diem_half_day_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Half day rate amount'
    },

    // Time-Based Configuration (when expense_type = 'Time_Based')
    hourly_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Hourly rate amount'
    },
    min_hours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Minimum hours for billing'
    },
    max_hours_per_day: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Maximum hours per day'
    },

    // Receipt Configuration
    receipt_required: {
        type: DataTypes.ENUM('Always', 'Above_Limit', 'Never'),
        allowNull: false,
        defaultValue: 'Above_Limit'
    },
    receipt_required_above: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 500.00,
        comment: 'Receipt required if amount exceeds this'
    },

    // Tax Configuration
    is_taxable: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1=Taxable expense, 0=Non-taxable'
    },
    tax_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Tax percentage if taxable'
    },
    gst_applicable: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1=GST applicable'
    },
    hsn_code: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'HSN/SAC code for GST'
    },

    // Display Order
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order for UI display'
    },

    // Status
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Active, 0=Inactive'
    },

    // Audit fields
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User ID who created this record'
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last updated this record'
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp'
    },
    deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who deleted this record'
    }
}, {
    tableName: 'hrms_expense_categories',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_company_active',
            fields: ['company_id', 'is_active']
        },
        {
            name: 'idx_category_code',
            fields: ['category_code']
        },
        {
            name: 'idx_expense_type',
            fields: ['expense_type']
        },
        {
            name: 'idx_parent_category',
            fields: ['parent_category_id']
        },
        {
            name: 'idx_company_category_code',
            unique: true,
            fields: ['company_id', 'category_code']
        }
    ]
});

module.exports = { ExpenseCategory };
