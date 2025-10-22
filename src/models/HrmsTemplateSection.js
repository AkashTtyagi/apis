/**
 * HRMS Template Section Model
 * Sequelize model for hrms_template_sections table
 * Stores company-specific sections within templates
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsTemplateSection = sequelize.define('HrmsTemplateSection', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Company ID (nullable for default sections)
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_companies, NULL for default sections'
    },

    // Entity ID (same as company_id for company-level, different for entity-specific)
    entity_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Entity ID (same as company_id for company-level templates, different for entity-specific, NULL for default templates)'
    },

    // Template ID
    template_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Template ID is required'
            }
        },
        comment: 'Foreign key to hrms_templates'
    },

    // Section Slug
    section_slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Section slug is required'
            }
        },
        comment: 'Unique identifier: personal_details, contact_info, emergency_contact'
    },

    // Section Name
    section_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Section name is required'
            }
        }
    },

    // Section Description
    section_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Section Order
    section_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Display order of sections'
    },

    // Is Collapsible
    is_collapsible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Can section be collapsed in UI'
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
    tableName: 'hrms_template_sections',
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
            fields: ['template_id']
        },
        {
            fields: ['section_slug']
        },
        {
            fields: ['section_order']
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
        },
        {
            unique: true,
            fields: ['company_id', 'template_id', 'section_slug'],
            name: 'unique_company_template_section'
        }
    ]
});

module.exports = {
    HrmsTemplateSection
};
