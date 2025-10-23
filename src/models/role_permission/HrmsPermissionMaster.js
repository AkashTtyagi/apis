/**
 * HRMS Permission Master Model
 * Sequelize model for hrms_permissions_master table
 * Stores global permissions (View, Add, Edit, Delete, etc.)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsPermissionMaster = sequelize.define('HrmsPermissionMaster', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    permission_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'VIEW, ADD, EDIT, DELETE'
    },
    permission_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    permission_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'hrms_permissions_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['permission_code'] },
        { fields: ['is_active'] }
    ]
});

module.exports = { HrmsPermissionMaster };
