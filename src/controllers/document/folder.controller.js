/**
 * Document Folder Controller
 * HTTP handlers for document folder management
 */

const folderService = require('../../services/document/folder.service');

/**
 * Get all folders
 * POST /api/document-folders/get-all
 */
const getAllFolders = async (req, res, next) => {
    try {
        const { company_id, is_active, search } = req.body;
        const filters = { is_active, search };

        const folders = await folderService.getAllFolders(company_id, filters);

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
 * Create folder
 * POST /api/document-folders/create
 */
const createFolder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const folder = await folderService.createFolder(req.body, userId);

        res.status(201).json({
            success: true,
            message: 'Folder created successfully',
            data: folder
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update folder
 * POST /api/document-folders/update
 */
const updateFolder = async (req, res, next) => {
    try {
        const { folder_id, company_id, ...updateData } = req.body;
        const userId = req.user.id;

        const folder = await folderService.updateFolder(folder_id, company_id, updateData, userId);

        res.status(200).json({
            success: true,
            message: 'Folder updated successfully',
            data: folder
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete folder
 * POST /api/document-folders/delete
 */
const deleteFolder = async (req, res, next) => {
    try {
        const { folder_id, company_id } = req.body;

        const result = await folderService.deleteFolder(folder_id, company_id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllFolders,
    createFolder,
    updateFolder,
    deleteFolder
};
