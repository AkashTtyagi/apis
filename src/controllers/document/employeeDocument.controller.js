/**
 * Employee Document Controller
 * HTTP handlers for employee document management
 */

const employeeDocumentService = require('../../services/document/employeeDocument.service');

/**
 * Get document by ID
 * POST /api/employee-documents/get-by-id
 */
const getDocumentById = async (req, res, next) => {
    try {
        const { document_id, company_id } = req.body;

        const document = await employeeDocumentService.getDocumentById(document_id, company_id);

        res.status(200).json({
            success: true,
            data: document
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Upload document
 * POST /api/employee-documents/upload
 */
const uploadDocument = async (req, res, next) => {
    try {
        const { field_values, ...documentData } = req.body;
        const userId = req.user.id;

        const document = await employeeDocumentService.uploadDocument(documentData, field_values, userId);

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: document
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update document
 * POST /api/employee-documents/update
 */
const updateDocument = async (req, res, next) => {
    try {
        const { document_id, company_id, field_values, ...updateData } = req.body;
        const userId = req.user.id;

        const document = await employeeDocumentService.updateDocument(document_id, company_id, updateData, field_values, userId);

        res.status(200).json({
            success: true,
            message: 'Document updated successfully',
            data: document
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete document
 * POST /api/employee-documents/delete
 */
const deleteDocument = async (req, res, next) => {
    try {
        const { document_id, company_id } = req.body;
        const userId = req.user.id;

        const result = await employeeDocumentService.deleteDocument(document_id, company_id, userId);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark document as not applicable
 * POST /api/employee-documents/mark-na
 */
const markDocumentAsNA = async (req, res, next) => {
    try {
        const { document_id, company_id, reason } = req.body;
        const userId = req.user.id;

        const document = await employeeDocumentService.markDocumentAsNA(document_id, company_id, reason, userId);

        res.status(200).json({
            success: true,
            message: 'Document marked as not applicable',
            data: document
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get employee folders with file count
 * POST /api/employee-documents/get-folders-with-count
 */
const getEmployeeFoldersWithCount = async (req, res, next) => {
    try {
        const employeeId = req.user.employee_id;
        const companyId = req.user.company_id;
        const { is_active, search } = req.body;
        const filters = { is_active, search };

        const folders = await employeeDocumentService.getEmployeeFoldersWithCount(employeeId, companyId, filters);

        res.status(200).json({
            success: true,
            data: folders,
            count: folders.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get document types by folder with file count
 * POST /api/employee-documents/get-types-by-folder
 */
const getDocumentTypesByFolder = async (req, res, next) => {
    try {
        const employeeId = req.user.employee_id;
        const companyId = req.user.company_id;
        const { folder_id, is_active, search } = req.body;
        const filters = { is_active, search };

        const types = await employeeDocumentService.getDocumentTypesByFolder(employeeId, companyId, folder_id, filters);

        res.status(200).json({
            success: true,
            data: types,
            count: types.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get employee documents list by document type ID
 * POST /api/employee-documents/get-documents-by-type-id
 */
const getEmployeeDocumentsByTypeId = async (req, res, next) => {
    try {
        const employeeId = req.user.employee_id;
        const companyId = req.user.company_id;
        const { document_type_id, is_active, search } = req.body;
        const filters = { is_active, search };

        const documents = await employeeDocumentService.getEmployeeDocumentsByTypeId(employeeId, companyId, document_type_id, filters);

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
    getDocumentById,
    uploadDocument,
    updateDocument,
    deleteDocument,
    markDocumentAsNA,
    getEmployeeFoldersWithCount,
    getDocumentTypesByFolder,
    getEmployeeDocumentsByTypeId
};
