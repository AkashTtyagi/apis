/**
 * Document Folder Routes
 * API routes for document folder management
 */

const express = require('express');
const router = express.Router();
const folderController = require('../../controllers/document/folder.controller');

// All routes are POST type
router.post('/get-all', folderController.getAllFolders);
router.post('/create', folderController.createFolder);
router.post('/update', folderController.updateFolder);
router.post('/delete', folderController.deleteFolder);

module.exports = router;
