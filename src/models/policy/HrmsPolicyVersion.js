/**
 * HRMS Policy Version Model
 * Sequelize model for hrms_policy_versions table
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsPolicyVersion = sequelize.define('HrmsPolicyVersion', {
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
    version_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Version number: 1, 2, 3, etc.'
    },
    version_title: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Title for this version'
    },
    version_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'What changed in this version'
    },
    policy_content: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        comment: 'Full policy content (can be HTML/Markdown)'
    },
    is_current_version: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Is this the active version'
    },
    published_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When this version was published'
    },
    published_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'User who published this version'
    },
    change_summary: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Summary of changes from previous version'
    },
    previous_version_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to previous version (for rollback)'
    },
    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'User ID who created this version'
    }
}, {
    tableName: 'hrms_policy_versions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['policy_id', 'version_number'],
            name: 'unique_policy_version'
        },
        {
            fields: ['policy_id']
        },
        {
            fields: ['version_number']
        },
        {
            fields: ['is_current_version']
        },
        {
            fields: ['published_at']
        }
    ]
});

HrmsPolicyVersion.associate = (models) => {
    // Belongs to Policy
    HrmsPolicyVersion.belongsTo(models.HrmsPolicy, {
        foreignKey: 'policy_id',
        as: 'policy'
    });

    // Self-reference for previous version
    HrmsPolicyVersion.belongsTo(models.HrmsPolicyVersion, {
        foreignKey: 'previous_version_id',
        as: 'previousVersion'
    });

    // Has many Attachments
    HrmsPolicyVersion.hasMany(models.HrmsPolicyAttachment, {
        foreignKey: 'version_id',
        as: 'attachments'
    });
};

module.exports = { HrmsPolicyVersion };
