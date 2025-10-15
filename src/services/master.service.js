/**
 * Master Data Service
 * Provides a unified API to fetch master data for master_select fields
 * Supports dynamic master table queries based on master_slug
 */

const { HrmsCompanyDepartments: HrmsCompanyDepartment } = require('../models/HrmsCompanyDepartments');
const { HrmsSubDepartment: HrmsCompanySubDepartment } = require('../models/HrmsSubDepartment');
const { HrmsGrade } = require('../models/HrmsGrade');
const { HrmsCompanyDesignation } = require('../models/HrmsCompanyDesignation');
const { HrmsLevel } = require('../models/HrmsLevel');
const { HrmsCompanySkills } = require('../models/HrmsCompanySkills');
const { HrmsLeaveMaster } = require('../models/HrmsLeaveMaster');
const { HrmsLeavePolicyMaster } = require('../models/HrmsLeavePolicyMaster');
const { HrmsShiftMaster } = require('../models/HrmsShiftMaster');
const { HrmsCountryMaster } = require('../models/HrmsCountryMaster');
const { HrmsStateMaster } = require('../models/HrmsStateMaster');
const { HrmsCityMaster } = require('../models/HrmsCityMaster');
const { HrmsTimezoneMaster } = require('../models/HrmsTimezoneMaster');

/**
 * Master table configuration
 * Maps master_slug to table details and query structure
 */
const MASTER_CONFIG = {
    // Timezone Master (NOT company scoped)
    timezone: {
        model: HrmsTimezoneMaster,
        table: 'hrms_timezone_master',
        fields: {
            id: 'id',
            code: null,
            name: 'display_name'
        },
        companyScoped: false,
        additionalFields: ['timezone_name', 'timezone_offset', 'timezone_offset_minutes', 'country_code', 'timezone_abbr'],
        orderBy: [['timezone_offset_minutes', 'ASC']]
    },

    // Geographic Masters (NOT company scoped)
    country: {
        model: HrmsCountryMaster,
        table: 'hrms_country_master',
        fields: {
            id: 'id',
            code: 'country_code',
            name: 'country_name'
        },
        companyScoped: false,
        additionalFields: ['iso_code_2', 'iso_code_3', 'phone_code', 'currency_code', 'currency_symbol'],
        orderBy: [['display_order', 'ASC'], ['country_name', 'ASC']]
    },
    state: {
        model: HrmsStateMaster,
        table: 'hrms_state_master',
        fields: {
            id: 'id',
            code: 'state_code',
            name: 'state_name'
        },
        companyScoped: false,
        additionalFields: ['country_id'],
        orderBy: [['display_order', 'ASC'], ['state_name', 'ASC']]
    },
    city: {
        model: HrmsCityMaster,
        table: 'hrms_city_master',
        fields: {
            id: 'id',
            code: null, // Cities don't have a code field
            name: 'city_name'
        },
        companyScoped: false,
        additionalFields: ['state_id', 'country_id'],
        orderBy: [['display_order', 'ASC'], ['city_name', 'ASC']]
    },

    // Company-scoped Masters
    department: {
        model: HrmsCompanyDepartment,
        table: 'hrms_company_departments',
        fields: {
            id: 'id',
            code: 'department_code',
            name: 'department_name'
        },
        companyScoped: true
    },
    sub_department: {
        model: HrmsCompanySubDepartment,
        table: 'hrms_company_sub_departments',
        fields: {
            id: 'id',
            code: 'sub_department_code',
            name: 'sub_department_name'
        },
        companyScoped: true,
        additionalFields: ['department_id']
    },
    grade: {
        model: HrmsGrade,
        table: 'hrms_grades',
        fields: {
            id: 'id',
            code: 'grade_code',
            name: 'grade_name'
        },
        companyScoped: true,
        additionalFields: ['level', 'description']
    },
    designation: {
        model: HrmsCompanyDesignation,
        table: 'hrms_company_designations',
        fields: {
            id: 'id',
            code: 'designation_code',
            name: 'designation_name'
        },
        companyScoped: true,
        additionalFields: ['grade_id', 'skill_id', 'job_description']
    },
    level: {
        model: HrmsLevel,
        table: 'hrms_levels',
        fields: {
            id: 'id',
            code: 'level_code',
            name: 'level_name'
        },
        companyScoped: true,
        additionalFields: ['hierarchy_order', 'description'],
        orderBy: [['hierarchy_order', 'ASC'], ['level_name', 'ASC']]
    },
    skill: {
        model: HrmsCompanySkills,
        table: 'hrms_company_skills',
        fields: {
            id: 'id',
            code: 'skill_code',
            name: 'skill_name'
        },
        companyScoped: true,
        additionalFields: ['skill_category', 'description']
    },
    leave_type: {
        model: HrmsLeaveMaster,
        table: 'hrms_leave_master',
        fields: {
            id: 'id',
            code: 'leave_code',
            name: 'leave_name'
        },
        companyScoped: true,
        additionalFields: ['leave_type', 'description']
    },
    leave_policy: {
        model: HrmsLeavePolicyMaster,
        table: 'hrms_leave_policy_master',
        fields: {
            id: 'id',
            code: null,
            name: 'policy_name'
        },
        companyScoped: true,
        additionalFields: ['policy_description']
    },
    shift: {
        model: HrmsShiftMaster,
        table: 'hrms_shift_master',
        fields: {
            id: 'id',
            code: 'shift_code',
            name: 'shift_name'
        },
        companyScoped: true,
        additionalFields: ['shift_colour', 'description', 'shift_start_time', 'shift_end_time', 'is_night_shift']
    }
};

