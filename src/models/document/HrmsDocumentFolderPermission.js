const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsDocumentFolderPermission = sequelize.define('HrmsDocumentFolderPermission', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    folder_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    role_type: {
        type: DataTypes.ENUM(
            'employee',
            'reporting_manager',
            'rm_of_rm',
            'department_head',
            'hr',
            'admin',
            'custom_role'
        ),
        allowNull: false
    },
    custom_role_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Reference to hrms_roles table for custom roles'
    },
    can_view: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Can view folder and documents'
    },
    can_add: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Can add/upload documents'
    },
    can_update: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Can update/edit documents'
    },
    can_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Can delete documents'
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
    tableName: 'hrms_document_folder_permissions',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['folder_id'] },
        { fields: ['role_type'] },
        { fields: ['custom_role_id'] }
    ]
});

module.exports = HrmsDocumentFolderPermission;
