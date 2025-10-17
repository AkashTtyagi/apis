/**
 * Master Data Controller
 * Handles HTTP requests for master data operations
 * Provides unified endpoint for all master_select dropdowns
 */

const masterService = require('../services/master.service');
const { sendSuccess } = require('../utils/response');

/**
 * Get master data for dropdowns
 * POST /api/master/data
 *
 * Request body examples:
 * 1. Get all masters: {}
 * 2. Get specific master: { master_type: "country" }
 * 3. Get master with filters: { master_type: "state", filters: { country_id: 101 } }
 * 4. Get master with search: { master_type: "employee", search: "john" }
 * 5. Get master with filters and search: { master_type: "employee", filters: { department_id: 3 }, search: "doe" }
 */
const getMasterData = async (req, res, next) => {
    try {
        const { master_type, filters, search } = req.body;
        const company_id = req.user.company_id; // Get from authenticated user

        // If master_type not provided, return all masters
        const result = await masterService.getMasterData(
            master_type || null,
            company_id || null,
            filters || {},
            search || null
        );

        const message = master_type
            ? `${master_type} data retrieved successfully`
            : 'All master data retrieved successfully';

        // Send data directly without extra nesting
        return sendSuccess(res, message, result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get multiple masters in one request
 * POST /api/master/multiple
 *
 * Request body example:
 * {
 *   master_types: ["country", "state", "city"],
 *   company_id: 1
 * }
 */
const getMultipleMasterData = async (req, res, next) => {
    try {
        const { master_types } = req.body;
        const company_id = req.user.company_id; // Get from authenticated user

        if (!master_types || !Array.isArray(master_types)) {
            throw new Error('master_types must be an array');
        }

        const result = await masterService.getMultipleMasterData(
            master_types,
            company_id || null
        );

        // Send data directly without extra nesting
        return sendSuccess(res, 'Master data retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get hierarchical master data
 * POST /api/master/hierarchical
 *
 * Request body examples:
 * 1. Get country-state-city hierarchy: { type: "geographic" } or {}
 * 2. Get department-subdepartment: { type: "custom", parent_type: "department", child_type: "sub_department", company_id: 1 }
 */
const getHierarchicalMasterData = async (req, res, next) => {
    try {
        const { type, parent_type, child_type } = req.body;
        const company_id = req.user.company_id; // Get from authenticated user

        // Default to geographic hierarchy (country -> state -> city)
        if (!type || type === 'geographic') {
            const result = await masterService.getGeographicHierarchy();
            return sendSuccess(res, 'Geographic hierarchy retrieved successfully', result);
        }

        // Custom hierarchy (e.g., department -> sub_department)
        if (type === 'custom') {
            if (!parent_type || !child_type) {
                throw new Error('parent_type and child_type are required for custom hierarchy');
            }

            const result = await masterService.getHierarchicalMasterData(
                parent_type,
                child_type,
                company_id || null
            );

            return sendSuccess(res, 'Hierarchical master data retrieved successfully', result);
        }

        throw new Error('Invalid type. Use "geographic" or "custom"');
    } catch (error) {
        next(error);
    }
};

/**
 * Get count of all masters
 * POST /api/master/counts
 *
 * Returns count of records for each master table (excluding employee)
 */
const getAllMasterCounts = async (req, res, next) => {
    try {
        const company_id = req.user.company_id; // Get from authenticated user

        const result = await masterService.getAllMasterCounts(company_id || null);

        return sendSuccess(res, 'Master counts retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMasterData,
    getMultipleMasterData,
    getHierarchicalMasterData,
    getAllMasterCounts
};
