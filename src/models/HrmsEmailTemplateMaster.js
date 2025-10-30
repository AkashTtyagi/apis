/**
 * HRMS Email Template Master Model
 * Master list of available email template slugs
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsEmailTemplateMaster = sequelize.define('HrmsEmailTemplateMaster', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'Template slug is required' },
            notEmpty: { msg: 'Template slug cannot be empty' }
        },
        comment: 'Unique identifier (e.g., welcome_email, reset_password)'
    },

    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: { msg: 'Template name is required' }
        },
        comment: 'Display name for UI'
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of when this template is used'
    },

    category: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Category: authentication, onboarding, leave, attendance'
    },

    available_variables: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON array: ["user_name", "company_name", "reset_link"]'
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    workflow_master_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: 'hrms_workflow_master',
            key: 'id'
        },
        comment: 'Link to workflow type (NULL for general templates like birthday, payslip)'
    },

    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'hrms_email_template_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,

    indexes: [
        { unique: true, fields: ['slug'] },
        { fields: ['category'] },
        { fields: ['is_active'] },
        { fields: ['display_order'] },
        { fields: ['workflow_master_id'] }
    ]
});

/**
 * Define associations
 */
HrmsEmailTemplateMaster.associate = (models) => {
    // Email Template Master belongs to Workflow Master
    HrmsEmailTemplateMaster.belongsTo(models.HrmsWorkflowMaster, {
        foreignKey: 'workflow_master_id',
        as: 'workflowMaster'
    });
};

module.exports = {
    HrmsEmailTemplateMaster
};
