/**
 * Signed URL Controller
 * HTTP handlers for generating signed URLs
 */

const signedUrlService = require('../../services/storage/signedUrl.service');

/**
 * Generate upload URL (PUT)
 * POST /api/storage/generate-upload-url
 */
const generateUploadUrl = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const uploadData = req.body;

        const result = await signedUrlService.generateUploadUrl(uploadData, userId);

        res.status(200).json({
            success: true,
            message: 'Upload URL generated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate download URL (GET)
 * POST /api/storage/generate-download-url
 */
const generateDownloadUrl = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const downloadData = req.body;

        const result = await signedUrlService.generateDownloadUrl(downloadData, userId);

        res.status(200).json({
            success: true,
            message: 'Download URL generated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate batch download URLs
 * POST /api/storage/generate-batch-download-urls
 */
const generateBatchDownloadUrls = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { file_keys } = req.body;

        const results = await signedUrlService.generateBatchDownloadUrls(file_keys, userId);

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        res.status(200).json({
            success: true,
            message: `Generated ${successCount} URLs successfully, ${failureCount} failed`,
            data: results,
            summary: {
                total: results.length,
                success: successCount,
                failed: failureCount
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete file
 * POST /api/storage/delete-file
 */
const deleteFile = async (req, res, next) => {
    try {
        const { file_key } = req.body;

        const result = await signedUrlService.deleteFile(file_key);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateUploadUrl,
    generateDownloadUrl,
    generateBatchDownloadUrls,
    deleteFile
};
