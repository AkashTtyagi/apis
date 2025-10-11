/**
 * Department Master Model
 * Stores departments linked to industries
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsDepartmentMaster = sequelize.define('HrmsDepartmentMaster', {
    department_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for department'
    },
    industry_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Reference to industry'
    },
    department_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Name of the department'
    },
    department_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Unique code for the department'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of the department'
    },
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: 'Whether the department is active (1=active, 0=inactive)'
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
    tableName: 'hrms_department_master',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_industry_id',
            fields: ['industry_id']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        },
        {
            name: 'idx_department_code',
            fields: ['department_code']
        },
        {
            name: 'unique_industry_department',
            unique: true,
            fields: ['industry_id', 'department_name']
        }
    ],
    comment: 'Department master table - stores departments for each industry'
});

/**
 * Define associations
 */
HrmsDepartmentMaster.associate = (models) => {
    // Department belongs to Industry
    HrmsDepartmentMaster.belongsTo(models.HrmsIndustryMaster, {
        foreignKey: 'industry_id',
        as: 'industry'
    });

    // Department can be assigned to many Organizations (through junction table)
    HrmsDepartmentMaster.hasMany(models.HrmsOrgDepartments, {
        foreignKey: 'department_id',
        as: 'organizationMappings'
    });
};

module.exports = { HrmsDepartmentMaster };
