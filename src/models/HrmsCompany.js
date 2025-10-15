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

  // Industry ID (reference to industry master)
  org_industry: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: 'Reference to industry master table'
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

module.exports = {
  HrmsCompany
};
