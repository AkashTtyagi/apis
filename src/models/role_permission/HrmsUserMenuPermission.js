/**
 * HRMS User Menu Permission Model
 * Sequelize model for hrms_user_menu_permissions table
 * User-specific permission overrides (grant extra or revoke from role)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsUserMenuPermission = sequelize.define('HrmsUserMenuPermission', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    application_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    menu_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Must be screen type'
    },
    permission_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    permission_type: {
        type: DataTypes.ENUM('grant', 'revoke'),
        allowNull: false,
        comment: 'grant=add extra, revoke=remove from role'
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
    tableName: 'hrms_user_menu_permissions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'application_id', 'menu_id', 'permission_id'],
            name: 'unique_user_menu_perm'
        },
        { fields: ['user_id'] },
        { fields: ['application_id'] },
        { fields: ['menu_id'] },
        { fields: ['permission_id'] },
        { fields: ['permission_type'] }
    ]
});

module.exports = { HrmsUserMenuPermission };
