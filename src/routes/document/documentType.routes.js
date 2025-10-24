/**
 * Document Type Routes
 * API routes for document type management
 */

const express = require('express');
const router = express.Router();
const documentTypeController = require('../../controllers/document/documentType.controller');

// All routes are POST type
router.post('/get-by-id', documentTypeController.getDocumentTypeById);
router.post('/create', documentTypeController.createDocumentType);
router.post('/update', documentTypeController.updateDocumentType);
router.post('/delete', documentTypeController.deleteDocumentType);

// Field management
router.post('/add-field', documentTypeController.addFieldToDocumentType);
router.post('/update-field', documentTypeController.updateField);
router.post('/delete-field', documentTypeController.deleteField);

// Main APIs - Document types with file count and all files
router.post('/get-types-with-file-count', documentTypeController.getDocumentTypesWithFileCount);
router.post('/get-all-files', documentTypeController.getAllDocumentFiles);

module.exports = router;
