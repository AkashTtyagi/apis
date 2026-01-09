/**
 * HRMS Company Model
 * Sequelize model for hrms_companies table
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsCompany = sequelize.define('HrmsCompany', {
  // Primary key
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  // Organization/Company name
  org_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Organization name is required'
      },
      notEmpty: {
        msg: 'Organization name cannot be empty'
      }
    }
  },

  // Parent Enterprise ID (for multi-company hierarchy)
  parent_enterprise_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Foreign key to parent enterprise (for multi-company hierarchy)'
  },

  // Parent company flag
  is_parent_company: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isIn: {
        args: [[0, 1]],
        msg: 'is_parent_company must be 0 or 1'
      }
    },
    comment: '1 for parent company (onboarded), 0 for entity companies'
  },

  // Country ID (foreign key reference)
  country_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Country ID is required'
      }
    },
    comment: 'Foreign key reference to countries table'
  },

  // Currency ID (foreign key reference)
  currency_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Foreign key to hrms_currency_master - company operating currency'
  },

  // Industry ID (reference to industry master)
  org_industry: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: 'Reference to industry master table'
  },

  // Registered Address Details
  registered_address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Registered office address'
  },

  pin_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'PIN/ZIP code'
  },

  state_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Foreign key to hrms_state_master'
  },

  city_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Foreign key to hrms_city_master'
  },

  // Contact Details
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: {
        args: /^[0-9+\-\s()]*$/,
        msg: 'Phone number can only contain numbers, +, -, spaces, and parentheses'
      }
    },
    comment: 'Company phone number'
  },

  fax_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: {
        args: /^[0-9+\-\s()]*$/,
        msg: 'Fax number can only contain numbers, +, -, spaces, and parentheses'
      }
    },
    comment: 'Company fax number'
  },

  contact_person_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Foreign key to hrms_employees - primary contact person'
  },

  // Timezone
  timezone_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Foreign key to hrms_timezone_master - company timezone'
  },

  // Company Profile/Logo
  company_profile_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Path to company profile image/logo'
  },

  // Biometric UTC Settings
  biometric_utc_enabled: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0,
    comment: 'Whether biometric devices send UTC timestamps (1=Yes, 0=No)'
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
  tableName: 'hrms_companies',
  timestamps: true,
  underscored: true, // Use snake_case for automatically added timestamp fields
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true, // Enable soft deletes
  deletedAt: 'deleted_at',

  // Indexes
  indexes: [
    {
      fields: ['parent_enterprise_id']
    },
    {
      fields: ['country_id']
    },
    {
      fields: ['currency_id']
    },
    {
      fields: ['state_id']
    },
    {
      fields: ['city_id']
    },
    {
      fields: ['contact_person_id']
    },
    {
      fields: ['timezone_id']
    },
    {
      fields: ['pin_code']
    },
    {
      fields: ['org_name']
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
HrmsCompany.associate = (models) => {
  // Country association
  HrmsCompany.belongsTo(models.HrmsCountryMaster, {
    foreignKey: 'country_id',
    as: 'country'
  });

  // State association
  HrmsCompany.belongsTo(models.HrmsStateMaster, {
    foreignKey: 'state_id',
    as: 'state'
  });

  // City association
  HrmsCompany.belongsTo(models.HrmsCityMaster, {
    foreignKey: 'city_id',
    as: 'city'
  });

  // Currency association
  HrmsCompany.belongsTo(models.HrmsCurrencyMaster, {
    foreignKey: 'currency_id',
    as: 'currency'
  });

  // Industry association
  HrmsCompany.belongsTo(models.HrmsIndustryMaster, {
    foreignKey: 'org_industry',
    as: 'industry'
  });

  // Timezone association
  HrmsCompany.belongsTo(models.HrmsTimezoneMaster, {
    foreignKey: 'timezone_id',
    as: 'timezone'
  });

  // Creator Employee (created_by -> user_id in employees)
  HrmsCompany.belongsTo(models.HrmsEmployee, {
    foreignKey: 'created_by',
    targetKey: 'user_id',
    as: 'creatorEmployee'
  });

  // Updater Employee (updated_by -> user_id in employees)
  HrmsCompany.belongsTo(models.HrmsEmployee, {
    foreignKey: 'updated_by',
    targetKey: 'user_id',
    as: 'updaterEmployee'
  });

  // Contact Person (contact_person_id -> id in employees)
  HrmsCompany.belongsTo(models.HrmsEmployee, {
    foreignKey: 'contact_person_id',
    as: 'contactPerson',
    constraints: false
  });

  // Parent Company (self-referencing)
  HrmsCompany.belongsTo(models.HrmsCompany, {
    foreignKey: 'parent_enterprise_id',
    as: 'parentCompany',
    constraints: false
  });
};

module.exports = {
  HrmsCompany
};
