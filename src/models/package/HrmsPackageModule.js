/**
 * HRMS Package Module Mapping Model
 * Sequelize model for hrms_package_modules table
 * Maps which modules are in which package
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsPackageModule = sequelize.define('HrmsPackageModule', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    package_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_packages'
    },
    module_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_modules'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'hrms_package_modules',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['package_id', 'module_id'],
            name: 'unique_package_module'
        },
        { fields: ['package_id'] },
        { fields: ['module_id'] }
    ]
});

module.exports = { HrmsPackageModule };
