/**
 * HRMS Role Model
 * Sequelize model for hrms_roles table
 * Company-specific roles
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsRole = sequelize.define('HrmsRole', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    application_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'NULL = Super Admin (access to all applications), INT = specific application'
    },
    role_master_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'NULL if custom role'
    },
    role_code: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    role_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    role_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_system_role: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    is_super_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'TRUE if role is created from super admin role master'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'hrms_roles',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            // Changed from unique to regular index because MySQL treats NULL != NULL
            // This allows multiple super admin roles (application_id=NULL) per company
            // Code-level validation in createRoleFromMaster prevents duplicate super admin
            unique: false,
            fields: ['company_id', 'application_id', 'role_code'],
            name: 'idx_company_app_role'
        },
        { fields: ['company_id'] },
        { fields: ['application_id'] },
        { fields: ['role_master_id'] },
        { fields: ['is_active'] },
        {
            fields: ['company_id', 'is_super_admin'],
            name: 'idx_super_admin'
        }
    ]
});

module.exports = { HrmsRole };
