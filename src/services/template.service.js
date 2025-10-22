/**
 * Template Service
 * Handles retrieval and management of templates with sections and fields
 * Supports company-specific customizations with fallback to defaults
 */

const { HrmsTemplate } = require('../models/HrmsTemplate');
const { HrmsTemplateSection } = require('../models/HrmsTemplateSection');
const { HrmsTemplateField } = require('../models/HrmsTemplateField');
const { Op } = require('sequelize');

/**
 * Get template with all sections and fields for a company/entity
 * Logic: entity_id = company_id means company-level, otherwise entity-specific
 *
 * @param {string} template_slug - Template identifier (employee_template, candidate_template)
 * @param {number} company_id - Company ID
 * @param {number} entity_id - Entity ID (defaults to company_id for company-level)
 * @returns {Object} Template with sections and fields
 */
const getTemplateBySlug = async (template_slug, company_id = null, entity_id = null) => {
    // If entity_id not provided, use company_id (company-level template)
    const finalEntityId = entity_id || company_id;

    // Get template
    const template = await HrmsTemplate.findOne({
        where: {
            template_slug: template_slug,
            is_active: true
        },
        raw: true
    });

    if (!template) {
        throw new Error(`Template '${template_slug}' not found`);
    }

    // Get sections for entity (company_id + entity_id match)
    const sections = await HrmsTemplateSection.findAll({
        where: {
            template_id: template.id,
            is_active: true,
            company_id: company_id,
            entity_id: finalEntityId
        },
        order: [['section_order', 'ASC']],
        raw: true
    });

    // Get all section IDs
    const sectionIds = sections.map(s => s.id);

    // Get fields for all sections (entity-specific)
    const fields = await HrmsTemplateField.findAll({
        where: {
            section_id: { [Op.in]: sectionIds },
            is_active: true,
            company_id: company_id,
            entity_id: finalEntityId
        },
        order: [['display_order', 'ASC']],
        raw: true
    });

    // Group fields by section
    const sectionsWithFields = sections.map(section => ({
        ...section,
        fields: fields.filter(field => field.section_id === section.id)
    }));

    return {
        template,
        sections: sectionsWithFields
    };
};

/**
 * Get all active templates
 *
 * @returns {Array} List of templates
 */
const getAllTemplates = async () => {
    const templates = await HrmsTemplate.findAll({
        where: { is_active: true },
        order: [['template_name', 'ASC']],
        raw: true
    });

    return templates;
};

/**
 * Create a new section for a company/entity
 *
 * @param {Object} sectionData - Section data
 * @param {number} company_id - Company ID from logged-in user (if needed to override)
 * @param {number} entity_id - Entity ID (defaults to company_id for company-level)
 * @returns {Object} Created section
 */
const createSection = async (sectionData, company_id = null, entity_id = null) => {
    const { template_id, section_slug, section_name, section_description, section_order, is_collapsible, created_by } = sectionData;
    const finalCompanyId = company_id || sectionData.company_id;
    const finalEntityId = entity_id || sectionData.entity_id || finalCompanyId;

    // Check if section already exists for this company+entity
    const existingSection = await HrmsTemplateSection.findOne({
        where: {
            company_id: finalCompanyId,
            entity_id: finalEntityId,
            template_id: template_id,
            section_slug: section_slug
        },
        raw: true
    });

    if (existingSection) {
        throw new Error(`Section '${section_slug}' already exists for this entity and template`);
    }

    // Create section
    const section = await HrmsTemplateSection.create({
        company_id: finalCompanyId,
        entity_id: finalEntityId,
        template_id,
        section_slug,
        section_name,
        section_description: section_description || null,
        section_order: section_order || 0,
        is_collapsible: is_collapsible || false,
        is_active: true,
        created_by: created_by || null
    });

    return section;
};

/**
 * Update a section
 *
 * @param {number} section_id - Section ID
 * @param {Object} updateData - Update data
 * @returns {Object} Update result
 */
