const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const HrmsDocumentTypeField = sequelize.define('HrmsDocumentTypeField', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    document_type_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    field_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    field_label: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    field_type: {
        type: DataTypes.ENUM(
            'text',
            'textarea',
            'number',
            'date',
            'time',
            'datetime',
            'email',
            'phone',
            'url',
            'single_select',
            'multi_select',
            'checkbox',
            'radio',
            'file'
        ),
        allowNull: false
    },
    field_values: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON array of options for select/radio/checkbox fields'
    },
    placeholder: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    default_value: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    validation_rules: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON object with validation rules (min, max, pattern, etc)'
    },

    // Field settings
    is_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_readonly: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_visible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    help_text: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    updated_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    }
}, {
    tableName: 'hrms_document_type_fields',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['document_type_id'] },
        { fields: ['field_type'] }
    ]
});

module.exports = HrmsDocumentTypeField;
