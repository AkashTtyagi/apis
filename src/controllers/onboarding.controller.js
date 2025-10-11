/**
 * Onboarding Controller
 * Handles combined company and user onboarding in a single API call
 */

const onboardingService = require('../services/onboarding.service');

/**
 * Onboard company and user together
 * POST /api/onboarding
 * Creates company first, then creates user with company_id in a single transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const onboardCompanyAndUser = async (req, res, next) => {
    try {
        const {
            org_name,
            country_id,
            first_name,
            middle_name,
            last_name,
            email,
            org_industry,
            phone
        } = req.body;

        // Call service to create both company and user
        const result = await onboardingService.onboardCompanyAndUser({
            org_name,
            country_id,
            first_name,
            middle_name,
            last_name,
            org_industry,
            email,
            phone
        });

        // Send success response with both company and user data
        return res.status(201).json({
            success: true,
            message: 'Company and user onboarded successfully',
            data: {
                company: {
                    id: result.company.id,
                    org_name: result.company.org_name,
                    country_id: result.company.country_id,
                    created_at: result.company.created_at
                },
                user: {
                    id: result.user.id,
                    company_id: result.user.company_id,
                    first_name: result.user.first_name,
                    middle_name: result.user.middle_name,
                    last_name: result.user.last_name,
                    email: result.user.email,
                    phone: result.user.phone,
                    created_at: result.user.created_at
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    onboardCompanyAndUser
};
