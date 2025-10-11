/**
 * Company Departments Model
 * Junction table linking companies to their departments
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsCompanyDepartments = sequelize.define('HrmsCompanyDepartments', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for company-department mapping'
    },
    company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Reference to company (hrms_companies.id)'
    },
    department_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Reference to department master'
    },
    department_head_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Employee ID of department head'
    },
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: 'Whether the department is active for this org (1=active, 0=inactive)'
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
    tableName: 'hrms_company_departments',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_company_id',
            fields: ['company_id']
        },
        {
            name: 'idx_department_id',
            fields: ['department_id']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        },
        {
            name: 'idx_department_head_id',
            fields: ['department_head_id']
        },
        {
            name: 'unique_company_department',
            unique: true,
            fields: ['company_id', 'department_id']
        }
    ],
    comment: 'Company departments table - maps departments to companies'
});

/**
 * Define associations
 */
HrmsCompanyDepartments.associate = (models) => {
    // CompanyDepartment belongs to Company
    HrmsCompanyDepartments.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    // CompanyDepartment belongs to Department Master
    HrmsCompanyDepartments.belongsTo(models.HrmsDepartmentMaster, {
        foreignKey: 'department_id',
        as: 'department'
    });
};

module.exports = { HrmsCompanyDepartments };
