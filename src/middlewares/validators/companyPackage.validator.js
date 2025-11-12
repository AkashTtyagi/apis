/**
 * Company Package Validation Middleware
 * Validates company package related requests using express-validator
 */

const { body, validationResult } = require('express-validator');

/**
 * Validation rules for assigning package to company
 * POST /api/package/company-packages/assign
 */
const validateAssignPackage = [
    body('company_id')
        .notEmpty()
        .withMessage('company_id is required')
        .isInt({ min: 1 })
        .withMessage('company_id must be a positive integer'),

    body('package_id')
        .notEmpty()
        .withMessage('package_id is required')
        .isInt({ min: 1 })
        .withMessage('package_id must be a positive integer'),

    body('start_date')
        .notEmpty()
        .withMessage('start_date is required')
        .isDate({ format: 'YYYY-MM-DD', strictMode: true })
        .withMessage('start_date must be a valid date in YYYY-MM-DD format'),

    body('end_date')
        .optional({ nullable: true })
        .isDate({ format: 'YYYY-MM-DD', strictMode: true })
        .withMessage('end_date must be a valid date in YYYY-MM-DD format')
        .custom((value, { req }) => {
            if (value && req.body.start_date) {
                const startDate = new Date(req.body.start_date);
                const endDate = new Date(value);
                if (endDate <= startDate) {
                    throw new Error('end_date must be after start_date');
                }
            }
            return true;
        })
];

/**
 * Validation rules for getting company package
 * POST /api/package/company-packages/get-active
 * POST /api/package/company-packages/get-history
 * POST /api/package/company-packages/get-modules
 * POST /api/package/company-packages/get-addons
 */
const validateCompanyId = [
    body('company_id')
        .notEmpty()
        .withMessage('company_id is required')
        .isInt({ min: 1 })
        .withMessage('company_id must be a positive integer')
];

/**
 * Validation rules for updating company package
 * POST /api/package/company-packages/update
 */
const validateUpdatePackage = [
    body('company_id')
        .notEmpty()
        .withMessage('company_id is required')
        .isInt({ min: 1 })
        .withMessage('company_id must be a positive integer'),

    body('end_date')
        .optional({ nullable: true })
        .isDate({ format: 'YYYY-MM-DD', strictMode: true })
        .withMessage('end_date must be a valid date in YYYY-MM-DD format'),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean')
];

/**
 * Validation rules for checking module access
 * POST /api/package/company-packages/check-module-access
 */
const validateModuleAccess = [
    body('company_id')
        .notEmpty()
        .withMessage('company_id is required')
        .isInt({ min: 1 })
        .withMessage('company_id must be a positive integer'),

    body('module_id')
        .notEmpty()
        .withMessage('module_id is required')
        .isInt({ min: 1 })
        .withMessage('module_id must be a positive integer')
];

/**
 * Validation rules for adding addon module
 * POST /api/package/company-packages/add-addon
 */
const validateAddAddon = [
    body('company_id')
        .notEmpty()
        .withMessage('company_id is required')
        .isInt({ min: 1 })
        .withMessage('company_id must be a positive integer'),

    body('module_id')
        .notEmpty()
        .withMessage('module_id is required')
        .isInt({ min: 1 })
        .withMessage('module_id must be a positive integer')
];

/**
 * Validation rules for removing addon module
 * POST /api/package/company-packages/remove-addon
 */
const validateRemoveAddon = [
    body('company_id')
        .notEmpty()
        .withMessage('company_id is required')
        .isInt({ min: 1 })
        .withMessage('company_id must be a positive integer'),

    body('module_id')
        .notEmpty()
        .withMessage('module_id is required')
        .isInt({ min: 1 })
        .withMessage('module_id must be a positive integer')
];

/**
 * Handle validation errors
 * This middleware should be called after validation rules
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            timestamp: new Date().toISOString(),
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }))
        });
    }

    next();
};

module.exports = {
    validateAssignPackage,
    validateCompanyId,
    validateUpdatePackage,
    validateModuleAccess,
    validateAddAddon,
    validateRemoveAddon,
    handleValidationErrors
};
