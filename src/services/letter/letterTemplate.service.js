/**
 * Letter Template Service
 * Handles all letter template CRUD operations
 */

const { sequelize } = require('../../utils/database');
const HrmsLetterTemplate = require('../../models/letter/HrmsLetterTemplate');
const HrmsLetterTemplateCustomField = require('../../models/letter/HrmsLetterTemplateCustomField');
const HrmsLetterCategoryMaster = require('../../models/letter/HrmsLetterCategoryMaster');
const { Op } = require('sequelize');

/**
 * Create a new letter template
 * @param {Object} templateData - Template data with custom fields
 * @param {number} userId - User ID creating the template
 * @returns {Object} Created template with custom fields
 */
const createLetterTemplate = async (templateData, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const { custom_fields, ...templateFields } = templateData;

        // Check if template with same code already exists
        const existingTemplate = await HrmsLetterTemplate.findOne({
            where: {
                company_id: templateFields.company_id,
                letter_code: templateFields.letter_code,
                is_active: true
            }
        });

        if (existingTemplate) {
            throw new Error(`Letter template with code "${templateFields.letter_code}" already exists in this company`);
        }

        // Create template
        templateFields.created_by = userId;
        const template = await HrmsLetterTemplate.create(templateFields, { transaction });

        // Create custom fields if provided
        if (custom_fields && Array.isArray(custom_fields) && custom_fields.length > 0) {
            const customFieldsToCreate = custom_fields.map(field => ({
                letter_template_id: template.id,
                field_name: field.field_name,
                field_slug: field.field_slug,
                field_type: field.field_type || 'text',
                field_options: field.field_options || null,
                is_required: field.is_required || false,
                default_value: field.default_value || null,
                placeholder: field.placeholder || null,
                help_text: field.help_text || null,
                validation_rules: field.validation_rules || null,
                display_order: field.display_order || 0,
                created_by: userId
            }));

            await HrmsLetterTemplateCustomField.bulkCreate(customFieldsToCreate, { transaction });
        }

        await transaction.commit();

        // Fetch complete template with associations
        return await getLetterTemplateById(template.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Update letter template
 * @param {number} templateId - Template ID
 * @param {Object} updateData - Data to update
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID updating the template
 * @returns {Object} Updated template
 */
const updateLetterTemplate = async (templateId, updateData, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const { custom_fields, ...templateFields } = updateData;

        // Find template
        const template = await HrmsLetterTemplate.findOne({
            where: {
                id: templateId,
                company_id: companyId,
                is_active: true
            }
        });

        if (!template) {
            throw new Error('Letter template not found');
        }

        // Check if it's a system template
        if (template.is_system_template) {
            throw new Error('System templates cannot be modified');
        }

        // Update template
        templateFields.updated_by = userId;
        await template.update(templateFields, { transaction });

        // Update custom fields if provided
        if (custom_fields && Array.isArray(custom_fields)) {
            // Delete existing custom fields
            await HrmsLetterTemplateCustomField.destroy({
                where: { letter_template_id: templateId },
                transaction
            });

            // Create new custom fields
            if (custom_fields.length > 0) {
                const customFieldsToCreate = custom_fields.map(field => ({
                    letter_template_id: template.id,
                    field_name: field.field_name,
                    field_slug: field.field_slug,
                    field_type: field.field_type || 'text',
                    field_options: field.field_options || null,
                    is_required: field.is_required || false,
                    default_value: field.default_value || null,
                    placeholder: field.placeholder || null,
                    help_text: field.help_text || null,
                    validation_rules: field.validation_rules || null,
                    display_order: field.display_order || 0,
                    created_by: userId
                }));

                await HrmsLetterTemplateCustomField.bulkCreate(customFieldsToCreate, { transaction });
            }
        }

        await transaction.commit();

        // Fetch complete template with associations
        return await getLetterTemplateById(templateId);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get all letter templates for a company
 * @param {number} companyId - Company ID
 * @param {Object} filters - Filter options
 * @returns {Array} List of templates
 */
const getAllLetterTemplates = async (companyId, filters = {}) => {
    const where = {
        company_id: companyId,
        is_active: true
    };

    // Apply filters
    if (filters.category_id) {
        where.category_id = filters.category_id;
    }

    if (filters.is_draft !== undefined) {
        where.is_draft = filters.is_draft;
    }

    if (filters.search) {
        where[Op.or] = [
            { letter_name: { [Op.like]: `%${filters.search}%` } },
            { letter_code: { [Op.like]: `%${filters.search}%` } }
        ];
    }

    const templates = await HrmsLetterTemplate.findAll({
        where,
        include: [
            {
                model: HrmsLetterCategoryMaster,
                as: 'category',
                attributes: ['id', 'category_name', 'category_code']
            },
            {
                model: HrmsLetterTemplateCustomField,
                as: 'custom_fields',
                where: { is_active: true },
                required: false,
                order: [['display_order', 'ASC']]
            }
        ],
        order: [['created_at', 'DESC']]
    });

    return templates;
};

/**
 * Get letter template by ID
 * @param {number} templateId - Template ID
 * @returns {Object} Template with associations
 */
const getLetterTemplateById = async (templateId) => {
    const template = await HrmsLetterTemplate.findOne({
        where: {
            id: templateId,
            is_active: true
        },
        include: [
            {
                model: HrmsLetterCategoryMaster,
                as: 'category',
                attributes: ['id', 'category_name', 'category_code', 'category_description']
            },
            {
                model: HrmsLetterTemplateCustomField,
                as: 'custom_fields',
                where: { is_active: true },
                required: false,
                order: [['display_order', 'ASC']]
            }
        ]
    });

    if (!template) {
        throw new Error('Letter template not found');
    }

    return template;
};

/**
 * Delete letter template
 * @param {number} templateId - Template ID
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID deleting the template
 * @returns {Object} Success message
 */
const deleteLetterTemplate = async (templateId, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const template = await HrmsLetterTemplate.findOne({
            where: {
                id: templateId,
                company_id: companyId,
                is_active: true
            }
        });

        if (!template) {
            throw new Error('Letter template not found');
        }

        // Check if it's a system template
        if (template.is_system_template) {
            throw new Error('System templates cannot be deleted');
        }

        // Soft delete template
        await template.update({
            is_active: false,
            updated_by: userId
        }, { transaction });

        // Soft delete custom fields
        await HrmsLetterTemplateCustomField.update(
            { is_active: false },
            {
                where: { letter_template_id: templateId },
                transaction
            }
        );

        await transaction.commit();

        return { message: 'Letter template deleted successfully' };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get all letter categories
 * @returns {Array} List of categories
 */
const getAllCategories = async () => {
    const categories = await HrmsLetterCategoryMaster.findAll({
        where: { is_active: true },
        attributes: [
            'id',
            'category_name',
            'category_code',
            'category_description',
            'display_order',
            [sequelize.fn('COUNT', sequelize.col('templates.id')), 'templates_count']
        ],
        include: [
            {
                model: HrmsLetterTemplate,
                as: 'templates',
                attributes: [],
                where: { is_active: true },
                required: false
            }
        ],
        group: ['HrmsLetterCategoryMaster.id'],
        order: [['display_order', 'ASC']]
    });

    return categories;
};

module.exports = {
    createLetterTemplate,
    updateLetterTemplate,
    getAllLetterTemplates,
    getLetterTemplateById,
    deleteLetterTemplate,
    getAllCategories
};
