/**
 * Employee Routes
 */

const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const userActivationService = require('../services/userActivation.service');
const { sendSuccess } = require('../utils/response');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get logged-in user details with employee information
router.post('/user_details', employeeController.getLoggedInUserDetails);

// Create employee
router.post('/', employeeController.createEmployee);

// Update employee
router.put('/:id', employeeController.updateEmployee);

// Get employees by company (must come before /:id to avoid route conflict)
router.post('/company', employeeController.getEmployeesByCompany);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Activate user and send login credentials
router.post('/activate/:user_id', async (req, res, next) => {
    try {
        const user_id = parseInt(req.params.user_id);
        const result = await userActivationService.activateUser(user_id);
        return sendSuccess(res, result.message, { email: result.email });
    } catch (error) {
        next(error);
    }
});

// Resend activation email
router.post('/resend-activation/:user_id', async (req, res, next) => {
    try {
        const user_id = parseInt(req.params.user_id);
        const result = await userActivationService.resendActivationEmail(user_id);
        return sendSuccess(res, result.message, { email: result.email });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
