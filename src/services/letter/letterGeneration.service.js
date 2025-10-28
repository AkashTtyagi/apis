/**
 * Letter Generation Service
 * Handles letter generation for employees with workflow integration
 */

const { sequelize } = require('../../utils/database');
const HrmsLetterTemplate = require('../../models/letter/HrmsLetterTemplate');
const HrmsLetterTemplateCustomField = require('../../models/letter/HrmsLetterTemplateCustomField');
const HrmsLetterCustomFieldValue = require('../../models/letter/HrmsLetterCustomFieldValue');
const HrmsEmployeeDocument = require('../../models/document/HrmsEmployeeDocument');
const HrmsEmployee = require('../../models/HrmsEmployee');
const HrmsWorkflowMaster = require('../../models/workflow/HrmsWorkflowMaster');
const HrmsWorkflowConfig = require('../../models/workflow/HrmsWorkflowConfig');
const HrmsWorkflowRequest = require('../../models/workflow/HrmsWorkflowRequest');
const moment = require('moment');

/**
 * Generate letter for an employee
 * @param {Object} letterData - Letter generation data
 * @param {number} userId - User ID generating the letter
 * @returns {Object} Generated letter details
 */
const generateLetterForEmployee = async (letterData, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            letter_template_id,
            employee_id,
            folder_id,
            document_type_id,
            document_title,
            custom_field_values = [],
            issue_date,
            expiry_date
        } = letterData;

        // Fetch template
        const template = await HrmsLetterTemplate.findOne({
            where: { id: letter_template_id, is_active: true },
            include: [{
                model: HrmsLetterTemplateCustomField,
                as: 'custom_fields',
                where: { is_active: true },
                required: false
            }]
        });

        if (!template) {
            throw new Error('Letter template not found');
        }

        // Fetch employee
        const employee = await HrmsEmployee.findByPk(employee_id);
        if (!employee) {
            throw new Error('Employee not found');
        }

        // Generate letter number if auto-generation is enabled
        let letterNumber = null;
        if (template.auto_generate_letter_number) {
            letterNumber = await generateLetterNumber(template, employee.company_id, transaction);
        }

        // Check if approval is required
        let workflowRequestId = null;
        let status = 'approved';

        if (template.requires_approval) {
            const workflowDetails = await checkApprovalRequired(letter_template_id, employee_id);

            if (workflowDetails.approval_required) {
                // Create workflow request
                const workflowRequest = await HrmsWorkflowRequest.create({
                    company_id: employee.company_id,
                    workflow_config_id: workflowDetails.workflow_config_id,
                    employee_id: employee_id,
                    request_type: 'letter_sending',
                    request_data: JSON.stringify({
                        letter_template_id,
                        document_title,
                        custom_field_values
                    }),
                    current_stage: 1,
                    status: 'pending',
                    created_by: userId
                }, { transaction });

                workflowRequestId = workflowRequest.id;
                status = 'pending_approval';
            }
        }

        // Create employee document
        const employeeDocument = await HrmsEmployeeDocument.create({
            company_id: employee.company_id,
            employee_id: employee_id,
            folder_id: folder_id,
            document_type_id: document_type_id,
            letter_id: letter_template_id,
            document_title: document_title || template.letter_name,
            file_path: null, // PDF will be generated on-the-fly
            file_name: null,
            file_size: null,
            mime_type: 'application/pdf',
            document_number: letterNumber,
            issue_date: issue_date || new Date(),
            expiry_date: expiry_date || null,
            workflow_request_id: workflowRequestId,
            status: status,
            uploaded_by: userId
        }, { transaction });

        // Store custom field values
        if (custom_field_values && custom_field_values.length > 0) {
            const customFieldValuesToCreate = custom_field_values.map(cfv => ({
                employee_document_id: employeeDocument.id,
                custom_field_id: cfv.custom_field_id,
                field_value: cfv.field_value
            }));

            await HrmsLetterCustomFieldValue.bulkCreate(customFieldValuesToCreate, { transaction });
        }

        await transaction.commit();

        // Fetch complete document with associations
        const completeDocument = await getLetterDetails(employeeDocument.id);

        return {
            employee_document_id: employeeDocument.id,
            letter_template_id: template.id,
            employee_id: employee_id,
            folder_id: folder_id,
            document_type_id: document_type_id,
            status: status,
            workflow_request_id: workflowRequestId,
            letter_number: letterNumber,
            custom_field_values: completeDocument.custom_field_values,
            approval_required: template.requires_approval,
            workflow_details: workflowRequestId ? await getWorkflowDetails(workflowRequestId) : null
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Check if approval is required for letter
 * @param {number} templateId - Template ID
 * @param {number} employeeId - Employee ID
 * @returns {Object} Approval requirement details
 */
const checkApprovalRequired = async (templateId, employeeId) => {
    try {
        const template = await HrmsLetterTemplate.findByPk(templateId);

        if (!template) {
            throw new Error('Letter template not found');
        }

        if (!template.requires_approval) {
            return {
                approval_required: false,
                workflow_details: null
            };
        }

        // Get employee details for company_id
        const employee = await HrmsEmployee.findByPk(employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }

        // Get workflow master for letter sending
        const workflowMaster = await HrmsWorkflowMaster.findOne({
            where: { workflow_code: 'LETTER_SENDING', is_active: true }
        });

        if (!workflowMaster) {
            throw new Error('Letter sending workflow not configured in system');
        }

        // Get active workflow config for this company
        const workflowConfig = await HrmsWorkflowConfig.findOne({
            where: {
                company_id: employee.company_id,
                workflow_master_id: workflowMaster.id,
                is_active: true
            }
        });

        if (!workflowConfig) {
            throw new Error('Letter sending workflow not configured for this company');
        }

        return {
            approval_required: true,
            workflow_config_id: workflowConfig.id,
            workflow_id: workflowMaster.id,
            workflow_code: workflowMaster.workflow_code,
            workflow_name: workflowMaster.workflow_name
        };

    } catch (error) {
        throw error;
    }
};

/**
 * Replace slugs in letter template with actual data
 * @param {Object} template - Letter template
 * @param {Object} employeeData - Employee data
 * @param {Array} customFieldValues - Custom field values
 * @returns {String} Final HTML with replaced slugs
 */
const replaceLetterSlugs = async (template, employeeData, customFieldValues = []) => {
    try {
        // System slugs from employee data
        const systemSlugs = {
            '{{FIRST_NAME}}': employeeData.first_name || '',
            '{{LAST_NAME}}': employeeData.last_name || '',
            '{{MIDDLE_NAME}}': employeeData.middle_name || '',
            '{{EMPLOYEE_CODE}}': employeeData.employee_code || '',
            '{{EMAIL}}': employeeData.email || '',
            '{{PHONE}}': employeeData.phone || '',
            '{{PERSONAL_EMAIL}}': employeeData.personal_email || '',
            '{{PERSONAL_PHONE}}': employeeData.personal_phone || '',
            '{{DATE_OF_BIRTH}}': employeeData.date_of_birth ? moment(employeeData.date_of_birth).format('DD-MM-YYYY') : '',
            '{{DATE_OF_JOINING}}': employeeData.date_of_joining ? moment(employeeData.date_of_joining).format('DD-MM-YYYY') : '',
            '{{GENDER}}': employeeData.gender || '',
            '{{MARITAL_STATUS}}': employeeData.marital_status || '',
            '{{BLOOD_GROUP}}': employeeData.blood_group || '',
            '{{ADDRESS}}': employeeData.current_address || '',
            '{{CITY}}': employeeData.current_city || '',
            '{{STATE}}': employeeData.current_state || '',
            '{{COUNTRY}}': employeeData.current_country || '',
            '{{PINCODE}}': employeeData.current_pincode || '',
            '{{CURRENT_DATE}}': moment().format('DD-MM-YYYY'),
            '{{CURRENT_YEAR}}': moment().format('YYYY'),
            '{{CURRENT_MONTH}}': moment().format('MMMM'),
        };

        // Custom slugs from custom_field_values
        const customSlugs = {};
        if (customFieldValues && customFieldValues.length > 0) {
            for (const fieldValue of customFieldValues) {
                const field = await HrmsLetterTemplateCustomField.findByPk(fieldValue.custom_field_id);
                if (field) {
                    customSlugs[`{{${field.field_slug}}}`] = fieldValue.field_value || '';
                }
            }
        }

        // Merge all slugs
        const allSlugs = { ...systemSlugs, ...customSlugs };

        // Replace slugs in main content
        let finalHTML = template.main_content || '';

        for (const [slug, value] of Object.entries(allSlugs)) {
            const regex = new RegExp(slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            finalHTML = finalHTML.replace(regex, value);
        }

        // Replace slugs in header
        let finalHeader = template.header_content || '';
        for (const [slug, value] of Object.entries(allSlugs)) {
            const regex = new RegExp(slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            finalHeader = finalHeader.replace(regex, value);
        }

        // Replace slugs in footer
        let finalFooter = template.footer_content || '';
        for (const [slug, value] of Object.entries(allSlugs)) {
            const regex = new RegExp(slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            finalFooter = finalFooter.replace(regex, value);
        }

        return {
            header: finalHeader,
            content: finalHTML,
            footer: finalFooter
        };

    } catch (error) {
        throw error;
    }
};

/**
 * Generate letter number based on template format
 * @param {Object} template - Letter template
 * @param {number} companyId - Company ID
 * @param {Object} transaction - Database transaction
 * @returns {String} Generated letter number
 */
const generateLetterNumber = async (template, companyId, transaction = null) => {
    try {
        const format = template.letter_number_format || '{PREFIX}/{YEAR}/{MONTH}/{SEQ}';
        const prefix = template.letter_number_prefix || 'LTR';

        const year = moment().format('YYYY');
        const month = moment().format('MM');
        const yearShort = moment().format('YY');

        // Get last sequence number for this company and template
        const lastDocument = await HrmsEmployeeDocument.findOne({
            where: {
                company_id: companyId,
                letter_id: template.id,
                document_number: { [sequelize.Op.like]: `${prefix}%` }
            },
            order: [['id', 'DESC']],
            transaction
        });

        let sequence = 1;
        if (lastDocument && lastDocument.document_number) {
            // Extract sequence from last document number
            const parts = lastDocument.document_number.split('/');
            const lastSeq = parseInt(parts[parts.length - 1]) || 0;
            sequence = lastSeq + 1;
        }

        // Format sequence with leading zeros (4 digits)
        const seqFormatted = sequence.toString().padStart(4, '0');

        // Replace placeholders in format
        let letterNumber = format
            .replace('{PREFIX}', prefix)
            .replace('{YEAR}', year)
            .replace('{YY}', yearShort)
            .replace('{MONTH}', month)
            .replace('{SEQ}', seqFormatted);

        return letterNumber;

    } catch (error) {
        throw error;
    }
};

/**
 * Get letter details by document ID
 * @param {number} documentId - Employee document ID
 * @returns {Object} Letter details
 */
const getLetterDetails = async (documentId) => {
    try {
        const document = await HrmsEmployeeDocument.findOne({
            where: { id: documentId },
            include: [
                {
                    model: HrmsLetterTemplate,
                    as: 'letter_template',
                    include: [{
                        model: HrmsLetterTemplateCustomField,
                        as: 'custom_fields',
                        where: { is_active: true },
                        required: false
                    }]
                },
                {
                    model: HrmsEmployee,
                    as: 'employee',
                    attributes: ['id', 'employee_code', 'first_name', 'last_name', 'email']
                }
            ]
        });

        if (!document) {
            throw new Error('Letter not found');
        }

        // Fetch custom field values
        const customFieldValues = await HrmsLetterCustomFieldValue.findAll({
            where: { employee_document_id: documentId },
            include: [{
                model: HrmsLetterTemplateCustomField,
                as: 'custom_field',
                attributes: ['id', 'field_name', 'field_slug', 'field_type']
            }]
        });

        return {
            ...document.toJSON(),
            custom_field_values: customFieldValues
        };

    } catch (error) {
        throw error;
    }
};

/**
 * Get employee letters
 * @param {number} employeeId - Employee ID
 * @param {Object} filters - Filter options
 * @returns {Array} List of employee letters
 */
const getEmployeeLetters = async (employeeId, filters = {}) => {
    try {
        const where = {
            employee_id: employeeId,
            letter_id: { [sequelize.Op.ne]: null }
        };

        // Apply filters
        if (filters.folder_id) {
            where.folder_id = filters.folder_id;
        }

        if (filters.document_type_id) {
            where.document_type_id = filters.document_type_id;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        const documents = await HrmsEmployeeDocument.findAll({
            where,
            include: [
                {
                    model: HrmsLetterTemplate,
                    as: 'letter_template',
                    attributes: ['id', 'letter_name', 'letter_code', 'category_id']
                },
                {
                    model: HrmsWorkflowRequest,
                    as: 'workflow_request',
                    required: false
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return documents;

    } catch (error) {
        throw error;
    }
};

/**
 * Preview letter HTML without creating document
 * @param {number} templateId - Template ID
 * @param {number} employeeId - Employee ID
 * @param {Array} customFieldValues - Custom field values
 * @returns {Object} Preview HTML
 */
const previewLetterHTML = async (templateId, employeeId, customFieldValues = []) => {
    try {
        const template = await HrmsLetterTemplate.findByPk(templateId);
        if (!template) {
            throw new Error('Letter template not found');
        }

        const employee = await HrmsEmployee.findByPk(employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }

        const replacedContent = await replaceLetterSlugs(template, employee, customFieldValues);

        return {
            template_name: template.letter_name,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            employee_code: employee.employee_code,
            preview: replacedContent
        };

    } catch (error) {
        throw error;
    }
};

/**
 * Get workflow details
 * @param {number} workflowRequestId - Workflow request ID
 * @returns {Object} Workflow details
 */
const getWorkflowDetails = async (workflowRequestId) => {
    try {
        const workflowRequest = await HrmsWorkflowRequest.findOne({
            where: { id: workflowRequestId },
            include: [{
                model: HrmsWorkflowConfig,
                as: 'workflow_config',
                include: [{
                    model: HrmsWorkflowMaster,
                    as: 'workflow_master'
                }]
            }]
        });

        if (!workflowRequest) {
            return null;
        }

        return {
            workflow_request_id: workflowRequest.id,
            status: workflowRequest.status,
            current_stage: workflowRequest.current_stage,
            workflow_name: workflowRequest.workflow_config?.workflow_master?.workflow_name || 'Letter Sending Approval'
        };

    } catch (error) {
        throw error;
    }
};

module.exports = {
    generateLetterForEmployee,
    checkApprovalRequired,
    replaceLetterSlugs,
    generateLetterNumber,
    getLetterDetails,
    getEmployeeLetters,
    previewLetterHTML
};
