/**
 * Organization Departments Model
 * Junction table linking organizations to their departments
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsOrgDepartments = sequelize.define('HrmsOrgDepartments', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for org-department mapping'
    },
    org_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Reference to organization (hrms_companies.id)'
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
    tableName: 'hrms_org_departments',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_org_id',
            fields: ['org_id']
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
            name: 'unique_org_department',
            unique: true,
            fields: ['org_id', 'department_id']
        }
    ],
    comment: 'Organization departments table - maps departments to organizations'
});

/**
 * Define associations
 */
HrmsOrgDepartments.associate = (models) => {
    // OrgDepartment belongs to Company
    HrmsOrgDepartments.belongsTo(models.HrmsCompany, {
        foreignKey: 'org_id',
        as: 'company'
    });

    // OrgDepartment belongs to Department Master
    HrmsOrgDepartments.belongsTo(models.HrmsDepartmentMaster, {
        foreignKey: 'department_id',
        as: 'department'
    });
};

module.exports = { HrmsOrgDepartments };
