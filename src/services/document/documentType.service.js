/**
 * Document Type Service
 * Business logic for document type management
 */

const {
    HrmsDocumentType,
    HrmsDocumentTypeField,
    HrmsDocumentFolder,
    HrmsEmployeeDocument,
    HrmsEmployeeDocumentFieldValue
} = require('../../models/document');
const HrmsEmployee = require('../../models/HrmsEmployee');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Get document type by ID
 */
const getDocumentTypeById = async (documentTypeId, companyId) => {
    const documentType = await HrmsDocumentType.findOne({
        where: {
            id: documentTypeId,
            company_id: companyId
        },
        include: [
            {
                model: HrmsDocumentFolder,
                as: 'folder'
            },
            {
                model: HrmsDocumentTypeField,
                as: 'fields',
                order: [['display_order', 'ASC']]
            }
        ]
    });

    if (!documentType) {
        throw new Error('Document type not found');
    }

    const documentCount = await HrmsEmployeeDocument.count({
        where: {
            document_type_id: documentTypeId,
            company_id: companyId,
            is_active: true
        }
    });

    return {
        ...documentType.toJSON(),
        document_count: documentCount
    };
};

/**
 * Create document type with fields
 */
const createDocumentType = async (documentTypeData, userId) => {
    const {
        company_id,
        folder_id,
        document_type_code,
        document_type_name,
        document_description,
        allow_single_document,
        allow_multiple_documents,
        is_mandatory,
        allow_not_applicable,
        require_expiry_date,
        allowed_file_types,
        max_file_size_mb,
        display_order,
        fields
    } = documentTypeData;

    // Check if document type code already exists
    const existing = await HrmsDocumentType.findOne({
        where: {
            company_id,
            document_type_code
        }
    });

    if (existing) {
        throw new Error(`Document type '${document_type_code}' already exists`);
    }

    // Validate folder exists
    const folder = await HrmsDocumentFolder.findOne({
        where: {
            id: folder_id,
            company_id
        }
    });

    if (!folder) {
        throw new Error('Folder not found');
    }

    const transaction = await sequelize.transaction();

    try {
        // Create document type
        const documentType = await HrmsDocumentType.create({
            company_id,
            folder_id,
            document_type_code,
            document_type_name,
            document_description,
            allow_single_document: allow_single_document !== undefined ? allow_single_document : true,
            allow_multiple_documents: allow_multiple_documents || false,
            is_mandatory: is_mandatory || false,
            allow_not_applicable: allow_not_applicable || false,
            require_expiry_date: require_expiry_date || false,
            allowed_file_types: allowed_file_types || 'pdf,jpg,jpeg,png,doc,docx',
            max_file_size_mb: max_file_size_mb || 5.00,
            display_order: display_order || 0,
            is_system_type: false,
            is_active: true,
            created_by: userId
        }, { transaction });

        // Create fields if provided
        if (fields && Array.isArray(fields) && fields.length > 0) {
            const fieldRecords = fields.map((field, index) => ({
                document_type_id: documentType.id,
                field_name: field.field_name,
                field_label: field.field_label,
                field_type: field.field_type,
                field_values: field.field_values ? JSON.stringify(field.field_values) : null,
                placeholder: field.placeholder,
                default_value: field.default_value,
                validation_rules: field.validation_rules,
                is_required: field.is_required || false,
                is_readonly: field.is_readonly || false,
                is_visible: field.is_visible !== undefined ? field.is_visible : true,
                display_order: field.display_order || index,
                help_text: field.help_text,
                created_by: userId
            }));

            await HrmsDocumentTypeField.bulkCreate(fieldRecords, { transaction });
        }

        await transaction.commit();

        return await getDocumentTypeById(documentType.id, company_id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Update document type
 */
const updateDocumentType = async (documentTypeId, companyId, updateData, userId) => {
    const documentType = await HrmsDocumentType.findOne({
        where: {
            id: documentTypeId,
            company_id: companyId
        }
    });

    if (!documentType) {
        throw new Error('Document type not found');
    }

    if (documentType.is_system_type && updateData.document_type_code) {
        throw new Error('Cannot change code of system document type');
    }

    const allowedFields = [
        'document_type_name',
        'document_description',
        'allow_single_document',
        'allow_multiple_documents',
        'is_mandatory',
        'allow_not_applicable',
        'require_expiry_date',
        'allowed_file_types',
        'max_file_size_mb',
        'display_order',
        'is_active'
    ];

    const updateFields = {};
    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            updateFields[field] = updateData[field];
        }
    });

    updateFields.updated_by = userId;

    await documentType.update(updateFields);

    return await getDocumentTypeById(documentTypeId, companyId);
};

