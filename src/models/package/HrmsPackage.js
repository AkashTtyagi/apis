/**
 * HRMS Package Model
 * Sequelize model for hrms_packages table
 * Stores different packages (Basic, Standard, Enterprise)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsPackage = sequelize.define('HrmsPackage', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    package_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'BASIC, STANDARD, ENTERPRISE'
    },
    package_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    package_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price_monthly: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Monthly price'
    },
    price_yearly: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Yearly price'
    },
    max_users: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Maximum users allowed, NULL = unlimited'
    },
    max_entities: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Maximum entities allowed, NULL = unlimited'
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
    tableName: 'hrms_packages',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['package_code'] },
        { fields: ['is_active'] }
    ]
});

module.exports = { HrmsPackage };
