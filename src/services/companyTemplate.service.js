/**
 * Company Template Service
 * Handles copying all default templates to a new company
 * This ensures each company has their own customizable copy of all forms
 */

const { HrmsTemplate } = require('../models/HrmsTemplate');
const { HrmsTemplateSection } = require('../models/HrmsTemplateSection');
const { HrmsTemplateField } = require('../models/HrmsTemplateField');

/**
 * Copy a single template (with all sections and fields) to a company
 * @param {Object} template - Template object
 * @param {number} company_id - Company ID
 * @param {number} user_id - User ID who created the company
 * @param {number} company_country_id - Company's country ID
 * @param {Object} transaction - Sequelize transaction object
 * @returns {Promise<Object>} - Summary of copied template
 */
const copySingleTemplateToCompany = async (template, company_id, user_id, company_country_id, transaction = null) => {
    try {
        console.log(`  → Copying template: ${template.template_name} (${template.template_slug})`);

        // Step 1: Get all default sections for this template (company_id IS NULL)
        const defaultSections = await HrmsTemplateSection.findAll({
            where: {
                template_id: template.id,
                company_id: null,
                is_active: true
            },
            order: [['section_order', 'ASC']],
            transaction
        });

        if (!defaultSections || defaultSections.length === 0) {
            console.log(`    ⚠ No default sections found for ${template.template_slug}, skipping...`);
            return {
                template_id: template.id,
                template_slug: template.template_slug,
                template_name: template.template_name,
                sections_copied: 0,
                fields_copied: 0,
                skipped: true
            };
        }

        // Step 2: Create company-specific sections
        const sectionMapping = {}; // Maps old section_id to new section_id

        for (const section of defaultSections) {
            const newSection = await HrmsTemplateSection.create({
                company_id: company_id,
                entity_id: company_id,
                template_id: template.id,
                section_slug: section.section_slug,
                section_name: section.section_name,
                section_description: section.section_description,
                section_order: section.section_order,
                is_collapsible: section.is_collapsible,
                is_active: true,
                created_by: user_id
            }, { transaction });

            sectionMapping[section.id] = newSection.id;
        }

        console.log(`    ✓ Copied ${defaultSections.length} sections`);

        // Step 3: Copy all fields for all sections
        // Copy fields with country_id = 0 (global) OR country_id = company's country_id
        let totalFieldsCopied = 0;

        for (const oldSectionId of Object.keys(sectionMapping)) {
            const newSectionId = sectionMapping[oldSectionId];

            // Get all fields for this section with country_id = 0 OR company's country_id
            const { Op } = require('sequelize');
            const sectionFields = await HrmsTemplateField.findAll({
                where: {
                    template_id: template.id,
                    section_id: oldSectionId,
                    company_id: null,
                    country_id: {
                        [Op.or]: [0, company_country_id]
                    },
                    is_active: true
                },
                order: [['display_order', 'ASC']],
                transaction
            });

            // Copy each field
            for (const field of sectionFields) {
                await HrmsTemplateField.create({
                    company_id: company_id,
                    entity_id: company_id,
                    country_id: field.country_id,
                    template_id: template.id,
                    section_id: newSectionId,
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
                    created_by: user_id
                }, { transaction });

                totalFieldsCopied++;
            }
        }

        console.log(`    ✓ Copied ${totalFieldsCopied} fields`);

        return {
            template_id: template.id,
            template_slug: template.template_slug,
            template_name: template.template_name,
            sections_copied: defaultSections.length,
            fields_copied: totalFieldsCopied,
            skipped: false
        };
    } catch (error) {
        console.error(`    ✗ Error copying template ${template.template_slug}:`, error.message);
        throw error;
    }
};

/**
 * Copy ALL default templates to a new company
 * This is called during company onboarding
 * Copies all templates with company_id = NULL to the new company
 * Copies fields with country_id = 0 (global) and country_id = company's country_id
 *
 * @param {number} company_id - Company ID
 * @param {number} user_id - User ID who created the company
 * @param {number} company_country_id - Company's country ID
 * @param {Object} transaction - Sequelize transaction object
 * @returns {Promise<Object>} - Summary of all copied templates
 */
