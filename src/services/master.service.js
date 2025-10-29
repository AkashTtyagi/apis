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
const { HrmsCurrencyMaster } = require('../models/HrmsCurrencyMaster');
const { HrmsEmployee } = require('../models/HrmsEmployee');
const { HrmsEmployeeTypeMaster } = require('../models/HrmsEmployeeTypeMaster');
const { HrmsCostCenterMaster } = require('../models/HrmsCostCenterMaster');
const { HrmsDivisionMaster } = require('../models/HrmsDivisionMaster');
const { HrmsRegionMaster } = require('../models/HrmsRegionMaster');
const { HrmsZoneMaster } = require('../models/HrmsZoneMaster');
const { HrmsBusinessUnitMaster } = require('../models/HrmsBusinessUnitMaster');
const { HrmsChannelMaster } = require('../models/HrmsChannelMaster');
const { HrmsCategoryMaster } = require('../models/HrmsCategoryMaster');
const { HrmsBranchMaster } = require('../models/HrmsBranchMaster');
const { HrmsLocationMaster } = require('../models/HrmsLocationMaster');
const { HrmsCompany } = require('../models/HrmsCompany');
const { Sequelize, Op } = require('sequelize');

/**
 * Master table configuration
 * Maps master_slug to table details and query structure
 */
const { HrmsDepartmentMaster } = require('../models/HrmsDepartmentMaster');
const { HrmsIndustryMaster } = require('../models/HrmsIndustryMaster');

const MASTER_CONFIG = {
    // Entity Master (Company/Organization - NOT company scoped, includes parent company)
    entity: {
        model: HrmsCompany,
        table: 'hrms_companies',
        fields: {
            id: 'id',
            code: null,  // Companies don't have a code field
            name: 'org_name'
        },
        companyScoped: false,
        additionalFields: ['parent_enterprise_id', 'is_parent_company', 'country_id', 'currency_id', 'org_industry', 'is_active'],
        orderBy: [['is_parent_company', 'DESC'], ['org_name', 'ASC']]  // Parent company first, then entities alphabetically
    },

    // Industry Master (NOT company scoped)
    industry: {
        model: HrmsIndustryMaster,
        table: 'hrms_industry_master',
        fields: {
            id: 'industry_id',
            code: 'industry_code',
            name: 'industry_name'
        },
        companyScoped: false,
        additionalFields: ['description'],
        orderBy: [['industry_name', 'ASC']]
    },

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

    // Currency Master (NOT company scoped)
    currency: {
        model: HrmsCurrencyMaster,
        table: 'hrms_currency_master',
        fields: {
            id: 'id',
            code: 'currency_code',
            name: 'currency_name'
        },
        companyScoped: false,
        additionalFields: ['currency_symbol', 'country_name', 'country_code', 'decimal_places', 'display_format'],
        orderBy: [['display_order', 'ASC'], ['currency_name', 'ASC']]
    },

    // Employee Type Master (NOT company scoped)
    employee_type: {
        model: HrmsEmployeeTypeMaster,
        table: 'hrms_employee_type_master',
        fields: {
            id: 'id',
            code: 'type_code',
            name: 'type_name'
        },
        companyScoped: false,
        additionalFields: ['description'],
        orderBy: [['display_order', 'ASC'], ['type_name', 'ASC']]
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
            code: null,  // Will be handled specially
            name: null   // Will be handled specially (company_department_name OR master.department_name)
        },
        companyScoped: true,
        requiresJoin: true,  // Special flag for department join logic
        joinModel: HrmsDepartmentMaster,
        joinAs: 'department'
    },
    sub_department: {
        model: HrmsCompanySubDepartment,
        table: 'hrms_sub_departments',
        fields: {
            id: 'id',
            code: 'sub_department_code',
            name: 'sub_department_name'
        },
        companyScoped: true,
        additionalFields: ['org_dept_id']
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
    },
    employee: {
        model: HrmsEmployee,
        table: 'hrms_employees',
        fields: {
            id: 'id',
            code: 'employee_code',
            name: null  // Will use concatenated name
        },
        companyScoped: true,
        useConcatenatedName: true,  // Special flag for employee
        additionalFields: ['email', 'phone', 'designation_id', 'department_id', 'status'],
        orderBy: [['first_name', 'ASC'], ['last_name', 'ASC']]
    },

    // Organizational Masters (Company scoped)
    cost_center: {
        model: HrmsCostCenterMaster,
        table: 'hrms_cost_center_master',
        fields: {
            id: 'id',
            code: 'cost_center_code',
            name: 'cost_center_name'
        },
        companyScoped: true,
        additionalFields: ['description', 'parent_cost_center_id'],
        orderBy: [['display_order', 'ASC'], ['cost_center_name', 'ASC']]
    },
    division: {
        model: HrmsDivisionMaster,
        table: 'hrms_division_master',
        fields: {
            id: 'id',
            code: 'division_code',
            name: 'division_name'
        },
        companyScoped: true,
        additionalFields: ['description'],
        orderBy: [['display_order', 'ASC'], ['division_name', 'ASC']]
    },
    region: {
        model: HrmsRegionMaster,
        table: 'hrms_region_master',
        fields: {
            id: 'id',
            code: 'region_code',
            name: 'region_name'
        },
        companyScoped: true,
        additionalFields: ['description'],
        orderBy: [['display_order', 'ASC'], ['region_name', 'ASC']]
    },
    zone: {
        model: HrmsZoneMaster,
        table: 'hrms_zone_master',
        fields: {
            id: 'id',
            code: 'zone_code',
            name: 'zone_name'
        },
        companyScoped: true,
        additionalFields: ['description', 'region_id'],
        orderBy: [['display_order', 'ASC'], ['zone_name', 'ASC']]
    },
    business_unit: {
        model: HrmsBusinessUnitMaster,
        table: 'hrms_business_unit_master',
        fields: {
            id: 'id',
            code: 'business_unit_code',
            name: 'business_unit_name'
        },
        companyScoped: true,
        additionalFields: ['description', 'division_id', 'cost_center_id'],
        orderBy: [['display_order', 'ASC'], ['business_unit_name', 'ASC']]
    },
    channel: {
        model: HrmsChannelMaster,
        table: 'hrms_channel_master',
        fields: {
            id: 'id',
            code: 'channel_code',
            name: 'channel_name'
        },
        companyScoped: true,
        additionalFields: ['description', 'channel_type'],
        orderBy: [['display_order', 'ASC'], ['channel_name', 'ASC']]
    },
    category: {
        model: HrmsCategoryMaster,
        table: 'hrms_category_master',
        fields: {
            id: 'id',
            code: 'category_code',
            name: 'category_name'
        },
        companyScoped: true,
        additionalFields: ['description'],
        orderBy: [['display_order', 'ASC'], ['category_name', 'ASC']]
    },
    branch: {
        model: HrmsBranchMaster,
        table: 'hrms_branch_master',
        fields: {
            id: 'id',
            code: 'branch_code',
            name: 'branch_name'
        },
        companyScoped: true,
        additionalFields: ['description', 'branch_type', 'region_id', 'zone_id', 'business_unit_id', 'channel_id', 'cost_center_id', 'address_line1', 'city_id', 'state_id', 'country_id'],
        orderBy: [['display_order', 'ASC'], ['branch_name', 'ASC']]
    },
    location: {
        model: HrmsLocationMaster,
        table: 'hrms_location_master',
        fields: {
            id: 'id',
            code: 'location_code',
            name: 'location_name'
        },
        companyScoped: true,
        additionalFields: ['description', 'location_type', 'branch_id', 'capacity', 'address_line1', 'city_id', 'state_id', 'country_id'],
        orderBy: [['display_order', 'ASC'], ['location_name', 'ASC']]
    }
};

