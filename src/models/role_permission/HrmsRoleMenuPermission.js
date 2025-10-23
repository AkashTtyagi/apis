/**
 * HRMS Role Menu Permission Model
 * Sequelize model for hrms_role_menu_permissions table
 * Company role permissions
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsRoleMenuPermission = sequelize.define('HrmsRoleMenuPermission', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    role_id: {
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
    is_granted: {
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
    tableName: 'hrms_role_menu_permissions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['role_id', 'menu_id', 'permission_id'],
            name: 'unique_role_menu_perm'
        },
        { fields: ['role_id'] },
        { fields: ['menu_id'] },
        { fields: ['permission_id'] }
    ]
});

module.exports = { HrmsRoleMenuPermission };
