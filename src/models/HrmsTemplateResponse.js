/**
 * HRMS Template Response Model
 * Sequelize model for hrms_template_responses table
 * Stores user responses for dynamic fields
 * Contains company_id for better indexing when data grows large
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsTemplateResponse = sequelize.define('HrmsTemplateResponse', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Company ID (for better indexing and partitioning)
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Company ID is required'
            }
        },
        comment: 'Foreign key to hrms_companies - helps with indexing for large data'
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

    // Entity Type (employee, candidate, contractor, etc.)
    entity_type: {
        type: DataTypes.ENUM('employee', 'candidate', 'contractor', 'vendor', 'other'),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Entity type is required'
            }
        },
        comment: 'Type of entity'
    },

    // Record ID (employee_id, candidate_id, etc.)
    record_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Record ID is required'
            }
        },
        comment: 'ID of the record (employee_id, candidate_id, etc.)'
    },

    // Field ID
    field_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Field ID is required'
            }
        },
        comment: 'Foreign key to hrms_template_fields'
    },

    // Field Value (stored as text, can be JSON for multiple selections)
    field_value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Stored value (can be JSON for multiple selections)'
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
    tableName: 'hrms_template_responses',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    // Indexes - company_id first for better performance
    indexes: [
        {
            fields: ['company_id', 'entity_type', 'record_id'],
            comment: 'Main composite index for quick lookups'
        },
        {
            fields: ['company_id', 'template_id']
        },
        {
            fields: ['field_id']
        },
        {
            fields: ['entity_type', 'record_id']
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
            fields: ['company_id', 'entity_type', 'record_id', 'field_id'],
            name: 'unique_company_entity_field_response'
        }
    ]
});

module.exports = {
    HrmsTemplateResponse
};
