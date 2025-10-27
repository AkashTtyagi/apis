const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsEmployeeDocumentFieldValue = sequelize.define('HrmsEmployeeDocumentFieldValue', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    employee_document_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    field_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Reference to hrms_document_type_fields'
    },
    field_value: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'hrms_employee_document_field_values',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['employee_document_id'] },
        { fields: ['field_id'] }
    ]
});

module.exports = HrmsEmployeeDocumentFieldValue;
