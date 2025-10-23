/**
 * HRMS Role Master Menu Permission Model
 * Sequelize model for hrms_role_master_menu_permissions table
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsRoleMasterMenuPermission = sequelize.define('HrmsRoleMasterMenuPermission', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    role_master_id: {
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
    tableName: 'hrms_role_master_menu_permissions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['role_master_id', 'menu_id', 'permission_id'],
            name: 'unique_rm_menu_perm'
        },
        { fields: ['role_master_id'] },
        { fields: ['menu_id'] },
        { fields: ['permission_id'] }
    ]
});

module.exports = { HrmsRoleMasterMenuPermission };
