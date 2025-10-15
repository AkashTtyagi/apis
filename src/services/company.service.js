/**
 * Company Service
 * Handles business logic for company operations
 */

const { HrmsCompany } = require('../models/HrmsCompany');
const { HrmsEmployee } = require('../models/HrmsEmployee');

/**
 * Update company details (admin only - post-onboarding updates)
 * @param {number} company_id - Company ID to update
 * @param {Object} updateData - Company details to update
 * @param {number} user_id - User ID making the update
 * @returns {Promise<Object>} Updated company data
 */
const updateCompanyDetails = async (company_id, updateData, user_id) => {
    try {
        // Validate that company exists
        const company = await HrmsCompany.findByPk(company_id);

        if (!company) {
            throw new Error('Company not found');
        }

        // Build update object with only allowed fields
        const allowedFields = [
            'registered_address',
            'pin_code',
            'state_id',
            'city_id',
            'phone_number',
            'fax_number',
            'contact_person_id',
            'timezone_id',
            'currency_id',
            'company_profile_path'
        ];

        const updateFields = {};

        // Only include fields that are provided in updateData
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields[field] = updateData[field];
            }
        });

        // If contact_person_id is provided, verify it's a valid employee in the company
        if (updateFields.contact_person_id) {
            const contactPerson = await HrmsEmployee.findOne({
                where: {
                    id: updateFields.contact_person_id,
                    company_id: company_id,
                    is_deleted: 0
                }
            });

            if (!contactPerson) {
                throw new Error('Contact person must be a valid employee from the same company');
            }
        }

        // Add updated_by
        updateFields.updated_by = user_id;

        // Update company
        await HrmsCompany.update(updateFields, {
            where: { id: company_id }
        });

        // Fetch and return updated company data
        const updatedCompany = await HrmsCompany.findByPk(company_id, {
            attributes: [
                'id',
                'org_name',
                'country_id',
                'currency_id',
                'org_industry',
                'registered_address',
                'pin_code',
                'state_id',
                'city_id',
                'phone_number',
                'fax_number',
                'contact_person_id',
                'timezone_id',
                'company_profile_path',
                'is_parent_company',
                'parent_enterprise_id',
                'created_at',
                'updated_at'
            ]
        });

        return updatedCompany;
    } catch (error) {
        console.error('Service - Update company details error:', error.message);
        throw error;
    }
};

/**
 * Get company details by ID
 * @param {number} company_id - Company ID
 * @returns {Promise<Object>} Company data
 */
const getCompanyDetails = async (company_id) => {
    try {
        const company = await HrmsCompany.findByPk(company_id, {
            attributes: [
                'id',
                'org_name',
                'country_id',
                'currency_id',
                'org_industry',
                'registered_address',
                'pin_code',
                'state_id',
                'city_id',
                'phone_number',
                'fax_number',
                'contact_person_id',
                'timezone_id',
                'company_profile_path',
                'is_parent_company',
                'parent_enterprise_id',
                'created_at',
                'updated_at'
            ]
        });

        if (!company) {
            throw new Error('Company not found');
        }

        return company;
    } catch (error) {
        console.error('Service - Get company details error:', error.message);
        throw error;
    }
};

module.exports = {
    updateCompanyDetails,
    getCompanyDetails
};
