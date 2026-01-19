/**
 * Expense Category Custom Field Model
 * Defines custom fields configuration per expense category
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseCategoryCustomField = sequelize.define('ExpenseCategoryCustomField', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_expense_categories'
    },

    // Field Configuration
    field_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Internal field name (snake_case)'
    },
    field_label: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Display label'
    },
    field_type: {
        type: DataTypes.ENUM('Text', 'Number', 'Date', 'DateTime', 'Dropdown', 'MultiSelect', 'File', 'Checkbox', 'TextArea'),
        allowNull: false
    },
    field_placeholder: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Placeholder text'
    },
    field_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Help text for the field'
    },

    // Validation
    is_required: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1=Mandatory field'
    },
    min_length: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Minimum length for text fields'
    },
    max_length: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Maximum length for text fields'
    },
    min_value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Minimum value for number fields'
    },
    max_value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Maximum value for number fields'
    },
    regex_pattern: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Regex validation pattern'
    },

    // Dropdown Options (JSON array for Dropdown/MultiSelect types)
    dropdown_options: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '[{"value": "opt1", "label": "Option 1"}, ...]'
    },

    // File Configuration (for File type)
    allowed_file_types: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Allowed extensions (e.g., "pdf,jpg,png")'
    },
    max_file_size_mb: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5,
        comment: 'Maximum file size in MB'
    },

    // Display
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    show_in_list: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1=Show in expense list view'
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
    }
}, {
    tableName: 'hrms_expense_category_custom_fields',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_category',
            fields: ['category_id']
        },
        {
            name: 'idx_field_name',
            fields: ['field_name']
        },
        {
            name: 'idx_category_field_name',
            unique: true,
            fields: ['category_id', 'field_name']
        }
    ]
});

module.exports = { ExpenseCategoryCustomField };
