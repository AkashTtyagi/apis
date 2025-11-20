/**
 * Application Controller
 * HTTP handlers for application management
 */

const applicationService = require('../../services/role_permission/application.service');

/**
 * Get all applications
 * POST /api/applications/get-all
 */
const getAllApplications = async (req, res, next) => {
    try {
        const filters = {
            is_active: req.body.is_active
        };

        const applications = await applicationService.getAllApplications(filters);

        res.status(200).json({
            success: true,
            data: applications,
            count: applications.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get application by ID
 * POST /api/applications/get-by-id
 */
const getApplicationById = async (req, res, next) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Application ID is required'
            });
        }

        const application = await applicationService.getApplicationById(id);

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create application
 * POST /api/applications/create
 */
const createApplication = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const application = await applicationService.createApplication(req.body, userId);

        res.status(201).json({
            success: true,
            message: 'Application created successfully',
            data: application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update application
 * POST /api/applications/update
 */
const updateApplication = async (req, res, next) => {
    try {
        const { id, ...updateData } = req.body;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Application ID is required'
            });
        }

        const application = await applicationService.updateApplication(id, updateData, userId);

        res.status(200).json({
            success: true,
            message: 'Application updated successfully',
            data: application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete application
 * POST /api/applications/delete
 */
const deleteApplication = async (req, res, next) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Application ID is required'
            });
        }

        const result = await applicationService.deleteApplication(id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication
};
