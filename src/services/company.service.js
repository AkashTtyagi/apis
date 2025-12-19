/**
 * Company Service
 * Handles business logic for company operations
 */

const { HrmsCompany } = require('../models/HrmsCompany');
const { HrmsEmployee } = require('../models/HrmsEmployee');
const { HrmsCountryMaster } = require('../models/HrmsCountryMaster');
const { HrmsStateMaster } = require('../models/HrmsStateMaster');
const { HrmsCityMaster } = require('../models/HrmsCityMaster');
const { HrmsCurrencyMaster } = require('../models/HrmsCurrencyMaster');
const { HrmsIndustryMaster } = require('../models/HrmsIndustryMaster');
const { HrmsTimezoneMaster } = require('../models/HrmsTimezoneMaster');
const { sequelize } = require('../utils/database');
const templateService = require('./template.service');

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
                // Country
                'country_id',
                [sequelize.literal('`country`.`country_code`'), 'country_code'],
                [sequelize.literal('`country`.`country_name`'), 'country_name'],
                // Currency
                'currency_id',
                [sequelize.literal('`currency`.`currency_code`'), 'currency_code'],
                [sequelize.literal('`currency`.`currency_name`'), 'currency_name'],
                [sequelize.literal('`currency`.`currency_symbol`'), 'currency_symbol'],
                // Industry
                'org_industry',
                [sequelize.literal('`industry`.`industry_name`'), 'industry_name'],
                // Address
                'registered_address',
                'pin_code',
                // State
                'state_id',
                [sequelize.literal('`state`.`state_code`'), 'state_code'],
                [sequelize.literal('`state`.`state_name`'), 'state_name'],
                // City
                'city_id',
                [sequelize.literal('`city`.`city_name`'), 'city_name'],
                // Contact
                'phone_number',
                'fax_number',
                // Contact Person
                'contact_person_id',
                [sequelize.literal('`contactPerson`.`employee_code`'), 'contact_person_code'],
                [sequelize.literal("CONCAT(`contactPerson`.`first_name`, ' ', COALESCE(`contactPerson`.`middle_name`, ''), ' ', `contactPerson`.`last_name`)"), 'contact_person_name'],
                // Timezone
                'timezone_id',
                [sequelize.literal('`timezone`.`timezone_name`'), 'timezone_name'],
                [sequelize.literal('`timezone`.`display_name`'), 'timezone_display_name'],
                // Other
                'company_profile_path',
                'is_parent_company',
                // Parent Company
                'parent_enterprise_id',
                [sequelize.literal('`parentCompany`.`org_name`'), 'parent_company_name'],
                // Timestamps
                'created_at',
                'updated_at'
            ],
            include: [
                {
                    model: HrmsCountryMaster,
                    as: 'country',
                    attributes: [],
                    required: false
                },
                {
                    model: HrmsStateMaster,
                    as: 'state',
                    attributes: [],
                    required: false
                },
                {
                    model: HrmsCityMaster,
                    as: 'city',
                    attributes: [],
                    required: false
                },
                {
                    model: HrmsCurrencyMaster,
                    as: 'currency',
                    attributes: [],
                    required: false
                },
                {
                    model: HrmsIndustryMaster,
                    as: 'industry',
                    attributes: [],
                    required: false
                },
                {
                    model: HrmsTimezoneMaster,
                    as: 'timezone',
                    attributes: [],
                    required: false
                },
                {
                    model: HrmsEmployee,
                    as: 'contactPerson',
                    attributes: [],
                    required: false
                },
                {
                    model: HrmsCompany,
                    as: 'parentCompany',
                    attributes: [],
                    required: false
                }
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

/**
 * Create entity (sub-company with is_parent_company = 0)
 * @param {Object} entityData - Entity data
 * @returns {Promise<Object>} Created entity
 */
const createEntity = async (entityData) => {
    try {
        const {
            parent_enterprise_id,
            org_name,
            country_id,
            currency_id,
            org_industry,
            registered_address,
            pin_code,
            state_id,
            city_id,
            phone_number,
            fax_number,
            timezone_id,
            user_id
        } = entityData;

        // Validate parent company exists
        const parentCompany = await HrmsCompany.findByPk(parent_enterprise_id);
        if (!parentCompany) {
            throw new Error('Parent company not found');
        }

        // Create entity with is_parent_company = 0
        const entity = await HrmsCompany.create({
            parent_enterprise_id,
            org_name,
            is_parent_company: 0, // Always 0 for entities
            country_id,
            currency_id: currency_id || null,
            org_industry: org_industry || null,
            registered_address: registered_address || null,
            pin_code: pin_code || null,
            state_id: state_id || null,
            city_id: city_id || null,
            phone_number: phone_number || null,
            fax_number: fax_number || null,
            timezone_id: timezone_id || null,
            created_by: user_id || null
        });

        // Copy company-level templates to new entity
        try {
            const copyResult = await templateService.copyTemplatesToEntity(
                parent_enterprise_id,
                entity.id,
                country_id,
                user_id
            );
            console.log(`Templates copied to entity ${entity.id}:`, copyResult);
        } catch (templateError) {
            console.error('Error copying templates to new entity:', templateError.message);
            // Don't fail entity creation if template copy fails
        }

        return entity;
    } catch (error) {
        console.error('Service - Create entity error:', error.message);
        throw error;
    }
};

/**
 * Get all entities for a parent company
 * @param {number} parent_company_id - Parent company ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} List of entities
 */
const getEntitiesByCompany = async (parent_company_id, filters = {}) => {
    try {
        const { Op } = require('sequelize');
        const { sequelize } = require('../utils/database');

        const whereClause = {
            parent_enterprise_id: parent_company_id,
            is_parent_company: 0
        };

        if (filters.country_id) {
            whereClause.country_id = filters.country_id;
        }

        if (filters.state_id) {
            whereClause.state_id = filters.state_id;
        }

        if (filters.city_id) {
            whereClause.city_id = filters.city_id;
        }

        if (filters.search) {
            whereClause.org_name = {
                [Op.like]: `%${filters.search}%`
            };
        }

        const entities = await HrmsCompany.findAll({
            where: whereClause,
            attributes: [
                'id',
                'org_name',
                'parent_enterprise_id',
                'is_parent_company',
                'country_id',
                'currency_id',
                'org_industry',
                'registered_address',
                'pin_code',
                'state_id',
                'city_id',
                'phone_number',
                'fax_number',
                'timezone_id',
                'created_at',
                'updated_at',
                'created_by',
                'updated_by',
                // Entity master names from includes
                [sequelize.literal('`country`.`country_name`'), 'country_name'],
                [sequelize.literal('`state`.`state_name`'), 'state_name'],
                [sequelize.literal('`city`.`city_name`'), 'city_name'],
                [sequelize.literal('`currency`.`currency_name`'), 'currency_name'],
                [sequelize.literal('`currency`.`currency_symbol`'), 'currency_symbol'],
                [sequelize.literal('`industry`.`industry_name`'), 'industry_name'],
                [sequelize.literal('`timezone`.`timezone_name`'), 'timezone_name']
            ],
            include: [
                {
                    model: HrmsCountryMaster,
                    as: 'country',
                    attributes: [],
                    required: false
                },
                {
                    model: HrmsStateMaster,
                    as: 'state',
                    attributes: [],
                    required: false
                },
                {
                    model: HrmsCityMaster,
                    as: 'city',
                    attributes: [],
                    required: false
                },
                {
                    model: HrmsCurrencyMaster,
                    as: 'currency',
                    attributes: [],
                    required: false
                },
                {
                    model: HrmsIndustryMaster,
                    as: 'industry',
                    attributes: [],
                    required: false
                },
                {
                    model: HrmsTimezoneMaster,
                    as: 'timezone',
                    attributes: [],
                    required: false
                },
                {
                    model: HrmsEmployee,
                    as: 'creatorEmployee',
                    attributes: ['id', 'first_name', 'middle_name', 'last_name', 'email', 'employee_code'],
                    required: false
                },
                {
                    model: HrmsEmployee,
                    as: 'updaterEmployee',
                    attributes: ['id', 'first_name', 'middle_name', 'last_name', 'email', 'employee_code'],
                    required: false
                }
            ],
            order: [['org_name', 'ASC']]
        });

        return entities;
    } catch (error) {
        console.error('Service - Get entities by company error:', error.message);
        throw error;
    }
};

module.exports = {
    updateCompanyDetails,
    getCompanyDetails,
    createEntity,
    getEntitiesByCompany
};
