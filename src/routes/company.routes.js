/**
 * Company Routes
 * Handles all company-related endpoints
 */

const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * Update company details (Admin only - post-onboarding)
 * POST /api/company/update-company-details
 *
 * Body:
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
 *
 * Note: company_id is automatically taken from authenticated user (req.user.company_id)
 * All fields are optional - only provided fields will be updated
 */
router.post('/update-company-details', companyController.updateCompanyDetails);

/**
 * Get company details
 * POST /api/company/details
 *
 * Note: company_id is automatically taken from authenticated user (req.user.company_id)
 */
router.post('/details', companyController.getCompanyDetails);

/**
 * Create entity (sub-company)
 * POST /api/company/entities/create
 *
 * Body:
 * {
 *   "org_name": "Entity Name",
 *   "country_id": 1,
 *   "currency_id": 1,
 *   "org_industry": 1,
 *   "registered_address": "123 Street",
 *   "pin_code": "110001",
 *   "state_id": 12,
 *   "city_id": 345,
 *   "phone_number": "+91-11-12345678",
 *   "fax_number": "+91-11-12345679",
 *   "timezone_id": 15
 * }
 */
router.post('/entities/create', companyController.createEntity);

/**
 * Get all entities for company
 * POST /api/company/entities/list
 *
 * Body (all optional):
 * {
 *   "country_id": 1,
 *   "state_id": 12,
 *   "city_id": 345,
 *   "search": "search term"
 * }
 */
router.post('/entities/list', companyController.getEntitiesByCompany);

module.exports = router;
