/**
 * Application Service
 * Business logic for application management
 */

const { HrmsApplication } = require('../../models/role_permission');

/**
 * Get all applications
 */
const getAllApplications = async (filters = {}) => {
    const where = {};

    if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
    }

    const applications = await HrmsApplication.findAll({
        where,
        order: [['display_order', 'ASC']]
    });

    return applications;
};

/**
 * Get application by ID
 */
const getApplicationById = async (appId) => {
    const application = await HrmsApplication.findByPk(appId);

    if (!application) {
        throw new Error('Application not found');
    }

    return application;
};

/**
 * Create new application
 */
const createApplication = async (appData, userId) => {
    const {
        app_code,
        app_name,
        app_description,
        app_icon,
        app_url,
        display_order
    } = appData;

    // Check if app code already exists
    const existing = await HrmsApplication.findOne({ where: { app_code } });
    if (existing) {
        throw new Error(`Application with code '${app_code}' already exists`);
    }

    const application = await HrmsApplication.create({
        app_code,
        app_name,
        app_description,
        app_icon,
        app_url,
        display_order: display_order || 0,
        is_active: true,
        created_by: userId
    });

    return application;
};

/**
 * Update application
 */
const updateApplication = async (appId, updateData, userId) => {
    const application = await HrmsApplication.findByPk(appId);

    if (!application) {
        throw new Error('Application not found');
    }

    const allowedFields = [
        'app_name',
        'app_description',
        'app_icon',
        'app_url',
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

    await application.update(updateFields);

    return application;
};

/**
 * Delete application
 */
const deleteApplication = async (appId) => {
    const application = await HrmsApplication.findByPk(appId);

    if (!application) {
        throw new Error('Application not found');
    }

    await application.destroy();

    return { message: 'Application deleted successfully' };
};

module.exports = {
    getAllApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication
};
