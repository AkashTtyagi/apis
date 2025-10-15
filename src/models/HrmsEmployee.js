/**
 * HRMS Employee Model
 * Sequelize model for hrms_employees table
 * Stores core employee information (direct fields)
 * Additional custom fields are stored in hrms_template_responses
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsEmployee = sequelize.define('HrmsEmployee', {
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

    // User ID (link to hrms_user_details)
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'User ID is required'
            }
        },
        comment: 'Foreign key to hrms_user_details'
    },

    // Employee Code
    employee_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Employee code is required'
            }
        },
        comment: 'Unique employee identifier within company'
    },

    // First Name
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'First name is required'
            }
        }
    },

    // Middle Name
    middle_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    // Last Name
    last_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    // Email
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Email is required'
            },
            isEmail: {
                msg: 'Must be a valid email address'
            }
        }
    },

    // Phone
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },

    // Date of Birth
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    // Gender
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true
    },

    // Date of Joining
    date_of_joining: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    // Department ID (required)
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_departments'
    },

    // Sub-Department ID (optional)
    sub_department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_sub_departments'
    },

    // Designation ID
    designation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_company_designations (employee gets grade through designation)'
    },

    // Level ID
    level_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_levels - hierarchy level (Junior, Senior, Lead, etc.)'
    },

    // Reporting Manager ID
    reporting_manager_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_employees (self-reference)'
    },

    // Leave Policy ID
    leave_policy_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_leave_policy_master'
    },

    // Shift ID
    shift_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_shift_master'
    },

    // Timezone ID
    timezone_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_timezone_master - timezone where employee works'
    },

    // Employment Type
    employment_type: {
        type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern'),
        allowNull: true,
        defaultValue: 'full_time'
    },

    // Employee Status (numeric reference to hrms_employee_status_master)
    // 0 - Active, 1 - Probation, 2 - Internship, 3 - Separated, 4 - Absconded, 5 - Terminated, 6 - Suspended
    status: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 6
        },
        comment: 'Foreign key to hrms_employee_status_master (0=Active, 1=Probation, 2=Internship, 3=Separated, 4=Absconded, 5=Terminated, 6=Suspended)'
    },

    // Profile Picture
    profile_picture: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'URL or path to profile picture'
    },

    // Is Deleted (Soft Delete)
    is_deleted: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '0=Not Deleted, 1=Deleted (Soft Delete)'
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
    tableName: 'hrms_employees',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    // Indexes
    indexes: [
        {
            fields: ['company_id']
        },
        {
            fields: ['user_id']
        },
        {
            unique: true,
            fields: ['company_id', 'employee_code'],
            name: 'unique_company_employee_code'
        },
        {
            fields: ['email']
        },
        {
            fields: ['department_id']
        },
        {
            fields: ['sub_department_id']
        },
        {
            fields: ['designation_id']
        },
        {
            fields: ['level_id']
        },
        {
            fields: ['reporting_manager_id']
        },
        {
            fields: ['leave_policy_id']
        },
        {
            fields: ['shift_id']
        },
        {
            fields: ['timezone_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['is_deleted']
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

// Define associations
HrmsEmployee.associate = (models) => {
    // Employee belongs to Company
    HrmsEmployee.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    // Employee belongs to Company Designation (which has grade)
    HrmsEmployee.belongsTo(models.HrmsCompanyDesignation, {
        foreignKey: 'designation_id',
        as: 'designation'
    });

    // Employee belongs to Level
    HrmsEmployee.belongsTo(models.HrmsLevel, {
        foreignKey: 'level_id',
        as: 'level'
    });

    // Employee belongs to status master
    HrmsEmployee.belongsTo(models.HrmsEmployeeStatusMaster, {
        foreignKey: 'status',
        as: 'statusDetails',
        targetKey: 'id'
    });

    // Employee belongs to leave policy
    HrmsEmployee.belongsTo(models.HrmsLeavePolicyMaster, {
        foreignKey: 'leave_policy_id',
        as: 'leavePolicy'
    });

    // Employee belongs to shift
    HrmsEmployee.belongsTo(models.HrmsShiftMaster, {
        foreignKey: 'shift_id',
        as: 'shift'
    });

    // Employee belongs to timezone
    HrmsEmployee.belongsTo(models.HrmsTimezoneMaster, {
        foreignKey: 'timezone_id',
        as: 'timezone'
    });

    // Self-referencing association for reporting manager
    HrmsEmployee.belongsTo(models.HrmsEmployee, {
        foreignKey: 'reporting_manager_id',
        as: 'reportingManager'
    });

    HrmsEmployee.hasMany(models.HrmsEmployee, {
        foreignKey: 'reporting_manager_id',
        as: 'reportees'
    });
};

module.exports = {
    HrmsEmployee
};
