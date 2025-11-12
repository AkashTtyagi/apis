/**
 * HRMS Menu Model
 * Sequelize model for hrms_menus table
 * N-level menu hierarchy with container and screen types
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsMenu = sequelize.define('HrmsMenu', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    application_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_applications'
    },
    parent_menu_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Parent menu for hierarchy'
    },
    menu_code: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    menu_name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    menu_type: {
        type: DataTypes.ENUM('container', 'screen'),
        allowNull: false,
        comment: 'container=grouping, screen=page'
    },
    menu_icon: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    route_path: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Frontend route (screen type only)'
    },
    component_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    menu_description: {
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
    tableName: 'hrms_menus',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['application_id', 'menu_code'],
            name: 'unique_app_menu_code'
        },
        { fields: ['application_id'] },
        { fields: ['parent_menu_id'] },
        { fields: ['menu_type'] },
        { fields: ['is_active'] }
    ]
});

module.exports = { HrmsMenu };
