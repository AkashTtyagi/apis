/**
 * Onboarding Validation Middleware
 * Validates both company and user data for combined onboarding
 */

const { body, validationResult } = require('express-validator');

/**
 * Validation rules for combined company and user onboarding
 */
const validateOnboarding = [
  // Company fields
  body('org_name')
    .trim()
    .notEmpty()
    .withMessage('Organization name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Organization name must be between 2 and 255 characters'),

  body('country_id')
    .notEmpty()
    .withMessage('Country ID is required')
    .isInt({ min: 1 })
    .withMessage('Country ID must be a positive integer'),

  // User fields
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('middle_name')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Middle name must not exceed 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Middle name can only contain letters, spaces, hyphens, and apostrophes'),

  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage('Phone number contains invalid characters')
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters')
];

/**
 * Middleware to handle validation results
 * Returns formatted error response if validation fails
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }

  next();
};

module.exports = {
  validateOnboarding,
  handleValidationErrors
};
