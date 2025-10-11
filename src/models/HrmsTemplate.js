/**
 * HRMS Templates Model
 * Sequelize model for hrms_templates table
 * Stores common templates for all companies (Employee Template, Candidate Template, etc.)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsTemplate = sequelize.define('HrmsTemplate', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Template Slug (unique identifier)
    template_slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                msg: 'Template slug is required'
            },
            notEmpty: {
                msg: 'Template slug cannot be empty'
            }
        },
        comment: 'Unique identifier: employee_template, candidate_template, onboarding_template'
    },

    // Template Name
    template_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Template name is required'
            },
            notEmpty: {
                msg: 'Template name cannot be empty'
            }
        }
    },

    // Template Description
    template_description: {
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
    tableName: 'hrms_templates',
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
            fields: ['template_slug']
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
    HrmsTemplate
};