/**
 * Delete document type
 */
const deleteDocumentType = async (documentTypeId, companyId) => {
    const documentType = await HrmsDocumentType.findOne({
        where: {
            id: documentTypeId,
            company_id: companyId
        }
    });

    if (!documentType) {
        throw new Error('Document type not found');
    }

    if (documentType.is_system_type) {
        throw new Error('Cannot delete system document type');
    }

    // Check if document type has documents
    const documentCount = await HrmsEmployeeDocument.count({
        where: { document_type_id: documentTypeId }
    });

    if (documentCount > 0) {
        throw new Error('Cannot delete document type with existing documents');
    }

    await documentType.destroy();

    return { message: 'Document type deleted successfully' };
};

/**
 * Add field to document type
 */
const addFieldToDocumentType = async (documentTypeId, companyId, fieldData, userId) => {
    const documentType = await HrmsDocumentType.findOne({
        where: {
            id: documentTypeId,
            company_id: companyId
        }
    });

    if (!documentType) {
        throw new Error('Document type not found');
    }

    // Check if field name already exists
    const existing = await HrmsDocumentTypeField.findOne({
        where: {
            document_type_id: documentTypeId,
            field_name: fieldData.field_name
        }
    });

    if (existing) {
        throw new Error(`Field '${fieldData.field_name}' already exists`);
    }

    const field = await HrmsDocumentTypeField.create({
        document_type_id: documentTypeId,
        field_name: fieldData.field_name,
        field_label: fieldData.field_label,
        field_type: fieldData.field_type,
        field_values: fieldData.field_values ? JSON.stringify(fieldData.field_values) : null,
        placeholder: fieldData.placeholder,
        default_value: fieldData.default_value,
        validation_rules: fieldData.validation_rules,
        is_required: fieldData.is_required || false,
        is_readonly: fieldData.is_readonly || false,
        is_visible: fieldData.is_visible !== undefined ? fieldData.is_visible : true,
        display_order: fieldData.display_order || 0,
        help_text: fieldData.help_text,
        created_by: userId
    });

    return field;
};

/**
 * Update field
 */
const updateField = async (fieldId, documentTypeId, companyId, updateData, userId) => {
    const field = await HrmsDocumentTypeField.findOne({
        where: { id: fieldId, document_type_id: documentTypeId },
        include: [
            {
                model: HrmsDocumentType,
                as: 'documentType',
                where: { company_id: companyId }
            }
        ]
    });

    if (!field) {
        throw new Error('Field not found');
    }

    const allowedFields = [
        'field_label',
        'field_type',
        'field_values',
        'placeholder',
        'default_value',
        'validation_rules',
        'is_required',
        'is_readonly',
        'is_visible',
        'display_order',
        'help_text'
    ];

    const updateFields = {};
    allowedFields.forEach(fieldName => {
        if (updateData[fieldName] !== undefined) {
            if (fieldName === 'field_values' && updateData[fieldName]) {
                updateFields[fieldName] = JSON.stringify(updateData[fieldName]);
            } else {
                updateFields[fieldName] = updateData[fieldName];
            }
        }
    });

    updateFields.updated_by = userId;

    await field.update(updateFields);

    return field;
};

/**
 * Delete field
 */
const deleteField = async (fieldId, documentTypeId, companyId) => {
    const field = await HrmsDocumentTypeField.findOne({
        where: { id: fieldId, document_type_id: documentTypeId },
        include: [
            {
                model: HrmsDocumentType,
                as: 'documentType',
                where: { company_id: companyId }
            }
        ]
    });

    if (!field) {
        throw new Error('Field not found');
    }

    await field.destroy();

    return { message: 'Field deleted successfully' };
};

/**
 * Get document types with file count by folder ID and employee search
 */
