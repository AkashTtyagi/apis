/**
 * HRMS Company Designation Model
 * Sequelize model for hrms_company_designations table
 * Stores company-specific designations with detailed role information
 * Each company can customize designations based on HrmsDesignationMaster
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsCompanyDesignation = sequelize.define('HrmsCompanyDesignation', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Company ID
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Company ID is required'
            }
        },
        comment: 'Foreign key to hrms_companies'
    },

    // Designation Master ID (optional - can be derived from master or custom)
    designation_master_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_designation_master (NULL for custom designations)'
    },

    // Designation Code
    designation_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Designation code is required'
            },
            notEmpty: {
                msg: 'Designation code cannot be empty'
            }
        },
        comment: 'Unique code within company (e.g., MGR, SR_DEV, JR_DEV)'
    },

    // Designation Name (required)
    designation_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Designation name is required'
            },
            notEmpty: {
                msg: 'Designation name cannot be empty'
            }
        },
        comment: 'Display name of the designation'
    },

    // Minimum Experience (years)
    min_experience_years: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true,
        validate: {
            min: 0
        },
        comment: 'Minimum years of experience required for this designation'
    },

    // Maximum Experience (years)
    max_experience_years: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true,
        validate: {
            min: 0
        },
        comment: 'Maximum years of experience for this designation'
    },

    // Minimum Annual Salary
    min_annual_salary: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Minimum annual salary range for this designation'
    },

    // Maximum Annual Salary
    max_annual_salary: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Maximum annual salary range for this designation'
    },

    // Job Function
    job_function: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Primary job function or role category (e.g., Engineering, Sales, HR, Finance)'
    },

    // Grade ID (Foreign Key to HrmsGrade)
    grade_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_grades - links designation to pay grade'
    },

    // Skill ID (Foreign Key to HrmsCompanySkills) - Optional
    skill_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_company_skills - skills tagged to this designation (optional)'
    },

    // Job Description
    job_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Detailed job description and responsibilities'
    },

    // Is Active
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    // Display Order
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order for displaying in dropdowns'
    },

    // Created by user ID
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who created this record'
    },

    // Updated by user ID
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last updated this record'
    },

    // Soft delete timestamp
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp when record was soft deleted'
    }
}, {
    // Model options
    tableName: 'hrms_company_designations',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    // Indexes
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'designation_code'],
            name: 'unique_company_designation_code'
        },
        {
            fields: ['company_id']
        },
        {
            fields: ['designation_master_id']
        },
        {
            fields: ['grade_id']
        },
        {
            fields: ['skill_id']
        },
        {
            fields: ['job_function']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['display_order']
        },
        {
            fields: ['created_by']
        },
        {
            fields: ['updated_by']
        },
        {
            fields: ['deleted_at']
        }
    ]
});

/**
 * Define associations
 */
HrmsCompanyDesignation.associate = (models) => {
    // Company Designation belongs to Company
    HrmsCompanyDesignation.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    // Company Designation belongs to Designation Master (optional)
    HrmsCompanyDesignation.belongsTo(models.HrmsDesignationMaster, {
        foreignKey: 'designation_master_id',
        as: 'designationMaster'
    });

    // Company Designation belongs to Grade
    HrmsCompanyDesignation.belongsTo(models.HrmsGrade, {
        foreignKey: 'grade_id',
        as: 'grade'
    });

    // Company Designation belongs to Company Skill (optional)
    HrmsCompanyDesignation.belongsTo(models.HrmsCompanySkills, {
        foreignKey: 'skill_id',
        as: 'skill'
    });

    // Company Designation has many Employees
    HrmsCompanyDesignation.hasMany(models.HrmsEmployee, {
        foreignKey: 'designation_id',
        as: 'employees'
    });
};

module.exports = {
    HrmsCompanyDesignation
};
