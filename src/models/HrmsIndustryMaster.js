/**
 * Industry Master Model
 * Stores all industries/sectors
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsIndustryMaster = sequelize.define('HrmsIndustryMaster', {
    industry_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for industry'
    },
    industry_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: 'Name of the industry'
    },
    industry_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique code for the industry'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of the industry'
    },
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: 'Whether the industry is active (1=active, 0=inactive)'
    },
    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'User ID who created this record'
    },
    updated_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'User ID who last updated this record'
    }
}, {
    tableName: 'hrms_industry_master',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_industry_code',
            fields: ['industry_code']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        },
        {
            name: 'idx_created_by',
            fields: ['created_by']
        },
        {
            name: 'idx_updated_by',
            fields: ['updated_by']
        }
    ],
    comment: 'Industry master table - stores all industry types'
});

/**
 * Define associations
 */
HrmsIndustryMaster.associate = (models) => {
    // Industry has many Departments
    HrmsIndustryMaster.hasMany(models.HrmsDepartmentMaster, {
        foreignKey: 'industry_id',
        as: 'departments'
    });

    // Industry has many Organizations/Companies
    HrmsIndustryMaster.hasMany(models.HrmsCompany, {
        foreignKey: 'org_industry',
        as: 'companies'
    });
};

module.exports = { HrmsIndustryMaster };
