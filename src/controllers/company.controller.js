/**
 * Company Controller
 * Handles HTTP requests for company operations
 */

const companyService = require('../services/company.service');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Update company details
 * POST /api/company/update-company-details
 *
 * Admin-only endpoint for updating company details after onboarding
 *
 * Request body example:
 * {
 *   "registered_address": "123 Main Street, Building A",
 *   "pin_code": "110001",
 *   "state_id": 12,
 *   "city_id": 345,
 *   "phone_number": "+91-11-12345678",
 *   "fax_number": "+91-11-12345679",
 *   "contact_person_id": 5,
 *   "timezone_id": 15,
 *   "currency_id": 4,
 *   "company_profile_path": "/uploads/company/logo-123.png"
 * }
 */
const updateCompanyDetails = async (req, res, next) => {
    try {
        const company_id = req.user.company_id; // Get from authenticated user
        const user_id = req.user.user_id; // User making the update

        // Extract update data from request body
        const updateData = {
            registered_address: req.body.registered_address,
            pin_code: req.body.pin_code,
            state_id: req.body.state_id,
            city_id: req.body.city_id,
            phone_number: req.body.phone_number,
            fax_number: req.body.fax_number,
            contact_person_id: req.body.contact_person_id,
            timezone_id: req.body.timezone_id,
            currency_id: req.body.currency_id,
            company_profile_path: req.body.company_profile_path
        };

        // Update company details
        const updatedCompany = await companyService.updateCompanyDetails(
            company_id,
            updateData,
            user_id
        );

        return sendSuccess(res, 'Company details updated successfully', {
            company: updatedCompany
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get company details
 * POST /api/company/details
 *
 * Get company details for the authenticated user's company
 */
const getCompanyDetails = async (req, res, next) => {
    try {
        const company_id = req.user.company_id; // Get from authenticated user

        const company = await companyService.getCompanyDetails(company_id);

        return sendSuccess(res, 'Company details retrieved successfully', {
            company
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create entity (sub-company)
 * POST /api/company/entities/create
 */
const createEntity = async (req, res, next) => {
    try {
        const parent_enterprise_id = req.user.company_id;
        const user_id = req.user.id;

        const entityData = {
            parent_enterprise_id,
            org_name: req.body.org_name,
            country_id: req.body.country_id,
            currency_id: req.body.currency_id,
            org_industry: req.body.org_industry,
            registered_address: req.body.registered_address,
            pin_code: req.body.pin_code,
            state_id: req.body.state_id,
            city_id: req.body.city_id,
            phone_number: req.body.phone_number,
            fax_number: req.body.fax_number,
            timezone_id: req.body.timezone_id,
            user_id
        };

        const entity = await companyService.createEntity(entityData);

        return sendCreated(res, 'Entity created successfully', { entity });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all entities for company
 * POST /api/company/entities/list
 */
const getEntitiesByCompany = async (req, res, next) => {
    try {
        const parent_company_id = req.user.company_id;

        const filters = {
            country_id: req.body.country_id,
            state_id: req.body.state_id,
            city_id: req.body.city_id,
            search: req.body.search
        };

        const entities = await companyService.getEntitiesByCompany(parent_company_id, filters);

        return sendSuccess(res, 'Entities retrieved successfully', { entities });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateCompanyDetails,
    getCompanyDetails,
    createEntity,
    getEntitiesByCompany
};
