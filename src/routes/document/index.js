/**
 * Document Management Routes Index
 * Central router for all document-related routes
 */

const express = require('express');
const router = express.Router();

const folderRoutes = require('./folder.routes');
const documentTypeRoutes = require('./documentType.routes');
const employeeDocumentRoutes = require('./employeeDocument.routes');

// Document folder routes
router.use('/folders', folderRoutes);

// Document type routes
router.use('/types', documentTypeRoutes);

// Employee document routes
router.use('/employee-documents', employeeDocumentRoutes);

module.exports = router;
