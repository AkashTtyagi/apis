/**
 * Signed URL Routes
 * API routes for generating signed URLs for file upload and download
 */

const express = require('express');
const router = express.Router();
const signedUrlController = require('../../controllers/storage/signedUrl.controller');

// All routes are POST type
router.post('/generate-upload-url', signedUrlController.generateUploadUrl);
router.post('/generate-download-url', signedUrlController.generateDownloadUrl);
router.post('/generate-batch-download-urls', signedUrlController.generateBatchDownloadUrls);
router.post('/delete-file', signedUrlController.deleteFile);

module.exports = router;
