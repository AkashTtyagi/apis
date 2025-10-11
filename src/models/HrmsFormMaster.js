/**
 * HRMS Form Master Model
 * Sequelize model for hrms_form_masters table
 * Stores common form templates (Employee Form, Candidate Form, etc.)
 * Company-specific fields are stored in hrms_form_fields
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsFormMaster = sequelize.define('HrmsFormMaster', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Form Slug (unique identifier)
    form_slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                msg: 'Form slug is required'
            },
            notEmpty: {
                msg: 'Form slug cannot be empty'
            }
        },
        comment: 'Unique identifier: employee_form, candidate_form, onboarding_form'
    },

    // Form Name
    form_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Form name is required'
            },
            notEmpty: {
                msg: 'Form name cannot be empty'
            }
        }
    },

    // Form Description
    form_description: {
        type: DataTypes.TEXT,
        allowNull: true
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
    tableName: 'hrms_form_masters',
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
            fields: ['form_slug']
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
    HrmsFormMaster
};
