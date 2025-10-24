/**
 * Employee Document Routes
 * API routes for employee document management
 */

const express = require('express');
const router = express.Router();
const employeeDocumentController = require('../../controllers/document/employeeDocument.controller');

// All routes are POST type
router.post('/get-by-id', employeeDocumentController.getDocumentById);
router.post('/upload', employeeDocumentController.uploadDocument);
router.post('/update', employeeDocumentController.updateDocument);
router.post('/delete', employeeDocumentController.deleteDocument);
router.post('/mark-na', employeeDocumentController.markDocumentAsNA);

// Main APIs - Folders, types with file count, and documents list
router.post('/get-folders-with-count', employeeDocumentController.getEmployeeFoldersWithCount);
router.post('/get-types-by-folder', employeeDocumentController.getDocumentTypesByFolder);
router.post('/get-documents-by-type-id', employeeDocumentController.getEmployeeDocumentsByTypeId);

module.exports = router;
