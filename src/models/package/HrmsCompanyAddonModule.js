/**
 * HRMS Company Addon Module Model
 * Sequelize model for hrms_company_addon_modules table
 * Tracks additional modules purchased by companies beyond base package
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsCompanyAddonModule = sequelize.define('HrmsCompanyAddonModule', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_companies'
    },
    module_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_modules - addon module'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Active status'
    },
    added_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User who added this addon'
    }
}, {
    tableName: 'hrms_company_addon_modules',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'module_id'],
            name: 'unique_company_module'
        },
        { fields: ['company_id'] },
        { fields: ['module_id'] },
        { fields: ['is_active'] }
    ]
});

module.exports = { HrmsCompanyAddonModule };
