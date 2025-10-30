/**
 * Email Template Service
 * Handles email template library operations
 */

const { HrmsEmailTemplate } = require('../models/HrmsEmailTemplate');
const { HrmsEmailTemplateMaster } = require('../models/HrmsEmailTemplateMaster');
const { sequelize } = require('../utils/database');
const { Op } = require('sequelize');

/**
 * Create email template
 *
 * @param {Object} templateData - Template data
 * @returns {Object} Created template
 */
const createEmailTemplate = async (templateData) => {
    const { company_id, slug, name, subject, body, variables, is_active, user_id } = templateData;

    const transaction = await sequelize.transaction();

    try {
        // Check if template with same slug already exists for this company
        const existingTemplate = await HrmsEmailTemplate.findOne({
            where: {
                company_id: company_id || null,
                slug
            }
        });

        if (existingTemplate) {
            throw new Error(`Email template with slug '${slug}' already exists for this ${company_id ? 'company' : 'as default template'}`);
        }

        // Create template
        const template = await HrmsEmailTemplate.create({
            company_id: company_id || null,
            slug,
            name,
            subject,
            body,
            variables: variables || null,
            is_active: is_active !== undefined ? is_active : true,
            created_by: user_id || null
        }, { transaction });

        await transaction.commit();

        return template;
    } catch (error) {
        await transaction.rollback();

        // Handle unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error(`Email template with slug '${slug}' already exists`);
        }

        throw error;
    }
};

/**
 * Update email template
 *
 * @param {number} template_id - Template ID
 * @param {number} company_id - Company ID (for security check)
 * @param {Object} updateData - Update data
 * @returns {Object} Updated template
 */
