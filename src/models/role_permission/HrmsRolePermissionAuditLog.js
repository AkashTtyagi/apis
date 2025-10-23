/**
 * HRMS Role Permission Audit Log Model
 * Sequelize model for hrms_role_permission_audit_log table
 * Tracks all role and permission changes
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsRolePermissionAuditLog = sequelize.define('HrmsRolePermissionAuditLog', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    entity_type: {
        type: DataTypes.ENUM('application', 'menu', 'role_master', 'role', 'user_role', 'user_permission'),
        allowNull: false
    },
    entity_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    action: {
        type: DataTypes.ENUM('create', 'update', 'delete', 'assign', 'revoke', 'grant'),
        allowNull: false
    },
    old_value: {
        type: DataTypes.JSON,
        allowNull: true
    },
    new_value: {
        type: DataTypes.JSON,
        allowNull: true
    },
    changed_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    change_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'hrms_role_permission_audit_log',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['company_id'] },
        { fields: ['entity_type', 'entity_id'] },
        { fields: ['action'] },
        { fields: ['changed_by'] },
        { fields: ['created_at'] }
    ]
});

module.exports = { HrmsRolePermissionAuditLog };
