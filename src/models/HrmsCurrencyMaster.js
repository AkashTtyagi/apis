/**
 * HRMS Currency Master Model
 * Sequelize model for hrms_currency_master table
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsCurrencyMaster = sequelize.define('HrmsCurrencyMaster', {
  // Primary key
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  // ISO 4217 currency code (e.g., USD, EUR, INR)
  currency_code: {
    type: DataTypes.STRING(3),
    allowNull: false,
    unique: true,
    validate: {
      notNull: {
        msg: 'Currency code is required'
      },
      notEmpty: {
        msg: 'Currency code cannot be empty'
      },
      len: {
        args: [3, 3],
        msg: 'Currency code must be exactly 3 characters (ISO 4217)'
      }
    },
    comment: 'ISO 4217 currency code (e.g., USD, EUR, INR)'
  },

  // Full currency name
  currency_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Currency name is required'
      },
      notEmpty: {
        msg: 'Currency name cannot be empty'
      }
    },
    comment: 'Full currency name (e.g., US Dollar, Euro, Indian Rupee)'
  },

  // Currency symbol
  currency_symbol: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Currency symbol (e.g., $, €, ₹)'
  },

  // Primary country using this currency
  country_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Primary country using this currency'
  },

  // ISO 3166-1 alpha-3 country code
  country_code: {
    type: DataTypes.STRING(3),
    allowNull: true,
    comment: 'ISO 3166-1 alpha-3 country code'
  },

  // Number of decimal places
  decimal_places: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 2,
    validate: {
      min: 0,
      max: 4
    },
    comment: 'Number of decimal places (usually 2, some currencies use 0 or 3)'
  },

  // Display format template
  display_format: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '{symbol}{amount}',
    comment: 'Display format template (e.g., {symbol}{amount}, {amount} {code})'
  },

  // Active status
  is_active: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
    validate: {
      isIn: {
        args: [[0, 1]],
        msg: 'is_active must be 0 or 1'
      }
    },
    comment: '1=Active, 0=Inactive'
  },

  // Display order for dropdowns
  display_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 999,
    comment: 'Display order in dropdowns (lower = higher priority)'
  }
}, {
  // Model options
  tableName: 'hrms_currency_master',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',

  // Indexes
  indexes: [
    {
      unique: true,
      fields: ['currency_code']
    },
    {
      fields: ['country_code']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['display_order']
    }
  ]
});

module.exports = {
  HrmsCurrencyMaster
};
