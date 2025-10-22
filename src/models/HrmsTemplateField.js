/**
 * HRMS Template Field Model
 * Sequelize model for hrms_template_fields table
 * Stores company-specific field configurations within template sections
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsTemplateField = sequelize.define('HrmsTemplateField', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Company ID (nullable for default fields)
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_companies, NULL for default fields'
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

    // Section ID
    section_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Section ID is required'
            }
        },
        comment: 'Foreign key to hrms_template_sections'
    },

    // Field Slug
    field_slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Field slug is required'
            }
        },
        comment: 'Unique identifier: blood_group, emergency_contact, father_name'
    },

    // Field Label
    field_label: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Field label is required'
            }
        }
    },

    // Field Type
    field_type: {
        type: DataTypes.ENUM('text', 'email', 'number', 'phone', 'date', 'datetime', 'select', 'radio', 'checkbox', 'textarea', 'file', 'url', 'master_select'),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Field type is required'
            }
        }
    },

    // Static Field Options (for select/radio/checkbox)
    field_options: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of options for select/radio/checkbox'
    },

    // Master Slug (for dynamic master-based dropdowns)
    master_slug: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Reference to master table: location, department, designation'
    },

    // Validation: Required
    is_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    // Validation: Min Length (for text/textarea)
    min_length: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Minimum character length'
    },

    // Validation: Max Length (for text/textarea)
    max_length: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Maximum character length'
    },

    // Validation: Min Value (for number)
    min_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Minimum value for number fields'
    },

    // Validation: Max Value (for number)
    max_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Maximum value for number fields'
    },

    // Validation: Regex Pattern
    regex_pattern: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Custom regex validation pattern'
    },

    // Data Type for storage
    data_type: {
        type: DataTypes.ENUM('string', 'integer', 'decimal', 'boolean', 'date', 'json'),
        allowNull: false,
        defaultValue: 'string',
        comment: 'Data type for storage'
    },

    // Default Value
    default_value: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Placeholder
    placeholder: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    // Help Text
    help_text: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Display Order within section
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Field ordering within section'
    },

    // Field Width
    field_width: {
        type: DataTypes.ENUM('full', 'half', 'third', 'quarter'),
        allowNull: false,
        defaultValue: 'full',
        comment: 'Field width in UI'
    },

    // Is Default Field (system fields that cannot be deleted)
    is_default_field: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'System default field (cannot be deleted)'
    },

    // Is Direct Field (stored in entity table vs template response)
    is_direct_field: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'true = stored in entity table (hrms_employees), false = stored in hrms_template_responses'
    },

    // File Upload: Allowed Types
    allowed_file_types: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Comma-separated: jpg,png,pdf'
    },

    // File Upload: Max Size (in KB)
    max_file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Max file size in KB'
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
    tableName: 'hrms_template_fields',
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
            fields: ['section_id']
        },
        {
            fields: ['field_slug']
        },
        {
            fields: ['master_slug']
        },
        {
            fields: ['display_order']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['is_direct_field']
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
            fields: ['company_id', 'template_id', 'section_id', 'field_slug'],
            name: 'unique_company_template_section_field'
        }
    ]
});

module.exports = {
    HrmsTemplateField
};
