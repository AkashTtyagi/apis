/**
 * HRMS Module Menu Mapping Model
 * Sequelize model for hrms_module_menus table
 * Many-to-many mapping between modules and menus
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsModuleMenu = sequelize.define('HrmsModuleMenu', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    module_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_modules'
    },
    menu_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_menus'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Active status'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User who created mapping'
    }
}, {
    tableName: 'hrms_module_menus',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['module_id', 'menu_id'],
            name: 'unique_module_menu'
        },
        { fields: ['module_id'] },
        { fields: ['menu_id'] },
        { fields: ['is_active'] }
    ]
});

module.exports = { HrmsModuleMenu };