/**
 * Get master data for a specific master_slug
 * @param {string} masterSlug - Master table identifier
 * @param {number} companyId - Company ID for scoped masters
 * @param {Object} filters - Additional filters
 * @returns {Array} List of master records
 */
const getMasterDataBySlug = async (masterSlug, companyId = null, filters = {}) => {
    // Get master configuration
    const config = MASTER_CONFIG[masterSlug];

    if (!config) {
        throw new Error(`Invalid master_slug: ${masterSlug}. Supported values: ${Object.keys(MASTER_CONFIG).join(', ')}`);
    }

    // Build where clause
    const whereClause = {
        is_active: true
    };

    // Add company_id filter if master is company-scoped
    if (config.companyScoped && companyId) {
        whereClause.company_id = companyId;
    }

    // Add additional filters (e.g., department_id for sub_department, country_id for state)
    if (filters && Object.keys(filters).length > 0) {
        Object.assign(whereClause, filters);
    }

    // Build select fields using Sequelize array format [field, alias]
    const selectFields = [[config.fields.id, 'id']];

    // Add code field if it exists
    if (config.fields.code) {
        selectFields.push([config.fields.code, 'code']);
    }

    selectFields.push([config.fields.name, 'name']);

    // Add additional fields if specified
    if (config.additionalFields && config.additionalFields.length > 0) {
        config.additionalFields.forEach(field => {
            selectFields.push(field);
        });
    }

    // Determine order
    const orderBy = config.orderBy || [[config.fields.name, 'ASC']];

    // Execute query using Sequelize model
    const records = await config.model.findAll({
        attributes: selectFields,
        where: whereClause,
        order: orderBy,
        raw: true
    });

    return records;
};

/**
 * Get master data - returns all masters if master_slug not provided, otherwise specific master
 * @param {string|null} masterSlug - Master table identifier (optional - if not provided, returns all)
 * @param {number} companyId - Company ID for scoped masters
 * @param {Object} filters - Additional filters
 * @returns {Object|Array} Object with all masters or Array with specific master data
 */
const getMasterData = async (masterSlug = null, companyId = null, filters = {}) => {
    // If master_slug not provided, return all masters
    if (!masterSlug) {
        const allMasters = {};

        for (const slug of Object.keys(MASTER_CONFIG)) {
            try {
                allMasters[slug] = await getMasterDataBySlug(slug, companyId, filters);
            } catch (error) {
                console.error(`Error fetching master data for ${slug}:`, error.message);
                allMasters[slug] = [];
            }
        }

        return allMasters;
    }

    // If master_slug provided, return specific master data
    return await getMasterDataBySlug(masterSlug, companyId, filters);
};

/**
 * Get multiple master data in a single request
 * Useful for forms that need multiple dropdowns
 * @param {Array} masterSlugs - Array of master slugs
 * @param {number} companyId - Company ID
 * @returns {Object} Object with master_slug as keys and data as values
 */
const getMultipleMasterData = async (masterSlugs, companyId = null) => {
    const result = {};

    for (const slug of masterSlugs) {
        try {
            result[slug] = await getMasterDataBySlug(slug, companyId);
        } catch (error) {
            console.error(`Error fetching master data for ${slug}:`, error.message);
            result[slug] = [];
        }
    }

    return result;
};

/**
 * Get hierarchical geographic data (country -> state -> city)
 * @returns {Array} Complete hierarchical structure
 */
const getGeographicHierarchy = async () => {
    // Get all countries
    const countries = await getMasterDataBySlug('country');

    const hierarchical = [];

    for (const country of countries) {
        // Get states for this country
        const states = await getMasterDataBySlug('state', null, {
            country_id: country.id
        });

        const statesWithCities = [];

        for (const state of states) {
            // Get cities for this state
            const cities = await getMasterDataBySlug('city', null, {
                state_id: state.id
            });

            statesWithCities.push({
                ...state,
                cities: cities
            });
        }

        hierarchical.push({
            ...country,
            states: statesWithCities
        });
    }

    return hierarchical;
};

/**
 * Get hierarchical master data (e.g., department -> sub_department)
 * @param {string} parentSlug - Parent master slug
 * @param {string} childSlug - Child master slug
 * @param {number} companyId - Company ID (for company-scoped masters)
 * @returns {Array} Hierarchical data structure
 */
const getHierarchicalMasterData = async (parentSlug, childSlug, companyId = null) => {
    const parentData = await getMasterDataBySlug(parentSlug, companyId);

    const hierarchical = [];

    for (const parent of parentData) {
        const children = await getMasterDataBySlug(childSlug, companyId, {
            [`${parentSlug}_id`]: parent.id
        });

        hierarchical.push({
            ...parent,
            children: children
        });
    }

    return hierarchical;
};

module.exports = {
    getMasterData,
    getMultipleMasterData,
    getGeographicHierarchy,
    getHierarchicalMasterData,
    MASTER_CONFIG
};
