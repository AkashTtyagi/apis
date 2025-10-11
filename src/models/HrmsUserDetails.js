/**
 * HRMS User Details Model
 * Sequelize model for hrms_user_details table
 * Stores authentication and user account information only
 * Personal details (name, etc.) are stored in hrms_employees table
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsUserDetails = sequelize.define('HrmsUserDetails', {
  // Primary key
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  // Company ID (foreign key reference to hrms_companies)
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Company ID is required'
      }
    },
    comment: 'Foreign key reference to hrms_companies table'
  },

  // Email (unique)
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      args: true,
      msg: 'Email address already exists'
    },
    validate: {
      notNull: {
        msg: 'Email is required'
      },
      notEmpty: {
        msg: 'Email cannot be empty'
      },
      isEmail: {
        msg: 'Must be a valid email address'
      }
    }
  },

  // Phone (optional)
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: {
        args: /^[0-9+\-\s()]*$/i,
        msg: 'Phone number contains invalid characters'
      }
    }
  },

  // Password (hashed)
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Hashed password'
  },

  // Is Password Set
  is_password_set: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Flag to indicate if user has set their password'
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
  tableName: 'hrms_user_details',
  timestamps: true,
  underscored: true, // Use snake_case for automatically added timestamp fields
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true, // Enable soft deletes
  deletedAt: 'deleted_at',

  // Indexes
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['company_id']
    },
    {
      fields: ['is_password_set']
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
HrmsUserDetails.associate = (models) => {
  // User has one Employee
  HrmsUserDetails.hasOne(models.HrmsEmployee, {
    foreignKey: 'user_id',
    as: 'employee'
  });
};

module.exports = {
  HrmsUserDetails
};
