/**
 * Employee Controller
 * Handles HTTP requests for employee operations
 */

const employeeService = require('../services/employee.service');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Create new employee
 * POST /api/employees
 */
const createEmployee = async (req, res, next) => {
    try {
        const { directFields, templateFields, template_id } = req.body;
        const user_id = req.user.id;
        const company_id = req.user.company_id;

        const result = await employeeService.createEmployee({
            directFields,
            templateFields,
            template_id,
            user_id,
            company_id
        });

        return sendCreated(res, 'Employee created successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Update employee
 * PUT /api/employees/:id
 */
const updateEmployee = async (req, res, next) => {
    try {
        const employee_id = parseInt(req.params.id);
        const { directFields, templateFields, template_id } = req.body;
        const user_id = req.user.id;
        const company_id = req.user.company_id;

        const result = await employeeService.updateEmployee(employee_id, {
            directFields,
            templateFields,
            template_id,
            user_id,
            company_id
        });

        return sendSuccess(res, 'Employee updated successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get employee by ID
 * GET /api/employees/:id
 */
const getEmployeeById = async (req, res, next) => {
    try {
        const employee_id = parseInt(req.params.id);
        const company_id = req.user.company_id;
        const includeTemplateFields = req.query.includeTemplateFields !== 'false';

        // Validate employee_id
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: 'employee_id is required'
            });
        }

        if (isNaN(employee_id) || employee_id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'employee_id must be a valid positive number'
            });
        }

        const result = await employeeService.getEmployeeById(employee_id, company_id, includeTemplateFields);

        return sendSuccess(res, 'Employee retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all employees for a company
 * POST /api/employees/company
 */
const getEmployeesByCompany = async (req, res, next) => {
    try {
        const company_id = req.user.company_id;

        // Get filters from request body (POST) instead of query params
        // All filters support both single value and array
        const filters = {
            // status can be single value (0) or array ([0, 1, 3])
            status: req.body.status !== undefined
                ? (Array.isArray(req.body.status)
                    ? req.body.status.map(s => parseInt(s))  // Array: [0, 1, 3]
                    : parseInt(req.body.status))              // Single: 0
                : undefined,

            // department_id can be single value (5) or array ([5, 6, 7])
            department_id: req.body.department_id
                ? (Array.isArray(req.body.department_id)
                    ? req.body.department_id.map(d => parseInt(d))  // Array: [5, 6, 7]
                    : parseInt(req.body.department_id))              // Single: 5
                : undefined,

            // designation_id can be single value (10) or array ([10, 11, 12])
            designation_id: req.body.designation_id
                ? (Array.isArray(req.body.designation_id)
                    ? req.body.designation_id.map(d => parseInt(d))  // Array: [10, 11, 12]
                    : parseInt(req.body.designation_id))              // Single: 10
                : undefined,

            // entity_id can be single value (25) or array ([25, 26, 27])
            entity_id: req.body.entity_id
                ? (Array.isArray(req.body.entity_id)
                    ? req.body.entity_id.map(e => parseInt(e))  // Array: [25, 26, 27]
                    : parseInt(req.body.entity_id))              // Single: 25
                : undefined
        };

        const employees = await employeeService.getEmployeesByCompany(company_id, filters);

        return sendSuccess(res, 'Employees retrieved successfully', { employees });
    } catch (error) {
        next(error);
    }
};

/**
 * Get logged-in user details with employee information
 * POST /api/employees/user_details
 */
const getLoggedInUserDetails = async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const result = await employeeService.getLoggedInUserDetails(user_id);

        return sendSuccess(res, 'User details retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEmployee,
    updateEmployee,
    getEmployeeById,
    getEmployeesByCompany,
    getLoggedInUserDetails
};
