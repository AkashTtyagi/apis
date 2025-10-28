const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsLetterTemplateCustomField = sequelize.define('HrmsLetterTemplateCustomField', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    letter_template_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    field_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    field_slug: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    field_type: {
        type: DataTypes.ENUM('text', 'number', 'date', 'select', 'textarea', 'email', 'phone'),
        defaultValue: 'text'
    },
    field_options: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON array for select type'
    },
    is_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    default_value: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    placeholder: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    help_text: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    validation_rules: {
        type: DataTypes.JSON,
        allowNull: true
    },
    display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    }
}, {
    tableName: 'hrms_letter_template_custom_fields',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['letter_template_id'] },
        { fields: ['is_active'] },
        { fields: ['letter_template_id', 'field_slug'], unique: true }
    ]
});

module.exports = HrmsLetterTemplateCustomField;
