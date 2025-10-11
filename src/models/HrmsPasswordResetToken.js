/**
 * HRMS Password Reset Token Model
 * Sequelize model for hrms_password_reset_tokens table
 * Stores temporary tokens for password reset/set operations
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsPasswordResetToken = sequelize.define('HrmsPasswordResetToken', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // User ID
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'User ID is required'
            }
        },
        comment: 'Foreign key reference to hrms_user_details table'
    },

    // Token (hashed)
    token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                msg: 'Token is required'
            }
        }
    },

    // Token Type
    token_type: {
        type: DataTypes.ENUM('set_password', 'reset_password'),
        allowNull: false,
        defaultValue: 'reset_password',
        comment: 'Type of token: set_password for first time, reset_password for forgotten password'
    },

    // Expires At
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Expiration time is required'
            }
        }
    },

    // Used At (when token was consumed)
    used_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp when token was used'
    },

    // Is Used
    is_used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    // Model options
    tableName: 'hrms_password_reset_tokens',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    // Indexes
    indexes: [
        {
            unique: true,
            fields: ['token']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['token_type']
        },
        {
            fields: ['expires_at']
        },
        {
            fields: ['is_used']
        }
    ]
});

module.exports = {
    HrmsPasswordResetToken
};
