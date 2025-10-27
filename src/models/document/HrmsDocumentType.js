const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsDocumentType = sequelize.define('HrmsDocumentType', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Company ID (0 for template document types)'
    },
    folder_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    document_type_code: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    document_type_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    document_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Document constraints
    allow_single_document: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Employee can have only one document of this type'
    },
    allow_multiple_documents: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Employee can have multiple documents'
    },
    is_mandatory: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Document is mandatory for employee'
    },
    allow_not_applicable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Employee can mark as N/A'
    },
    require_expiry_date: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Ask for document expiry date'
    },

    // Additional settings
    allowed_file_types: {
        type: DataTypes.STRING(500),
        defaultValue: 'pdf,jpg,jpeg,png,doc,docx',
        comment: 'Comma-separated allowed extensions'
    },
    max_file_size_mb: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 5.00,
        comment: 'Maximum file size in MB'
    },

    display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_system_type: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'System types cannot be deleted'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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
    tableName: 'hrms_document_types',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['company_id'] },
        { fields: ['folder_id'] },
        { fields: ['document_type_code'] },
        { fields: ['is_active'] }
    ]
});

module.exports = HrmsDocumentType;
