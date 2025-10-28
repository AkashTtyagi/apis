const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsLetterCustomFieldValue = sequelize.define('HrmsLetterCustomFieldValue', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    employee_document_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Reference to hrms_employee_documents'
    },
    custom_field_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Reference to hrms_letter_template_custom_fields'
    },
    field_value: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'hrms_letter_custom_field_values',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['employee_document_id'] },
        { fields: ['custom_field_id'] },
        { fields: ['employee_document_id', 'custom_field_id'], unique: true }
    ]
});

module.exports = HrmsLetterCustomFieldValue;
