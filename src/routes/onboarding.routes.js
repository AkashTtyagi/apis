/**
 * Onboarding Routes
 * Single API endpoint to onboard both company and user together
 */

const express = require('express');
const router = express.Router();

const onboardingController = require('../controllers/onboarding.controller');
const {
  validateOnboarding,
  handleValidationErrors
} = require('../middlewares/validators/onboarding.validator');

/**
 * POST /api/onboarding
 * Onboard company and user in a single transaction
 * Creates company first, then creates user with the company_id
 * Includes validation middleware
 */
router.post(
  '/',
  validateOnboarding,
  handleValidationErrors,
  onboardingController.onboardCompanyAndUser
);

module.exports = router;