const updateEmailTemplate = async (template_id, company_id, updateData) => {
    const { name, subject, body, variables, is_active, user_id } = updateData;

    const transaction = await sequelize.transaction();

    try {
        // Check if template exists
        const existingTemplate = await HrmsEmailTemplate.findOne({
            where: {
                id: template_id,
                [Op.or]: [
                    { company_id: company_id },
                    { company_id: null }  // Allow updating default templates
                ]
            }
        });

        if (!existingTemplate) {
            throw new Error('Email template not found or access denied');
        }

        // Update template
        const [updatedRows] = await HrmsEmailTemplate.update(
            {
                ...(name !== undefined && { name }),
                ...(subject !== undefined && { subject }),
                ...(body !== undefined && { body }),
                ...(variables !== undefined && { variables }),
                ...(is_active !== undefined && { is_active }),
                updated_by: user_id || null
            },
            {
                where: { id: template_id },
                transaction
            }
        );

        if (updatedRows === 0) {
            throw new Error('Failed to update email template');
        }

        await transaction.commit();

        // Fetch updated template
        const updatedTemplate = await HrmsEmailTemplate.findByPk(template_id);

        return updatedTemplate;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get email templates
 *
 * @param {number} company_id - Company ID
 * @param {Object} filters - Filter options
 * @returns {Array} List of templates
 */
const getEmailTemplates = async (company_id, filters = {}) => {
    const whereClause = {
        [Op.or]: [
            { company_id: company_id },
            { company_id: null }  // Include default templates
        ]
    };

    // Filter by active status
    if (filters.is_active !== null && filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    // Search in name, slug, or subject
    if (filters.search) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${filters.search}%` } },
            { slug: { [Op.like]: `%${filters.search}%` } },
            { subject: { [Op.like]: `%${filters.search}%` } }
        ];
    }

    // Filter by specific slug
    if (filters.slug) {
        whereClause.slug = filters.slug;
    }

    const templates = await HrmsEmailTemplate.findAll({
        where: whereClause,
        order: [
            ['company_id', 'DESC'],  // Company-specific first, then defaults
            ['slug', 'ASC'],
            ['created_at', 'DESC']
        ],
        attributes: { exclude: ['deleted_at'] }
    });

    return templates;
};

/**
 * Get email template by ID
 *
 * @param {number} template_id - Template ID
 * @param {number} company_id - Company ID (for security check)
 * @returns {Object} Template details
 */
const getEmailTemplateById = async (template_id, company_id) => {
    const template = await HrmsEmailTemplate.findOne({
        where: {
            id: template_id,
            [Op.or]: [
                { company_id: company_id },
                { company_id: null }  // Allow viewing default templates
            ]
        },
        attributes: { exclude: ['deleted_at'] }
    });

    if (!template) {
        throw new Error('Email template not found or access denied');
    }

    return template;
};

/**
 * Get email template by slug
 *
 * @param {string} slug - Template slug
 * @param {number} company_id - Company ID
 * @returns {Object} Template details
 */
const getEmailTemplateBySlug = async (slug, company_id) => {
    // First try to find company-specific template
    let template = await HrmsEmailTemplate.findOne({
        where: {
            slug,
            company_id: company_id,
            is_active: true
        },
        attributes: { exclude: ['deleted_at'] }
    });

    // If not found, try to find default template
    if (!template) {
        template = await HrmsEmailTemplate.findOne({
            where: {
                slug,
                company_id: null,
                is_active: true
            },
            attributes: { exclude: ['deleted_at'] }
        });
    }

    if (!template) {
        throw new Error(`Email template with slug '${slug}' not found`);
    }

    return template;
};

/**
 * Delete email template (soft delete)
 *
 * @param {number} template_id - Template ID
 * @param {number} company_id - Company ID (for security check)
 * @returns {boolean} Success
 */
const deleteEmailTemplate = async (template_id, company_id) => {
    const transaction = await sequelize.transaction();

    try {
        // Check if template exists and belongs to company (cannot delete default templates)
        const template = await HrmsEmailTemplate.findOne({
            where: {
                id: template_id,
                company_id: company_id  // Only company-specific templates can be deleted
            }
        });

        if (!template) {
            throw new Error('Email template not found or cannot be deleted (default templates are protected)');
        }

        // Soft delete
        await HrmsEmailTemplate.destroy({
            where: { id: template_id },
            transaction
        });

        await transaction.commit();

        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Clone template for company customization
 *
 * @param {number} template_id - Source template ID
 * @param {number} company_id - Target company ID
 * @param {number} user_id - User ID
 * @returns {Object} Cloned template
 */
const cloneTemplateForCompany = async (template_id, company_id, user_id) => {
    const transaction = await sequelize.transaction();

    try {
        // Get source template
        const sourceTemplate = await HrmsEmailTemplate.findByPk(template_id);

        if (!sourceTemplate) {
            throw new Error('Source template not found');
        }

        // Check if company already has this template
        const existingTemplate = await HrmsEmailTemplate.findOne({
            where: {
                company_id: company_id,
                slug: sourceTemplate.slug
            }
        });

        if (existingTemplate) {
            throw new Error(`Company already has a customized template for '${sourceTemplate.slug}'`);
        }

        // Clone template for company
        const clonedTemplate = await HrmsEmailTemplate.create({
            company_id: company_id,
            slug: sourceTemplate.slug,
            name: `${sourceTemplate.name} (Customized)`,
            subject: sourceTemplate.subject,
            body: sourceTemplate.body,
            variables: sourceTemplate.variables,
            is_active: true,
            created_by: user_id
        }, { transaction });

        await transaction.commit();

        return clonedTemplate;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get email template masters (for dropdown)
 *
 * @param {Object} filters - Filter options
 * @returns {Array} List of template masters
 */
const getEmailTemplateMasters = async (filters = {}) => {
    const whereClause = {};

    if (filters.is_active !== null && filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    if (filters.category) {
        whereClause.category = filters.category;
    }

    if (filters.search) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${filters.search}%` } },
            { slug: { [Op.like]: `%${filters.search}%` } }
        ];
    }

    const masters = await HrmsEmailTemplateMaster.findAll({
        where: whereClause,
        order: [['display_order', 'ASC'], ['name', 'ASC']],
        attributes: ['id', 'slug', 'name', 'description', 'category', 'available_variables', 'is_active']
    });

    return masters;
};

module.exports = {
    createEmailTemplate,
    updateEmailTemplate,
    getEmailTemplates,
    getEmailTemplateById,
    getEmailTemplateBySlug,
    deleteEmailTemplate,
    cloneTemplateForCompany,
    getEmailTemplateMasters
};
