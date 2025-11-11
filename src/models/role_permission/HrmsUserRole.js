/**
 * HRMS User Role Model
 * Sequelize model for hrms_user_roles table
 * User role assignments
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsUserRole = sequelize.define('HrmsUserRole', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    role_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    application_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'NULL = Super Admin user (access to all applications), INT = specific application'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    revoked_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    revoked_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'hrms_user_roles',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'role_id', 'application_id'],
            name: 'unique_user_role_app'
        },
        { fields: ['user_id'] },
        { fields: ['role_id'] },
        { fields: ['application_id'] },
        { fields: ['is_active'] }
    ]
});

module.exports = { HrmsUserRole };
