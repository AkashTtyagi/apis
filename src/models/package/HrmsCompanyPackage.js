/**
 * HRMS Company Package Model
 * Sequelize model for hrms_company_packages table
 * Assigns packages to companies
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsCompanyPackage = sequelize.define('HrmsCompanyPackage', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Company ID'
    },
    package_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_packages'
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Package activation date'
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Package expiry date, NULL = lifetime'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'hrms_company_packages',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['company_id'] },
        { fields: ['package_id'] },
        { fields: ['is_active'] }
    ]
});

module.exports = { HrmsCompanyPackage };
