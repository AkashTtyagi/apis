const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsDocumentAuditLog = sequelize.define('HrmsDocumentAuditLog', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    employee_document_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    folder_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    document_type_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },

    action: {
        type: DataTypes.ENUM(
            'folder_created',
            'folder_updated',
            'folder_deleted',
            'document_type_created',
            'document_type_updated',
            'document_type_deleted',
            'document_uploaded',
            'document_updated',
            'document_deleted',
            'document_marked_na',
            'document_viewed'
        ),
        allowNull: false
    },

    performed_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    performed_on_behalf_of: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'If admin uploaded for employee'
    },
    action_details: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional details about the action'
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    tableName: 'hrms_document_audit_logs',
    timestamps: true,
    underscored: true,
    updatedAt: false,
    indexes: [
        { fields: ['company_id'] },
        { fields: ['employee_document_id'] },
        { fields: ['action'] },
        { fields: ['performed_by'] },
        { fields: ['created_at'] }
    ]
});

module.exports = HrmsDocumentAuditLog;