const updateSection = async (section_id, updateData) => {
    const { section_name, section_description, section_order, is_collapsible, is_active, updated_by } = updateData;

    const [updatedRows] = await HrmsTemplateSection.update(
        {
            ...(section_name !== undefined && { section_name }),
            ...(section_description !== undefined && { section_description }),
            ...(section_order !== undefined && { section_order }),
            ...(is_collapsible !== undefined && { is_collapsible }),
            ...(is_active !== undefined && { is_active }),
            ...(updated_by !== undefined && { updated_by })
        },
        {
            where: { id: section_id }
        }
    );

    return { updatedRows };
};

/**
 * Delete a section (soft delete)
 *
 * @param {number} section_id - Section ID
 * @returns {Object} Delete result
 */
const deleteSection = async (section_id) => {
    const deletedRows = await HrmsTemplateSection.destroy({
        where: { id: section_id }
    });

    return { deletedRows };
};

/**
 * Create a new field for a company/entity
 *
 * @param {Object} fieldData - Field data
 * @param {number} company_id - Company ID from logged-in user (if needed to override)
 * @param {number} entity_id - Entity ID (defaults to company_id for company-level)
 * @returns {Object} Created field
 */
const createField = async (fieldData, company_id = null, entity_id = null) => {
    const {
        template_id,
        section_id,
        field_slug,
        field_label,
        field_type,
        field_options,
        master_slug,
        is_required,
        min_length,
        max_length,
        min_value,
        max_value,
        regex_pattern,
        data_type,
        default_value,
        placeholder,
        help_text,
        display_order,
        field_width,
        allowed_file_types,
        max_file_size,
        created_by
    } = fieldData;
    const finalCompanyId = company_id || fieldData.company_id;
    const finalEntityId = entity_id || fieldData.entity_id || finalCompanyId;

    // Check if field already exists for this company+entity
    const existingField = await HrmsTemplateField.findOne({
        where: {
            company_id: finalCompanyId,
            entity_id: finalEntityId,
            template_id: template_id,
            section_id: section_id,
            field_slug: field_slug
        },
        raw: true
    });

    if (existingField) {
        throw new Error(`Field '${field_slug}' already exists for this entity, template and section`);
    }

    // Create field
    // Note: is_direct_field will be false for admin custom fields (set in route)
    // is_direct_field = true only for system default fields (stored in entity table)
    const field = await HrmsTemplateField.create({
        company_id: finalCompanyId,
        entity_id: finalEntityId,
        template_id,
        section_id,
        field_slug,
        field_label,
        field_type,
        field_options: field_options || null,
        master_slug: master_slug || null,
        is_required: is_required || false,
        min_length: min_length || null,
        max_length: max_length || null,
        min_value: min_value || null,
        max_value: max_value || null,
        regex_pattern: regex_pattern || null,
        data_type: data_type || 'string',
        default_value: default_value || null,
        placeholder: placeholder || null,
        help_text: help_text || null,
        display_order: display_order || 0,
        field_width: field_width || 'full',
        is_default_field: false,
        is_direct_field: false,  // Always false for admin custom fields
        allowed_file_types: allowed_file_types || null,
        max_file_size: max_file_size || null,
        is_active: true,
        created_by: created_by || null
    });

    return field;
};

/**
 * Update a field
 * Note: is_direct_field and is_default_field cannot be updated (system-controlled)
 *
 * @param {number} field_id - Field ID
 * @param {Object} updateData - Update data
 * @returns {Object} Update result
 */
const updateField = async (field_id, updateData) => {
    const {
        field_label,
        field_options,
        master_slug,
        is_required,
        min_length,
        max_length,
        min_value,
        max_value,
        regex_pattern,
        default_value,
        placeholder,
        help_text,
        display_order,
        field_width,
        allowed_file_types,
        max_file_size,
        is_active,
        updated_by
    } = updateData;

    const [updatedRows] = await HrmsTemplateField.update(
        {
            ...(field_label !== undefined && { field_label }),
            ...(field_options !== undefined && { field_options }),
            ...(master_slug !== undefined && { master_slug }),
            ...(is_required !== undefined && { is_required }),
            ...(min_length !== undefined && { min_length }),
            ...(max_length !== undefined && { max_length }),
            ...(min_value !== undefined && { min_value }),
            ...(max_value !== undefined && { max_value }),
            ...(regex_pattern !== undefined && { regex_pattern }),
            ...(default_value !== undefined && { default_value }),
            ...(placeholder !== undefined && { placeholder }),
            ...(help_text !== undefined && { help_text }),
            ...(display_order !== undefined && { display_order }),
            ...(field_width !== undefined && { field_width }),
            ...(allowed_file_types !== undefined && { allowed_file_types }),
            ...(max_file_size !== undefined && { max_file_size }),
            ...(is_active !== undefined && { is_active }),
            ...(updated_by !== undefined && { updated_by })
        },
        {
            where: { id: field_id }
        }
    );

    return { updatedRows };
};

