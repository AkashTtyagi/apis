/**
 * HRMS Role Master Model
 * Sequelize model for hrms_role_master table
 * Global template roles
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsRoleMaster = sequelize.define('HrmsRoleMaster', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    application_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'NULL = Super Admin (access to all applications), INT = specific application'
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
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    tableName: 'hrms_role_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['application_id', 'role_code'],
            name: 'idx_app_role_code'
        },
        { fields: ['application_id'] },
        { fields: ['is_active'] }
    ],
    comment: 'Global role master - template roles. application_id=NULL for Super Admin'
});

module.exports = { HrmsRoleMaster };
