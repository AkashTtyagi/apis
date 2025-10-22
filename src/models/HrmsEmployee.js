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

    // Entity ID (generic entity reference)
    entity_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Generic entity reference'
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

    // ==================
    // ORGANIZATIONAL HIERARCHY FIELDS
    // ==================

    // Cost Center ID
    cost_center_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_cost_center_master'
    },

    // Division ID
    division_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_division_master'
    },

    // Region ID
    region_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_region_master'
    },

    // Zone ID
    zone_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_zone_master'
    },

    // Business Unit ID
    business_unit_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_business_unit_master'
    },

    // Channel ID
    channel_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_channel_master'
    },

    // Category ID
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_category_master'
    },

    // Grade ID
    grade_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_grades'
    },

    // Branch ID
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_branch_master'
    },

    // Location ID
    location_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_location_master'
    },

    // ==================
    // END ORGANIZATIONAL HIERARCHY FIELDS
    // ==================

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

    // Employee Type ID (Foreign key to hrms_employee_type_master)
    employee_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_employee_type_master'
    },

    // Notice Period (in days)
    notice_period: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0
        },
        comment: 'Notice period in days (e.g., 30, 60, 90)'
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
            fields: ['entity_id']
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
            fields: ['cost_center_id']
        },
        {
            fields: ['division_id']
        },
        {
            fields: ['region_id']
        },
        {
            fields: ['zone_id']
        },
        {
            fields: ['business_unit_id']
        },
        {
            fields: ['channel_id']
        },
        {
            fields: ['category_id']
        },
        {
            fields: ['grade_id']
        },
        {
            fields: ['branch_id']
        },
        {
            fields: ['location_id']
        },
        {
            fields: ['shift_id']
        },
        {
            fields: ['timezone_id']
        },
        {
            fields: ['employee_type_id']
        },
        {
            fields: ['notice_period']
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

    // Organizational hierarchy associations
    if (models.HrmsCostCenterMaster) {
        HrmsEmployee.belongsTo(models.HrmsCostCenterMaster, {
            foreignKey: 'cost_center_id',
            as: 'costCenter'
        });
    }

    if (models.HrmsDivisionMaster) {
        HrmsEmployee.belongsTo(models.HrmsDivisionMaster, {
            foreignKey: 'division_id',
            as: 'division'
        });
    }

    if (models.HrmsRegionMaster) {
        HrmsEmployee.belongsTo(models.HrmsRegionMaster, {
            foreignKey: 'region_id',
            as: 'region'
        });
    }

    if (models.HrmsZoneMaster) {
        HrmsEmployee.belongsTo(models.HrmsZoneMaster, {
            foreignKey: 'zone_id',
            as: 'zone'
        });
    }

    if (models.HrmsBusinessUnitMaster) {
        HrmsEmployee.belongsTo(models.HrmsBusinessUnitMaster, {
            foreignKey: 'business_unit_id',
            as: 'businessUnit'
        });
    }

    if (models.HrmsChannelMaster) {
        HrmsEmployee.belongsTo(models.HrmsChannelMaster, {
            foreignKey: 'channel_id',
            as: 'channel'
        });
    }

    if (models.HrmsCategoryMaster) {
        HrmsEmployee.belongsTo(models.HrmsCategoryMaster, {
            foreignKey: 'category_id',
            as: 'category'
        });
    }

    if (models.HrmsGrade) {
        HrmsEmployee.belongsTo(models.HrmsGrade, {
            foreignKey: 'grade_id',
            as: 'grade'
        });
    }

    if (models.HrmsBranchMaster) {
        HrmsEmployee.belongsTo(models.HrmsBranchMaster, {
            foreignKey: 'branch_id',
            as: 'branch'
        });
    }

    if (models.HrmsLocationMaster) {
        HrmsEmployee.belongsTo(models.HrmsLocationMaster, {
            foreignKey: 'location_id',
            as: 'location'
        });
    }

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

    // Employee belongs to employee type
    HrmsEmployee.belongsTo(models.HrmsEmployeeTypeMaster, {
        foreignKey: 'employee_type_id',
        as: 'employeeType'
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