/**
 * Delete a field (soft delete)
 * Only non-default fields can be deleted
 *
 * @param {number} field_id - Field ID
 * @returns {Object} Delete result
 */
const deleteField = async (field_id) => {
    // Check if field is a default field
    const field = await HrmsTemplateField.findOne({
        where: { id: field_id },
        attributes: ['is_default_field'],
        raw: true
    });

    if (!field) {
        throw new Error('Field not found');
    }

    if (field.is_default_field) {
        throw new Error('Cannot delete default field');
    }

    const deletedRows = await HrmsTemplateField.destroy({
        where: { id: field_id }
    });

    return { deletedRows };
};

/**
 * Copy company-level templates to a new entity
 * Copies all sections and fields from company_id=entity_id to company_id=entity_id(new)
 *
 * @param {number} company_id - Parent company ID
 * @param {number} new_entity_id - New entity ID
 * @param {number} created_by - User ID who is creating
 * @returns {Object} Copy result
 */
const copyTemplatesToEntity = async (company_id, new_entity_id, created_by) => {
    try {
        // Get all company-level sections (where company_id = entity_id)
        const companySections = await HrmsTemplateSection.findAll({
            where: {
                company_id: company_id,
                entity_id: company_id,
                is_active: true
            },
            raw: true
        });

        if (companySections.length === 0) {
            return { message: 'No company-level templates to copy', sectionsCopied: 0, fieldsCopied: 0 };
        }

        let sectionsCopied = 0;
        let fieldsCopied = 0;

        // Copy each section
        for (const section of companySections) {
            // Create new section for entity
            const newSection = await HrmsTemplateSection.create({
                company_id: company_id,
                entity_id: new_entity_id,
                template_id: section.template_id,
                section_slug: section.section_slug,
                section_name: section.section_name,
                section_description: section.section_description,
                section_order: section.section_order,
                is_collapsible: section.is_collapsible,
                is_active: true,
                created_by: created_by
            });

            sectionsCopied++;

            // Get all fields for this section (company-level)
            const sectionFields = await HrmsTemplateField.findAll({
                where: {
                    section_id: section.id,
                    company_id: company_id,
                    entity_id: company_id,
                    is_active: true
                },
                raw: true
            });

            // Copy each field
            for (const field of sectionFields) {
                await HrmsTemplateField.create({
                    company_id: company_id,
                    entity_id: new_entity_id,
                    template_id: field.template_id,
                    section_id: newSection.id, // Use new section ID
                    field_slug: field.field_slug,
                    field_label: field.field_label,
                    field_type: field.field_type,
                    field_options: field.field_options,
                    master_slug: field.master_slug,
                    is_required: field.is_required,
                    min_length: field.min_length,
                    max_length: field.max_length,
                    min_value: field.min_value,
                    max_value: field.max_value,
                    regex_pattern: field.regex_pattern,
                    data_type: field.data_type,
                    default_value: field.default_value,
                    placeholder: field.placeholder,
                    help_text: field.help_text,
                    display_order: field.display_order,
                    field_width: field.field_width,
                    is_default_field: field.is_default_field,
                    is_direct_field: field.is_direct_field,
                    allowed_file_types: field.allowed_file_types,
                    max_file_size: field.max_file_size,
                    is_active: true,
                    created_by: created_by
                });

                fieldsCopied++;
            }
        }

        return {
            message: 'Templates copied successfully',
            sectionsCopied,
            fieldsCopied
        };
    } catch (error) {
        console.error('Error copying templates to entity:', error.message);
        throw error;
    }
};

module.exports = {
    getTemplateBySlug,
    getAllTemplates,
    createSection,
    updateSection,
    deleteSection,
    createField,
    updateField,
    deleteField,
    copyTemplatesToEntity
};