const copyAllTemplatesToCompany = async (company_id, user_id, company_country_id, transaction = null) => {
    try {
        console.log(`\n╔════════════════════════════════════════════════════╗`);
        console.log(`║  Copying All Default Templates to Company ${company_id.toString().padEnd(7)}║`);
        console.log(`╚════════════════════════════════════════════════════╝\n`);

        // Step 1: Get all active templates
        const allTemplates = await HrmsTemplate.findAll({
            where: {
                is_active: true
            },
            order: [['template_slug', 'ASC']],
            transaction
        });

        if (!allTemplates || allTemplates.length === 0) {
            console.log('⚠ No default templates found in system');
            return {
                total_templates: 0,
                templates_copied: 0,
                templates_skipped: 0,
                total_sections: 0,
                total_fields: 0,
                details: []
            };
        }

        console.log(`✓ Found ${allTemplates.length} templates to copy\n`);

        // Step 2: Copy each template
        const results = [];
        let totalSections = 0;
        let totalFields = 0;
        let templatesCopied = 0;
        let templatesSkipped = 0;

        for (const template of allTemplates) {
            const result = await copySingleTemplateToCompany(template, company_id, user_id, company_country_id, transaction);
            results.push(result);

            if (result.skipped) {
                templatesSkipped++;
            } else {
                templatesCopied++;
                totalSections += result.sections_copied;
                totalFields += result.fields_copied;
            }
        }

        // Step 3: Summary
        console.log(`\n╔════════════════════════════════════════════════════╗`);
        console.log(`║  Template Copying Complete                         ║`);
        console.log(`╠════════════════════════════════════════════════════╣`);
        console.log(`║  Total Templates Found:    ${allTemplates.length.toString().padStart(3)}                        ║`);
        console.log(`║  Templates Copied:         ${templatesCopied.toString().padStart(3)}                        ║`);
        console.log(`║  Templates Skipped:        ${templatesSkipped.toString().padStart(3)}                        ║`);
        console.log(`║  Total Sections Copied:    ${totalSections.toString().padStart(3)}                        ║`);
        console.log(`║  Total Fields Copied:      ${totalFields.toString().padStart(3)}                        ║`);
        console.log(`╚════════════════════════════════════════════════════╝\n`);

        return {
            total_templates: allTemplates.length,
            templates_copied: templatesCopied,
            templates_skipped: templatesSkipped,
            total_sections: totalSections,
            total_fields: totalFields,
            details: results
        };
    } catch (error) {
        console.error('Error copying templates to company:', error.message);
        throw error;
    }
};

/**
 * Check if company has templates mapped
 * @param {number} company_id - Company ID
 * @param {Object} transaction - Sequelize transaction object
 * @returns {Promise<Object>} - Template mapping status
 */
const checkCompanyTemplateMapping = async (company_id, transaction = null) => {
    try {
        // Get all active templates
        const allTemplates = await HrmsTemplate.findAll({
            where: { is_active: true },
            attributes: ['id', 'template_slug', 'template_name'],
            transaction
        });

        const mappingStatus = [];

        for (const template of allTemplates) {
            // Check if company has sections for this template
            const sectionCount = await HrmsTemplateSection.count({
                where: {
                    template_id: template.id,
                    company_id: company_id,
                    is_active: true
                },
                transaction
            });

            // Check if company has fields for this template
            const fieldCount = await HrmsTemplateField.count({
                where: {
                    template_id: template.id,
                    company_id: company_id,
                    is_active: true
                },
                transaction
            });

            mappingStatus.push({
                template_id: template.id,
                template_slug: template.template_slug,
                template_name: template.template_name,
                is_mapped: sectionCount > 0 && fieldCount > 0,
                sections_count: sectionCount,
                fields_count: fieldCount
            });
        }

        const totalMapped = mappingStatus.filter(t => t.is_mapped).length;
        const totalTemplates = allTemplates.length;

        return {
            company_id,
            total_templates: totalTemplates,
            templates_mapped: totalMapped,
            templates_not_mapped: totalTemplates - totalMapped,
            all_templates_mapped: totalMapped === totalTemplates,
            details: mappingStatus
        };
    } catch (error) {
        console.error('Error checking company template mapping:', error.message);
        throw error;
    }
};

module.exports = {
    copySingleTemplateToCompany,
    copyAllTemplatesToCompany,
    checkCompanyTemplateMapping
};
