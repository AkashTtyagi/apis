/**
 * Document Folder Service
 * Business logic for document folder management
 */

const {
    HrmsDocumentFolder,
    HrmsDocumentFolderPermission,
    HrmsDocumentType,
    HrmsEmployeeDocument
} = require('../../models/document');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Get all folders for a company with document counts
 */
const getAllFolders = async (companyId, filters = {}) => {
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
        include: [
            {
                model: HrmsDocumentFolderPermission,
                as: 'permissions',
                where: { is_active: true },
                required: false
            },
            {
                model: HrmsDocumentType,
                as: 'documentTypes',
                where: { is_active: true },
                required: false,
                attributes: ['id', 'document_type_code', 'document_type_name']
            }
        ],
        order: [['display_order', 'ASC']]
    });

    // Add document counts
    const foldersWithCounts = await Promise.all(folders.map(async (folder) => {
        const documentTypeCount = await HrmsDocumentType.count({
            where: {
                folder_id: folder.id,
                is_active: true
            }
        });

        const documentCount = await HrmsEmployeeDocument.count({
            where: {
                folder_id: folder.id,
                company_id: companyId,
                is_active: true
            }
        });

        return {
            ...folder.toJSON(),
            document_type_count: documentTypeCount,
            document_count: documentCount
        };
    }));

    return foldersWithCounts;
};

/**
 * Get folder by ID with details
 */
const getFolderById = async (folderId, companyId) => {
    const folder = await HrmsDocumentFolder.findOne({
        where: {
            id: folderId,
            company_id: companyId
        },
        include: [
            {
                model: HrmsDocumentFolderPermission,
                as: 'permissions',
                where: { is_active: true },
                required: false
            },
            {
                model: HrmsDocumentType,
                as: 'documentTypes',
                where: { is_active: true },
                required: false
            }
        ]
    });

    if (!folder) {
        throw new Error('Folder not found');
    }

    const documentTypeCount = await HrmsDocumentType.count({
        where: {
            folder_id: folderId,
            is_active: true
        }
    });

    const documentCount = await HrmsEmployeeDocument.count({
        where: {
            folder_id: folderId,
            company_id: companyId,
            is_active: true
        }
    });

    return {
        ...folder.toJSON(),
        document_type_count: documentTypeCount,
        document_count: documentCount
    };
};

/**
 * Create folder
 */
const createFolder = async (folderData, userId) => {
    const {
        company_id,
        folder_name,
        folder_description,
        display_order,
        permissions
    } = folderData;

    // Check if folder name already exists for this company
    const existing = await HrmsDocumentFolder.findOne({
        where: {
            company_id,
            folder_name,
            is_active: true
        }
    });

    if (existing) {
        throw new Error(`Folder '${folder_name}' already exists`);
    }

    const transaction = await sequelize.transaction();

    try {
        // Create folder
        const folder = await HrmsDocumentFolder.create({
            company_id,
            folder_name,
            folder_description,
            display_order: display_order || 0,
            is_system_folder: false,
            is_active: true,
            created_by: userId
        }, { transaction });

        // Create permissions if provided
        if (permissions && Array.isArray(permissions) && permissions.length > 0) {
            const permissionRecords = permissions.map(perm => ({
                folder_id: folder.id,
                role_type: perm.role_type,
                custom_role_id: perm.custom_role_id || null,
                can_view: perm.can_view || false,
                can_add: perm.can_add || false,
                can_update: perm.can_update || false,
                can_delete: perm.can_delete || false,
                is_active: true,
                created_by: userId
            }));

            await HrmsDocumentFolderPermission.bulkCreate(permissionRecords, { transaction });
        }

        await transaction.commit();

        return await getFolderById(folder.id, company_id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Update folder
 */
const updateFolder = async (folderId, companyId, updateData, userId) => {
    const folder = await HrmsDocumentFolder.findOne({
        where: {
            id: folderId,
            company_id: companyId
        }
    });

    if (!folder) {
        throw new Error('Folder not found');
    }

    if (folder.is_system_folder && updateData.folder_name) {
        throw new Error('Cannot rename system folder');
    }

    const transaction = await sequelize.transaction();

    try {
        const allowedFields = [
            'folder_name',
            'folder_description',
            'display_order',
            'is_active'
        ];

        const updateFields = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields[field] = updateData[field];
            }
        });

        updateFields.updated_by = userId;

        await folder.update(updateFields, { transaction });

        // Update permissions if provided
        if (updateData.permissions && Array.isArray(updateData.permissions)) {
            // Delete existing permissions
            await HrmsDocumentFolderPermission.destroy({
                where: { folder_id: folderId },
                transaction
            });

            // Create new permissions
            if (updateData.permissions.length > 0) {
                const permissionRecords = updateData.permissions.map(perm => ({
                    folder_id: folderId,
                    role_type: perm.role_type,
                    custom_role_id: perm.custom_role_id || null,
                    can_view: perm.can_view || false,
                    can_add: perm.can_add || false,
                    can_update: perm.can_update || false,
                    can_delete: perm.can_delete || false,
                    is_active: true,
                    created_by: userId
                }));

                await HrmsDocumentFolderPermission.bulkCreate(permissionRecords, { transaction });
            }
        }

        await transaction.commit();

        return await getFolderById(folderId, companyId);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Delete folder
 */
const deleteFolder = async (folderId, companyId) => {
    const folder = await HrmsDocumentFolder.findOne({
        where: {
            id: folderId,
            company_id: companyId
        }
    });

    if (!folder) {
        throw new Error('Folder not found');
    }

    if (folder.is_system_folder) {
        throw new Error('Cannot delete system folder');
    }

    // Check if folder has document types
    const docTypeCount = await HrmsDocumentType.count({
        where: { folder_id: folderId }
    });

    if (docTypeCount > 0) {
        throw new Error('Cannot delete folder with document types. Delete document types first.');
    }

    await folder.destroy();

    return { message: 'Folder deleted successfully' };
};

module.exports = {
    getAllFolders,
    getFolderById,
    createFolder,
    updateFolder,
    deleteFolder
};