/**
 * Get master data for a specific master_slug
 * @param {string} masterSlug - Master table identifier
 * @param {number} companyId - Company ID for scoped masters
 * @param {Object} filters - Additional filters
 * @param {string} search - Search term for filtering results
 * @returns {Array} List of master records
 */
const getMasterDataBySlug = async (masterSlug, companyId = null, filters = {}, search = null) => {
    // Get master configuration
    const config = MASTER_CONFIG[masterSlug];

    if (!config) {
        throw new Error(`Invalid master_slug: ${masterSlug}. Supported values: ${Object.keys(MASTER_CONFIG).join(', ')}`);
    }

    // Build where clause
    const whereClause = {};

    // For employees, filter by is_deleted instead of is_active
    if (masterSlug === 'employee') {
        whereClause.is_deleted = 0;
    } else {
        whereClause.is_active = true;
    }

    // Add company_id filter if master is company-scoped
    if (config.companyScoped && companyId) {
        whereClause.company_id = companyId;
    }

    // Extract search from filters if passed there, or use search parameter
    const searchTerm = filters.search || search;

    // Remove search from filters to avoid passing it to the query
    if (filters.search) {
        delete filters.search;
    }

    // Add additional filters (e.g., department_id for sub_department, country_id for state)
    if (filters && Object.keys(filters).length > 0) {
        Object.assign(whereClause, filters);
    }

    // Add search functionality for employee
    if (searchTerm && masterSlug === 'employee') {
        whereClause[Op.or] = [
            // Search in employee_code
            {
                employee_code: {
                    [Op.like]: `%${searchTerm}%`
                }
            },
            // Search in first_name
            {
                first_name: {
                    [Op.like]: `%${searchTerm}%`
                }
            },
            // Search in middle_name
            {
                middle_name: {
                    [Op.like]: `%${searchTerm}%`
                }
            },
            // Search in last_name
            {
                last_name: {
                    [Op.like]: `%${searchTerm}%`
                }
            },
            // Search in email
            {
                email: {
                    [Op.like]: `%${searchTerm}%`
                }
            }
        ];
    }

    // Build select fields using Sequelize array format [field, alias]
    const selectFields = [[config.fields.id, 'id']];

    // Add code field if it exists
    if (config.fields.code) {
        selectFields.push([config.fields.code, 'code']);
    }

    // Handle concatenated name for employees
    if (config.useConcatenatedName && masterSlug === 'employee') {
        // Use Sequelize.fn to concatenate first_name, middle_name, last_name
        selectFields.push([
            Sequelize.fn('CONCAT_WS', ' ',
                Sequelize.col('first_name'),
                Sequelize.fn('IFNULL', Sequelize.col('middle_name'), ''),
                Sequelize.col('last_name')
            ),
            'name'
        ]);
    } else if (config.fields.name) {
        selectFields.push([config.fields.name, 'name']);
    }

    // Add additional fields if specified
    if (config.additionalFields && config.additionalFields.length > 0) {
        config.additionalFields.forEach(field => {
            selectFields.push(field);
        });
    }

    // Add is_active field for all masters except employee
    if (masterSlug !== 'employee') {
        selectFields.push('is_active');
    } else {
        // For employee, add is_deleted field
        selectFields.push('is_deleted');
    }

    // Determine order
    const orderBy = config.orderBy || [[config.fields.name, 'ASC']];

    // Special handling for department (requires JOIN with department_master)
    if (masterSlug === 'department') {
        const departments = await config.model.findAll({
            where: whereClause,
            include: [
                {
                    model: config.joinModel,
                    as: config.joinAs,
                    attributes: ['department_name', 'department_code', 'description'],
                    required: false  // LEFT JOIN - custom departments won't have master
                }
            ],
            raw: false,
            nest: true
        });

        // Format response: Use company_department_name if present, else use master name
        return departments.map(dept => {
            const deptObj = dept.toJSON();
            return {
                id: deptObj.id,
                code: deptObj.department?.department_code || null,
                name: deptObj.company_department_name || deptObj.department?.department_name || null,
                is_custom: deptObj.company_department_name ? true : false,
                department_id: deptObj.department_id,
                is_active: deptObj.is_active
            };
        });
    }

    // Execute query using Sequelize model (for all other masters)
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
 * @param {string} search - Search term for filtering results
 * @returns {Object|Array} Object with all masters or Array with specific master data
 */
const getMasterData = async (masterSlug = null, companyId = null, filters = {}, search = null) => {
    // If master_slug not provided, return all masters
    if (!masterSlug) {
        const allMasters = {};

        for (const slug of Object.keys(MASTER_CONFIG)) {
            try {
                allMasters[slug] = await getMasterDataBySlug(slug, companyId, filters, search);
            } catch (error) {
                console.error(`Error fetching master data for ${slug}:`, error.message);
                allMasters[slug] = [];
            }
        }

        return allMasters;
    }

    // If master_slug provided, return specific master data
    return await getMasterDataBySlug(masterSlug, companyId, filters, search);
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

/**
 * Get count of all masters
 * Returns count of records for each master table (excluding employee)
 * @param {number} companyId - Company ID for scoped masters
 * @returns {Object} Object with master_slug as keys and count as values
 */
const getAllMasterCounts = async (companyId = null) => {
    const counts = {};

    for (const [slug, config] of Object.entries(MASTER_CONFIG)) {
        // Skip employee slug
        if (slug === 'employee') {
            continue;
        }

        try {
            // Build where clause
            const whereClause = {
                is_active: true
            };

            // Add company_id filter if master is company-scoped
            if (config.companyScoped && companyId) {
                whereClause.company_id = companyId;
            }

            // Get count
            const count = await config.model.count({
                where: whereClause
            });

            counts[slug] = count;
        } catch (error) {
            console.error(`Error counting ${slug}:`, error.message);
            counts[slug] = 0;
        }
    }

    return counts;
};

module.exports = {
    getMasterData,
    getMultipleMasterData,
    getGeographicHierarchy,
    getHierarchicalMasterData,
    getAllMasterCounts,
    MASTER_CONFIG
};
