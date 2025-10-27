const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsDocumentFolder = sequelize.define('HrmsDocumentFolder', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Company ID (0 for template folders)'
    },
    folder_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    folder_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_system_folder: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'System folders cannot be deleted'
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
    tableName: 'hrms_document_folders',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['company_id'] },
        { fields: ['is_active'] }
    ]
});

module.exports = HrmsDocumentFolder;
