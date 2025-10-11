/**
 * HRMS Company Skills Model
 * Sequelize model for hrms_company_skills table
 * Stores company-specific skills created by admin
 * Admin can create custom skills or use from statutory skills master
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsCompanySkills = sequelize.define('HrmsCompanySkills', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Company ID
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Company ID is required'
            }
        },
        comment: 'Foreign key to hrms_companies'
    },

    // Statutory Skill Master ID (optional - NULL if custom skill)
    statutory_skill_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_statutory_skills_master (NULL for custom skills)'
    },

    // Skill Code
    skill_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Skill code is required'
            },
            notEmpty: {
                msg: 'Skill code cannot be empty'
            }
        },
        comment: 'Unique code within company'
    },

    // Skill Name
    skill_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Skill name is required'
            },
            notEmpty: {
                msg: 'Skill name cannot be empty'
            }
        },
        comment: 'Display name of the skill'
    },

    // Skill Category
    skill_category: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Category (e.g., Technical, Soft Skills, Certification, Domain Knowledge)'
    },

    // Description
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Detailed description of the skill'
    },

    // Is Active
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    // Display Order
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    tableName: 'hrms_company_skills',
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
            fields: ['company_id', 'skill_code'],
            name: 'unique_company_skill_code'
        },
        {
            fields: ['company_id']
        },
        {
            fields: ['statutory_skill_id']
        },
        {
            fields: ['skill_category']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['display_order']
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

/**
 * Define associations
 */
HrmsCompanySkills.associate = (models) => {
    // Company Skill belongs to Company
    HrmsCompanySkills.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    // Company Skill belongs to Statutory Skills Master (optional)
    HrmsCompanySkills.belongsTo(models.HrmsStatutorySkillsMaster, {
        foreignKey: 'statutory_skill_id',
        as: 'statutorySkill'
    });

    // Company Skill has many Designations
    HrmsCompanySkills.hasMany(models.HrmsCompanyDesignation, {
        foreignKey: 'skill_id',
        as: 'designations'
    });
};

module.exports = {
    HrmsCompanySkills
};
