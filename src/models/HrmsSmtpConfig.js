/**
 * HRMS SMTP Configuration Model
 * Sequelize model for hrms_smtp_config table
 * Stores SMTP settings per company (null company_id for default)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsSmtpConfig = sequelize.define('HrmsSmtpConfig', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Company ID (nullable - null means default config)
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key reference to hrms_companies table, NULL for default config'
    },

    // SMTP Host
    smtp_host: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'SMTP host is required'
            },
            notEmpty: {
                msg: 'SMTP host cannot be empty'
            }
        }
    },

    // SMTP Port
    smtp_port: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 587,
        validate: {
            notNull: {
                msg: 'SMTP port is required'
            },
            min: 1,
            max: 65535
        }
    },

    // SMTP Username
    smtp_username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'SMTP username is required'
            }
        }
    },

    // SMTP Password (encrypted)
    smtp_password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'SMTP password is required'
            }
        }
    },

    // SMTP Encryption (TLS/SSL)
    smtp_encryption: {
        type: DataTypes.ENUM('tls', 'ssl', 'none'),
        allowNull: false,
        defaultValue: 'tls'
    },

    // From Email
    from_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'From email is required'
            },
            isEmail: {
                msg: 'Must be a valid email address'
            }
        }
    },

    // From Name
    from_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'HRMS'
    },

    // Is Active
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    tableName: 'hrms_smtp_config',
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
            fields: ['is_active']
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
    HrmsSmtpConfig
};
