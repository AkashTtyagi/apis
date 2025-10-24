/**
 * Employee Document Service
 * Business logic for employee document upload and management
 */

const {
    HrmsEmployeeDocument,
    HrmsEmployeeDocumentFieldValue,
    HrmsDocumentType,
    HrmsDocumentTypeField,
    HrmsDocumentFolder,
    HrmsDocumentAuditLog
} = require('../../models/document');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Get document by ID
 */
const getDocumentById = async (documentId, companyId) => {
    const document = await HrmsEmployeeDocument.findOne({
        where: {
            id: documentId,
            company_id: companyId
        },
        include: [
            {
                model: HrmsDocumentFolder,
                as: 'folder'
            },
            {
                model: HrmsDocumentType,
                as: 'documentType',
                include: [
                    {
                        model: HrmsDocumentTypeField,
                        as: 'fields',
                        order: [['display_order', 'ASC']]
                    }
                ]
            },
            {
                model: HrmsEmployeeDocumentFieldValue,
                as: 'fieldValues',
                include: [
                    {
                        model: HrmsDocumentTypeField,
                        as: 'field'
                    }
                ]
            }
        ]
    });

    if (!document) {
        throw new Error('Document not found');
    }

    return document;
};

/**
 * Upload document
 */
const uploadDocument = async (documentData, fieldValues, userId) => {
    const {
        company_id,
        employee_id,
        folder_id,
        document_type_id,
        document_number,
        document_description,
        file_name,
        file_path,
        file_size_kb,
        file_type,
        file_extension,
        issue_date,
        expiry_date,
        is_not_applicable,
        not_applicable_reason
    } = documentData;

    // Validate document type
    const documentType = await HrmsDocumentType.findOne({
        where: {
            id: document_type_id,
            company_id: company_id
        }
    });

    if (!documentType) {
        throw new Error('Document type not found');
    }

    // Check if document type is active
    if (!documentType.is_active) {
        throw new Error(`Document type '${documentType.document_type_name}' is not active`);
    }

    // Validate allow_not_applicable
    if (is_not_applicable) {
        if (!documentType.allow_not_applicable) {
            throw new Error(`Document type '${documentType.document_type_name}' does not allow marking as not applicable`);
        }
        if (!not_applicable_reason) {
            throw new Error('Not applicable reason is required when marking document as N/A');
        }
    }

    // If not marked as N/A, validate file upload
    if (!is_not_applicable) {
        if (!file_path || !file_name) {
            throw new Error('File upload is required for this document type');
        }

        // Count existing active documents for this type
        const existingDocCount = await HrmsEmployeeDocument.count({
            where: {
                employee_id,
                document_type_id,
                is_active: true,
                is_not_applicable: false
            }
        });

        // Validate allow_single_document and allow_multiple_documents
        if (documentType.allow_single_document && !documentType.allow_multiple_documents) {
            // Only one document allowed
            if (existingDocCount > 0) {
                throw new Error(`Only one document of type '${documentType.document_type_name}' is allowed. Please delete the existing document before uploading a new one.`);
            }
        } else if (!documentType.allow_single_document && !documentType.allow_multiple_documents) {
            // No documents allowed (edge case)
            throw new Error(`Document type '${documentType.document_type_name}' does not allow document uploads`);
        } else if (!documentType.allow_single_document && documentType.allow_multiple_documents) {
            // Multiple documents required (at least 2)
            // Allow upload since we're adding to the collection
        } else if (documentType.allow_single_document && documentType.allow_multiple_documents) {
            // Both single and multiple allowed
            // Allow upload without restrictions
        }
    }

    const transaction = await sequelize.transaction();

    try {
        // Create document
        const document = await HrmsEmployeeDocument.create({
            company_id,
            employee_id,
            folder_id,
            document_type_id,
            document_number,
            document_description,
            file_name,
            file_path,
            file_size_kb,
            file_type,
            file_extension,
            issue_date,
            expiry_date,
            is_not_applicable: is_not_applicable || false,
            not_applicable_reason,
            is_active: true,
            uploaded_by: userId
        }, { transaction });

        // Save field values if provided
        if (fieldValues && Array.isArray(fieldValues) && fieldValues.length > 0) {
            const fieldValueRecords = fieldValues.map(fv => ({
                employee_document_id: document.id,
                field_id: fv.field_id,
                field_value: fv.field_value
            }));

            await HrmsEmployeeDocumentFieldValue.bulkCreate(fieldValueRecords, { transaction });
        }

        // Create audit log
        await HrmsDocumentAuditLog.create({
            company_id,
            employee_document_id: document.id,
            folder_id,
            document_type_id,
            action: 'document_uploaded',
            performed_by: userId,
            performed_on_behalf_of: employee_id !== userId ? employee_id : null,
            action_details: {
                document_name: document_number,
                file_name: file_name
            }
        }, { transaction });

        await transaction.commit();

        return await getDocumentById(document.id, company_id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Update document
 */
const updateDocument = async (documentId, companyId, updateData, fieldValues, userId) => {
    const document = await HrmsEmployeeDocument.findOne({
        where: {
            id: documentId,
            company_id: companyId
        }
    });

    if (!document) {
        throw new Error('Document not found');
    }

    // Get document type for validation
    const documentType = await HrmsDocumentType.findOne({
        where: {
            id: document.document_type_id,
            company_id: companyId
        }
    });

    if (!documentType) {
        throw new Error('Document type not found');
    }

    // Validate if updating is_not_applicable
    if (updateData.is_not_applicable !== undefined) {
        if (updateData.is_not_applicable && !documentType.allow_not_applicable) {
            throw new Error(`Document type '${documentType.document_type_name}' does not allow marking as not applicable`);
        }
        if (updateData.is_not_applicable && !updateData.not_applicable_reason) {
            throw new Error('Not applicable reason is required when marking document as N/A');
        }
    }

    // Validate if deactivating the document
    if (updateData.is_active === false || updateData.is_active === 0) {
        // Check if this is a mandatory document
        if (documentType.is_mandatory) {
            // Count remaining active documents of this type for the employee
            const activeDocCount = await HrmsEmployeeDocument.count({
                where: {
                    employee_id: document.employee_id,
                    document_type_id: document.document_type_id,
                    company_id: companyId,
                    is_active: true,
                    id: { [Op.ne]: documentId } // Exclude current document
                }
            });

            // If single document type and trying to deactivate, check if at least one N/A exists
            if (documentType.allow_single_document && !documentType.allow_multiple_documents) {
                const naDocExists = await HrmsEmployeeDocument.findOne({
                    where: {
                        employee_id: document.employee_id,
                        document_type_id: document.document_type_id,
                        company_id: companyId,
                        is_not_applicable: true,
                        is_active: true,
                        id: { [Op.ne]: documentId }
                    }
                });

                if (activeDocCount === 0 && !naDocExists && !documentType.allow_not_applicable) {
                    throw new Error(`Cannot deactivate mandatory document '${documentType.document_type_name}'. At least one active document is required.`);
                }
            }
        }
    }

    const transaction = await sequelize.transaction();

    try {
        const allowedFields = [
            'document_number',
            'document_description',
            'issue_date',
            'expiry_date',
            'is_not_applicable',
            'not_applicable_reason',
            'is_active'
        ];

        const updateFields = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields[field] = updateData[field];
            }
        });

        updateFields.updated_by = userId;

        await document.update(updateFields, { transaction });

        // Update field values if provided
        if (fieldValues && Array.isArray(fieldValues) && fieldValues.length > 0) {
            // Delete existing field values
            await HrmsEmployeeDocumentFieldValue.destroy({
                where: { employee_document_id: documentId },
                transaction
            });

            // Create new field values
            const fieldValueRecords = fieldValues.map(fv => ({
                employee_document_id: documentId,
                field_id: fv.field_id,
                field_value: fv.field_value
            }));

            await HrmsEmployeeDocumentFieldValue.bulkCreate(fieldValueRecords, { transaction });
        }

        // Create audit log
        await HrmsDocumentAuditLog.create({
            company_id: companyId,
            employee_document_id: documentId,
            folder_id: document.folder_id,
            document_type_id: document.document_type_id,
            action: 'document_updated',
            performed_by: userId,
            action_details: updateFields
        }, { transaction });

        await transaction.commit();

        return await getDocumentById(documentId, companyId);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Delete document
 */
const deleteDocument = async (documentId, companyId, userId) => {
    const document = await HrmsEmployeeDocument.findOne({
        where: {
            id: documentId,
            company_id: companyId
        }
    });

    if (!document) {
        throw new Error('Document not found');
    }

    // Get document type for validation
    const documentType = await HrmsDocumentType.findOne({
        where: {
            id: document.document_type_id,
            company_id: companyId
        }
    });

    if (documentType && documentType.is_mandatory) {
        // Count remaining active documents of this type for the employee
        const activeDocCount = await HrmsEmployeeDocument.count({
            where: {
                employee_id: document.employee_id,
                document_type_id: document.document_type_id,
                company_id: companyId,
                is_active: true,
                id: { [Op.ne]: documentId } // Exclude current document
            }
        });

        // Check if at least one N/A document exists
        const naDocExists = await HrmsEmployeeDocument.findOne({
            where: {
                employee_id: document.employee_id,
                document_type_id: document.document_type_id,
                company_id: companyId,
                is_not_applicable: true,
                is_active: true,
                id: { [Op.ne]: documentId }
            }
        });

        // If single document type and trying to delete
        if (documentType.allow_single_document && !documentType.allow_multiple_documents) {
            if (activeDocCount === 0 && !naDocExists && !documentType.allow_not_applicable) {
                throw new Error(`Cannot delete mandatory document '${documentType.document_type_name}'. At least one active document is required.`);
            }
        }
    }

    const transaction = await sequelize.transaction();

    try {
        // Create audit log before deletion
        await HrmsDocumentAuditLog.create({
            company_id: companyId,
            employee_document_id: documentId,
            folder_id: document.folder_id,
            document_type_id: document.document_type_id,
            action: 'document_deleted',
            performed_by: userId,
            action_details: {
                document_number: document.document_number,
                file_name: document.file_name
            }
        }, { transaction });

        await document.destroy({ transaction });

        await transaction.commit();

        return { message: 'Document deleted successfully' };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Mark document as not applicable
 */
const markDocumentAsNA = async (documentId, companyId, reason, userId) => {
    const document = await HrmsEmployeeDocument.findOne({
        where: {
            id: documentId,
            company_id: companyId
        }
    });

    if (!document) {
        throw new Error('Document not found');
    }

    // Get document type for validation
    const documentType = await HrmsDocumentType.findOne({
        where: {
            id: document.document_type_id,
            company_id: companyId
        }
    });

    if (!documentType) {
        throw new Error('Document type not found');
    }

    // Validate if allow_not_applicable is enabled
    if (!documentType.allow_not_applicable) {
        throw new Error(`Document type '${documentType.document_type_name}' does not allow marking as not applicable`);
    }

    if (!reason || reason.trim() === '') {
        throw new Error('Not applicable reason is required');
    }

    await document.update({
        is_not_applicable: true,
        not_applicable_reason: reason,
        updated_by: userId
    });

    // Create audit log
    await HrmsDocumentAuditLog.create({
        company_id: companyId,
        employee_document_id: documentId,
        folder_id: document.folder_id,
        document_type_id: document.document_type_id,
        action: 'document_marked_na',
        performed_by: userId,
        action_details: { reason }
    });

    return await getDocumentById(documentId, companyId);
};

/**
 * Get employee folders with file count
 */
const getEmployeeFoldersWithCount = async (employeeId, companyId, filters = {}) => {
    const where = { company_id: companyId };

    if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
    }

    if (filters.search) {
        where.folder_name = {
            [Op.like]: `%${filters.search}%`
        };
    }

    const folders = await HrmsDocumentFolder.findAll({
        where,
        attributes: ['id', 'folder_name', 'folder_description', 'display_order', 'is_system_folder', 'is_active'],
        order: [['display_order', 'ASC']]
    });

    const foldersWithCounts = await Promise.all(folders.map(async (folder) => {
        const fileCount = await HrmsEmployeeDocument.count({
            where: {
                employee_id: employeeId,
                folder_id: folder.id,
                company_id: companyId,
                is_active: true
            }
        });

        return {
            ...folder.toJSON(),
            file_count: fileCount
        };
    }));

    return foldersWithCounts;
};

/**
 * Get document types by folder with file count for employee
 */
const getDocumentTypesByFolder = async (employeeId, companyId, folderId, filters = {}) => {
    const where = {
        company_id: companyId,
        folder_id: folderId
    };

    if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
    }

    if (filters.search) {
        where[Op.or] = [
            { document_type_name: { [Op.like]: `%${filters.search}%` } },
            { document_type_code: { [Op.like]: `%${filters.search}%` } }
        ];
    }

    const documentTypes = await HrmsDocumentType.findAll({
        where,
        attributes: ['id', 'document_type_code', 'document_type_name', 'folder_id', 'display_order', 'is_active'],
        order: [['display_order', 'ASC']]
    });

    const typesWithCounts = await Promise.all(documentTypes.map(async (type) => {
        const fileCount = await HrmsEmployeeDocument.count({
            where: {
                employee_id: employeeId,
                document_type_id: type.id,
                company_id: companyId,
                is_active: true
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
 * Get employee documents list by document type ID
 */
const getEmployeeDocumentsByTypeId = async (employeeId, companyId, documentTypeId, filters = {}) => {
    const where = {
        employee_id: employeeId,
        company_id: companyId,
        document_type_id: documentTypeId
    };

    if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
    }

    if (filters.search) {
        where[Op.or] = [
            { document_number: { [Op.like]: `%${filters.search}%` } },
            { document_description: { [Op.like]: `%${filters.search}%` } },
            { file_name: { [Op.like]: `%${filters.search}%` } }
        ];
    }

    const documents = await HrmsEmployeeDocument.findAll({
        where,
        include: [
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
    getDocumentById,
    uploadDocument,
    updateDocument,
    deleteDocument,
    markDocumentAsNA,
    getEmployeeFoldersWithCount,
    getDocumentTypesByFolder,
    getEmployeeDocumentsByTypeId
};
