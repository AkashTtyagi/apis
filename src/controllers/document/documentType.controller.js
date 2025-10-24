/**
 * Document Type Controller
 * HTTP handlers for document type management
 */

const documentTypeService = require('../../services/document/documentType.service');

/**
 * Get document type by ID
 * POST /api/document-types/get-by-id
 */
const getDocumentTypeById = async (req, res, next) => {
    try {
        const { document_type_id, company_id } = req.body;

        const documentType = await documentTypeService.getDocumentTypeById(document_type_id, company_id);

        res.status(200).json({
            success: true,
            data: documentType
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create document type
 * POST /api/document-types/create
 */
const createDocumentType = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const documentType = await documentTypeService.createDocumentType(req.body, userId);

        res.status(201).json({
            success: true,
            message: 'Document type created successfully',
            data: documentType
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update document type
 * POST /api/document-types/update
 */
const updateDocumentType = async (req, res, next) => {
    try {
        const { document_type_id, company_id, ...updateData } = req.body;
        const userId = req.user.id;

        const documentType = await documentTypeService.updateDocumentType(document_type_id, company_id, updateData, userId);

        res.status(200).json({
            success: true,
            message: 'Document type updated successfully',
            data: documentType
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete document type
 * POST /api/document-types/delete
 */
const deleteDocumentType = async (req, res, next) => {
    try {
        const { document_type_id, company_id } = req.body;

        const result = await documentTypeService.deleteDocumentType(document_type_id, company_id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add field to document type
 * POST /api/document-types/add-field
 */
const addFieldToDocumentType = async (req, res, next) => {
    try {
        const { document_type_id, company_id, ...fieldData } = req.body;
        const userId = req.user.id;

        const field = await documentTypeService.addFieldToDocumentType(document_type_id, company_id, fieldData, userId);

        res.status(201).json({
            success: true,
            message: 'Field added successfully',
            data: field
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update field
 * POST /api/document-types/update-field
 */
const updateField = async (req, res, next) => {
    try {
        const { field_id, document_type_id, company_id, ...updateData } = req.body;
        const userId = req.user.id;

        const field = await documentTypeService.updateField(field_id, document_type_id, company_id, updateData, userId);

        res.status(200).json({
            success: true,
            message: 'Field updated successfully',
            data: field
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete field
 * POST /api/document-types/delete-field
 */
const deleteField = async (req, res, next) => {
    try {
        const { field_id, document_type_id, company_id } = req.body;

        const result = await documentTypeService.deleteField(field_id, document_type_id, company_id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get document types with file count by folder and employee search
 * POST /api/document-types/get-types-with-file-count
 */
const getDocumentTypesWithFileCount = async (req, res, next) => {
    try {
        const { company_id, folder_id, is_active, employee_search } = req.body;
        const filters = { is_active, employee_search };

        const documentTypes = await documentTypeService.getDocumentTypesWithFileCount(company_id, folder_id, filters);

        res.status(200).json({
            success: true,
            data: documentTypes,
            count: documentTypes.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all document files with filters
 * POST /api/document-types/get-all-files
 */
const getAllDocumentFiles = async (req, res, next) => {
    try {
        const { company_id, folder_id, document_type_id, is_active, employee_search, from_date, to_date } = req.body;
        const filters = { folder_id, document_type_id, is_active, employee_search, from_date, to_date };

        const documents = await documentTypeService.getAllDocumentFiles(company_id, filters);

        res.status(200).json({
            success: true,
            data: documents,
            count: documents.length
        });
    } catch (error) {
        next(error);
    }
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
