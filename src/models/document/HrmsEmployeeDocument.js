const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsEmployeeDocument = sequelize.define('HrmsEmployeeDocument', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    employee_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    folder_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    document_type_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },

  
    
    document_title: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    document_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // File details
    file_name: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    file_path: {
        type: DataTypes.STRING(1000),
        allowNull: false
    },
    file_size_kb: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    file_type: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    file_extension: {
        type: DataTypes.STRING(10),
        allowNull: true
    },

    // Document dates
    issue_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    // Not Applicable
    is_not_applicable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    not_applicable_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Letter reference (optional - if document is generated from a letter template)
    letter_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Reference to generated letter if applicable'
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    uploaded_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    updated_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    }
}, {
    tableName: 'hrms_employee_documents',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['company_id'] },
        { fields: ['employee_id'] },
        { fields: ['folder_id'] },
        { fields: ['document_type_id'] },
        { fields: ['expiry_date'] },
        { fields: ['is_active'] }
    ]
});

module.exports = HrmsEmployeeDocument;
