/**
 * HRMS Policy Attachment Model
 * Sequelize model for hrms_policy_attachments table
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsPolicyAttachment = sequelize.define('HrmsPolicyAttachment', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    policy_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_policies'
    },
    version_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_policy_versions (NULL = applies to all versions)'
    },
    attachment_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Original filename'
    },
    attachment_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'File path on server'
    },
    attachment_type: {
        type: DataTypes.ENUM('pdf', 'doc', 'docx', 'image', 'other'),
        allowNull: false
    },
    file_size: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'File size in KB'
    },
    mime_type: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Display order of attachments'
    },
    uploaded_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'User who uploaded this file'
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp'
    }
}, {
    tableName: 'hrms_policy_attachments',
    timestamps: true,
    underscored: true,
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
        {
            fields: ['policy_id']
        },
        {
            fields: ['version_id']
        },
        {
            fields: ['attachment_type']
        }
    ]
});

HrmsPolicyAttachment.associate = (models) => {
    // Belongs to Policy
    HrmsPolicyAttachment.belongsTo(models.HrmsPolicy, {
        foreignKey: 'policy_id',
        as: 'policy'
    });

    // Belongs to Version (optional)
    HrmsPolicyAttachment.belongsTo(models.HrmsPolicyVersion, {
        foreignKey: 'version_id',
        as: 'version'
    });
};

module.exports = { HrmsPolicyAttachment };
