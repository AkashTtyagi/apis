/**
 * HRMS Policy Category Model
 * Sequelize model for hrms_policy_categories table
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsPolicyCategory = sequelize.define('HrmsPolicyCategory', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_companies'
    },
    category_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'HR Policies, IT Policies, Code of Conduct, etc.'
    },
    category_slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Unique identifier: hr_policies, it_policies'
    },
    category_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Display order of categories'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'User ID who created this record'
    },
    updated_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'User ID who last updated this record'
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp'
    }
}, {
    tableName: 'hrms_policy_categories',
    timestamps: true,
    underscored: true,
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'category_slug'],
            name: 'unique_company_category_slug'
        },
        {
            fields: ['company_id']
        },
        {
            fields: ['category_slug']
        },
        {
            fields: ['is_active']
        }
    ]
});

module.exports = { HrmsPolicyCategory };