const getDocumentTypesWithFileCount = async (companyId, folderId, filters = {}) => {
    const typeWhere = {
        company_id: companyId
    };

    if (folderId) {
        typeWhere.folder_id = folderId;
    }

    if (filters.is_active !== undefined) {
        typeWhere.is_active = filters.is_active;
    }

    const documentTypes = await HrmsDocumentType.findAll({
        where: typeWhere,
        attributes: [
            'id',
            'document_type_code',
            'document_type_name',
            'document_description',
            'folder_id',
            'allow_single_document',
            'allow_multiple_documents',
            'is_mandatory',
            'allow_not_applicable',
            'require_expiry_date',
            'allowed_file_types',
            'max_file_size_mb',
            'display_order',
            'is_system_type',
            'is_active',
            'created_at',
            'updated_at'
        ],
        include: [
            {
                model: HrmsDocumentFolder,
                as: 'folder',
                attributes: ['id', 'folder_name']
            }
        ],
        order: [['display_order', 'ASC']]
    });

    // Build where clause for employee documents
    const docWhere = {
        company_id: companyId,
        is_active: true
    };

    // Employee name search
    let employeeIds = null;
    if (filters.employee_search) {
        const employees = await HrmsEmployee.findAll({
            where: {
                company_id: companyId,
                [Op.or]: [
                    { first_name: { [Op.like]: `%${filters.employee_search}%` } },
                    { last_name: { [Op.like]: `%${filters.employee_search}%` } },
                    { employee_code: { [Op.like]: `%${filters.employee_search}%` } }
                ]
            },
            attributes: ['id']
        });

        employeeIds = employees.map(emp => emp.id);
        if (employeeIds.length === 0) {
            // No employees found, return types with 0 count
            return documentTypes.map(type => ({
                ...type.toJSON(),
                file_count: 0
            }));
        }
        docWhere.employee_id = { [Op.in]: employeeIds };
    }

    // Add file counts
    const typesWithCounts = await Promise.all(documentTypes.map(async (type) => {
        const fileCount = await HrmsEmployeeDocument.count({
            where: {
                ...docWhere,
                document_type_id: type.id
            }
        });

        return {
            ...type.toJSON(),
            file_count: fileCount
        };
    }));

    return typesWithCounts;
};

/**
 * Get all document files with filters (employee search, folder, type, date range)
 */
const getAllDocumentFiles = async (companyId, filters = {}) => {
    const docWhere = {
        company_id: companyId
    };

    // Active filter
    if (filters.is_active !== undefined) {
        docWhere.is_active = filters.is_active;
    }

    // Folder filter
    if (filters.folder_id) {
        docWhere.folder_id = filters.folder_id;
    }

    // Document type filter
    if (filters.document_type_id) {
        docWhere.document_type_id = filters.document_type_id;
    }

    // Date range filter
    if (filters.from_date || filters.to_date) {
        docWhere.created_at = {};
        if (filters.from_date) {
            docWhere.created_at[Op.gte] = new Date(filters.from_date);
        }
        if (filters.to_date) {
            docWhere.created_at[Op.lte] = new Date(filters.to_date);
        }
    }

    // Employee search
    let employeeIds = null;
    if (filters.employee_search) {
        const employees = await HrmsEmployee.findAll({
            where: {
                company_id: companyId,
                [Op.or]: [
                    { first_name: { [Op.like]: `%${filters.employee_search}%` } },
                    { last_name: { [Op.like]: `%${filters.employee_search}%` } },
                    { employee_code: { [Op.like]: `%${filters.employee_search}%` } }
                ]
            },
            attributes: ['id']
        });

        employeeIds = employees.map(emp => emp.id);
        if (employeeIds.length === 0) {
            return []; // No employees found
        }
        docWhere.employee_id = { [Op.in]: employeeIds };
    }

    const documents = await HrmsEmployeeDocument.findAll({
        where: docWhere,
        include: [
            {
                model: HrmsEmployee,
                as: 'employee',
                attributes: ['id', 'employee_code', 'first_name', 'last_name', 'email']
            },
            {
                model: HrmsDocumentFolder,
                as: 'folder',
                attributes: ['id', 'folder_name']
            },
            {
                model: HrmsDocumentType,
                as: 'documentType',
                attributes: ['id', 'document_type_code', 'document_type_name', 'require_expiry_date']
            },
            {
                model: HrmsEmployeeDocumentFieldValue,
                as: 'fieldValues',
                required: false,
                include: [
                    {
                        model: HrmsDocumentTypeField,
                        as: 'field',
                        attributes: ['id', 'field_name', 'field_label', 'field_type']
                    }
                ]
            }
        ],
        order: [['created_at', 'DESC']]
    });

    return documents;
};

module.exports = {
    getDocumentTypeById,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
    addFieldToDocumentType,
    updateField,
    deleteField,
    getDocumentTypesWithFileCount,
    getAllDocumentFiles
};
