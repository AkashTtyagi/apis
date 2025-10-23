/**
 * HRMS Application Model
 * Sequelize model for hrms_applications table
 * Stores applications (ESS, Admin, Payroll, etc.)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsApplication = sequelize.define('HrmsApplication', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    app_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'ESS, ADMIN, PAYROLL'
    },
    app_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    app_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    app_icon: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    app_url: {
        type: DataTypes.STRING(255),
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
    tableName: 'hrms_applications',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['app_code'] },
        { fields: ['is_active'] }
    ]
});

module.exports = { HrmsApplication };
