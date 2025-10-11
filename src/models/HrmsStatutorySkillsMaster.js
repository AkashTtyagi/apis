/**
 * HRMS Statutory Skills Master Model
 * Sequelize model for hrms_statutory_skills_master table
 * Stores predefined statutory/mandatory skills with industry name
 * Skills can be generic (NULL industry) or industry-specific
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsStatutorySkillsMaster = sequelize.define('HrmsStatutorySkillsMaster', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Industry ID (nullable for generic skills)
    industry_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_industry_master, NULL for generic skills'
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
        comment: 'Unique code (e.g., JAVA, PYTHON, SQL, CPA, PMP, ACCA)'
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
        comment: 'Category (e.g., Technical, Soft Skills, Certification, Statutory, Domain Knowledge)'
    },

    // Description
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Detailed description of the skill'
    },

    // Is Statutory (mandatory/regulatory)
    is_statutory: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this skill is statutory/mandatory by law or regulation'
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

    // Timestamps
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    // Model options
    tableName: 'hrms_statutory_skills_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,

    // Indexes
    indexes: [
        {
            unique: true,
            fields: ['industry_id', 'skill_code'],
            name: 'unique_industry_skill_code'
        },
        {
            fields: ['industry_id']
        },
        {
            fields: ['skill_code']
        },
        {
            fields: ['skill_category']
        },
        {
            fields: ['is_statutory']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['display_order']
        }
    ]
});

/**
 * Define associations
 */
HrmsStatutorySkillsMaster.associate = (models) => {
    // Statutory Skills Master belongs to Industry
    HrmsStatutorySkillsMaster.belongsTo(models.HrmsIndustryMaster, {
        foreignKey: 'industry_id',
        as: 'industry'
    });
};

module.exports = {
    HrmsStatutorySkillsMaster
};
