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
 * GET /api/employees/company
 */
const getEmployeesByCompany = async (req, res, next) => {
    try {
        const company_id = req.user.company_id;
        const filters = {
            status: req.query.status,
            department_id: req.query.department_id ? parseInt(req.query.department_id) : undefined,
            designation_id: req.query.designation_id ? parseInt(req.query.designation_id) : undefined,
            entity_id: req.query.entity_id ? parseInt(req.query.entity_id) : undefined,
            is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
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
