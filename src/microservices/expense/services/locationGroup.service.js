/**
 * Location Group Service
 * Business logic for expense location group management
 */

const { ExpenseLocationGroup, ExpenseLocationGroupMapping, ExpenseCategoryLimit } = require('../../../models/expense');
const { HrmsCountryMaster } = require('../../../models/HrmsCountryMaster');
const { HrmsStateMaster } = require('../../../models/HrmsStateMaster');
const { HrmsCityMaster } = require('../../../models/HrmsCityMaster');
const { HrmsEmployee } = require('../../../models/HrmsEmployee');
const { sequelize } = require('../../../utils/database');
const { Op, literal, fn, col } = require('sequelize');

/**
 * Generate next sequential code with transaction lock
 * @param {number} companyId - Company ID
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<string>} Generated code
 */
const generateSequentialCode = async (companyId, transaction) => {
    // Lock rows to prevent race condition - find highest LG code
    const [results] = await sequelize.query(
        `SELECT group_code FROM expense_location_groups
         WHERE company_id = :companyId AND group_code LIKE 'LG%'
         ORDER BY CAST(SUBSTRING(group_code, 3) AS UNSIGNED) DESC
         LIMIT 1 FOR UPDATE`,
        {
            replacements: { companyId },
            transaction
        }
    );

    let nextNumber = 1;

    if (results && results.length > 0 && results[0].group_code) {
        const match = results[0].group_code.match(/^LG(\d+)$/);
        if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
        }
    }

    return `LG${String(nextNumber).padStart(3, '0')}`;
};

/**
 * Create a new location group with location mappings
 * @param {Object} data - Location group data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is creating
 * @returns {Promise<Object>} Created location group
 */
const createLocationGroup = async (data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            group_name,
            group_code,
            group_description,
            cost_of_living_index,
            is_active,
            locations,
            // Support alternative format: country_ids, state_ids, city_ids arrays
            country_ids,
            state_ids,
            city_ids,
            postal_code_range
        } = data;

        // Validate required fields
        if (!group_name || group_name.trim() === '') {
            throw new Error('Group name is required');
        }

        if (group_name.length > 100) {
            throw new Error('Group name must be 100 characters or less');
        }

        // Determine the final code to use
        let finalCode;

        if (group_code && group_code.trim() !== '') {
            if (group_code.length > 50) {
                throw new Error('Group code must be 50 characters or less');
            }

            // Check for duplicate group_code within the company
            const existingGroup = await ExpenseLocationGroup.findOne({
                where: {
                    company_id: companyId,
                    group_code: group_code.trim().toUpperCase(),
                    deleted_at: null
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (existingGroup) {
                // Code already taken, generate new sequential code
                finalCode = await generateSequentialCode(companyId, transaction);
            } else {
                finalCode = group_code.trim().toUpperCase();
            }
        } else {
            // No code provided, generate sequential code
            finalCode = await generateSequentialCode(companyId, transaction);
        }

        // Create location group
        const locationGroup = await ExpenseLocationGroup.create({
            company_id: companyId,
            group_name: group_name.trim(),
            group_code: finalCode,
            group_description: group_description || null,
            cost_of_living_index: cost_of_living_index || 'Medium',
            is_active: is_active !== false ? 1 : 0,
            created_by: userId
        }, { transaction });

        // Build locations array from different input formats
        let locationsToSave = locations;

        // Convert country_ids/state_ids/city_ids format to locations array
        // Check if locations is not provided or is empty array
        const hasLocations = locationsToSave && Array.isArray(locationsToSave) && locationsToSave.length > 0;
        const hasIdArrays = (country_ids && country_ids.length > 0) || (state_ids && state_ids.length > 0) || (city_ids && city_ids.length > 0);

        if (!hasLocations && hasIdArrays) {
            locationsToSave = [];

            const countryArr = Array.isArray(country_ids) ? country_ids : (country_ids ? [country_ids] : []);
            const stateArr = Array.isArray(state_ids) ? state_ids : (state_ids ? [state_ids] : []);
            const cityArr = Array.isArray(city_ids) ? city_ids : (city_ids ? [city_ids] : []);

            const maxLen = Math.max(countryArr.length, stateArr.length, cityArr.length);

            for (let i = 0; i < maxLen; i++) {
                locationsToSave.push({
                    country_id: countryArr[i] || countryArr[0] || null,
                    state_id: stateArr[i] || null,
                    city_id: cityArr[i] || null,
                    postal_code_range: i === 0 ? postal_code_range : null
                });
            }
        }

        // Create location mappings if provided
        let locationsCount = 0;
        if (locationsToSave && Array.isArray(locationsToSave) && locationsToSave.length > 0) {
            for (const location of locationsToSave) {
                await ExpenseLocationGroupMapping.create({
                    location_group_id: locationGroup.id,
                    country_id: location.country_id || null,
                    state_id: location.state_id || null,
                    city_id: location.city_id || null,
                    postal_code_range: location.postal_code_range || null,
                    created_by: userId
                }, { transaction });
                locationsCount++;
            }
        }

        await transaction.commit();

        return {
            id: locationGroup.id,
            group_name: locationGroup.group_name,
            group_code: locationGroup.group_code,
            group_description: locationGroup.group_description,
            cost_of_living_index: locationGroup.cost_of_living_index,
            is_active: locationGroup.is_active === 1,
            locations_count: locationsCount,
            created_at: locationGroup.created_at
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get all location groups with filters and pagination
 * @param {Object} filters - Filter options
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Location groups with pagination
 */
const getAllLocationGroups = async (filters, companyId) => {
    const {
        is_active,
        search,
        cost_of_living_index,
        limit = 50,
        offset = 0,
        sort_by = 'created_at',
        sort_order = 'desc'
    } = filters;

    const where = {
        company_id: companyId,
        deleted_at: null
    };

    // Filter by active status
    if (is_active !== undefined) {
        where.is_active = is_active ? 1 : 0;
    }

    // Filter by cost of living index
    if (cost_of_living_index) {
        where.cost_of_living_index = cost_of_living_index;
    }

    // Search by name or code
    if (search && search.trim()) {
        where[Op.or] = [
            { group_name: { [Op.like]: `%${search.trim()}%` } },
            { group_code: { [Op.like]: `%${search.trim()}%` } }
        ];
    }

    // Validate sort_by field
    const validSortFields = ['group_name', 'group_code', 'cost_of_living_index', 'created_at', 'updated_at'];
    const orderField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const orderDirection = sort_order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const total = await ExpenseLocationGroup.count({ where });

    // Get location groups with counts
    const locationGroups = await ExpenseLocationGroup.findAll({
        where,
        include: [
            {
                model: ExpenseLocationGroupMapping,
                as: 'locations',
                attributes: ['id']
            }
        ],
        order: [[orderField, orderDirection]],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    // Format response
    const data = locationGroups.map(group => ({
        id: group.id,
        group_name: group.group_name,
        group_code: group.group_code,
        group_description: group.group_description,
        cost_of_living_index: group.cost_of_living_index,
        is_active: group.is_active === 1,
        locations_count: group.locations ? group.locations.length : 0,
        created_at: group.created_at,
        created_by: group.created_by
    }));

    return {
        data,
        pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            total_pages: Math.ceil(total / parseInt(limit)),
            current_page: Math.floor(parseInt(offset) / parseInt(limit)) + 1
        }
    };
};

/**
 * Get location group details by ID
 * @param {number} locationGroupId - Location group ID
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Location group details
 */
const getLocationGroupDetails = async (locationGroupId, companyId) => {
    if (!locationGroupId) {
        throw new Error('Location group ID is required');
    }

    const locationGroup = await ExpenseLocationGroup.findOne({
        where: {
            id: locationGroupId,
            company_id: companyId,
            deleted_at: null
        },
        include: [
            {
                model: ExpenseLocationGroupMapping,
                as: 'locations',
                include: [
                    {
                        model: HrmsCountryMaster,
                        as: 'country',
                        attributes: ['id', 'country_name', 'country_code']
                    },
                    {
                        model: HrmsStateMaster,
                        as: 'state',
                        attributes: ['id', 'state_name']
                    },
                    {
                        model: HrmsCityMaster,
                        as: 'city',
                        attributes: ['id', 'city_name']
                    }
                ]
            },
            {
                model: HrmsEmployee,
                as: 'createdByEmployee',
                attributes: [
                    'id',
                    'employee_code',
                    [fn('CONCAT_WS', ' ', col('createdByEmployee.first_name'), col('createdByEmployee.middle_name'), col('createdByEmployee.last_name')), 'name']
                ],
                required: false
            },
            {
                model: HrmsEmployee,
                as: 'updatedByEmployee',
                attributes: [
                    'id',
                    'employee_code',
                    [fn('CONCAT_WS', ' ', col('updatedByEmployee.first_name'), col('updatedByEmployee.middle_name'), col('updatedByEmployee.last_name')), 'name']
                ],
                required: false
            }
        ]
    });

    if (!locationGroup) {
        throw new Error('Location group not found');
    }

    // Format locations
    const locations = (locationGroup.locations || []).map(loc => ({
        id: loc.id,
        country_id: loc.country_id,
        country_name: loc.country?.country_name || null,
        state_id: loc.state_id,
        state_name: loc.state?.state_name || null,
        city_id: loc.city_id,
        city_name: loc.city?.city_name || null,
        postal_code_range: loc.postal_code_range
    }));

    // Format created_by
    const createdBy = locationGroup.createdByEmployee ? {
        id: locationGroup.createdByEmployee.id,
        code: locationGroup.createdByEmployee.employee_code,
        name: locationGroup.createdByEmployee.get('name')
    } : null;

    // Format updated_by
    const updatedBy = locationGroup.updatedByEmployee ? {
        id: locationGroup.updatedByEmployee.id,
        code: locationGroup.updatedByEmployee.employee_code,
        name: locationGroup.updatedByEmployee.get('name')
    } : null;

    return {
        id: locationGroup.id,
        group_name: locationGroup.group_name,
        group_code: locationGroup.group_code,
        group_description: locationGroup.group_description,
        cost_of_living_index: locationGroup.cost_of_living_index,
        is_active: locationGroup.is_active === 1,
        locations,
        created_by: createdBy,
        created_at: locationGroup.created_at,
        updated_by: updatedBy,
        updated_at: locationGroup.updated_at
    };
};

/**
 * Update location group
 * @param {Object} data - Update data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is updating
 * @returns {Promise<Object>} Updated location group
 */
const updateLocationGroup = async (data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            id,
            group_name,
            group_description,
            cost_of_living_index,
            is_active,
            locations,
            // Support alternative format: country_ids, state_ids, city_ids arrays
            country_ids,
            state_ids,
            city_ids,
            postal_code_range
        } = data;

        if (!id) {
            throw new Error('Location group ID is required');
        }

        // Find existing location group
        const locationGroup = await ExpenseLocationGroup.findOne({
            where: {
                id: id,
                company_id: companyId,
                deleted_at: null
            },
            transaction
        });

        if (!locationGroup) {
            throw new Error('Location group not found');
        }

        // Validate group_name if provided
        if (group_name !== undefined) {
            if (!group_name || group_name.trim() === '') {
                throw new Error('Group name cannot be empty');
            }
            if (group_name.length > 100) {
                throw new Error('Group name must be 100 characters or less');
            }
        }

        // Update location group
        await locationGroup.update({
            group_name: group_name !== undefined ? group_name.trim() : locationGroup.group_name,
            group_description: group_description !== undefined ? group_description : locationGroup.group_description,
            cost_of_living_index: cost_of_living_index || locationGroup.cost_of_living_index,
            is_active: is_active !== undefined ? (is_active ? 1 : 0) : locationGroup.is_active,
            updated_by: userId
        }, { transaction });

        // Build locations array from different input formats
        let locationsToSave = locations;

        // Convert country_ids/state_ids/city_ids format to locations array
        // Check if locations is not provided or is empty array
        const hasLocations = locationsToSave && Array.isArray(locationsToSave) && locationsToSave.length > 0;
        const hasIdArrays = (country_ids && country_ids.length > 0) || (state_ids && state_ids.length > 0) || (city_ids && city_ids.length > 0);

        if (!hasLocations && hasIdArrays) {
            locationsToSave = [];

            // Determine the max length to iterate
            const countryArr = Array.isArray(country_ids) ? country_ids : (country_ids ? [country_ids] : []);
            const stateArr = Array.isArray(state_ids) ? state_ids : (state_ids ? [state_ids] : []);
            const cityArr = Array.isArray(city_ids) ? city_ids : (city_ids ? [city_ids] : []);

            const maxLen = Math.max(countryArr.length, stateArr.length, cityArr.length);

            for (let i = 0; i < maxLen; i++) {
                locationsToSave.push({
                    country_id: countryArr[i] || countryArr[0] || null, // Use first country if not enough
                    state_id: stateArr[i] || null,
                    city_id: cityArr[i] || null,
                    postal_code_range: i === 0 ? postal_code_range : null // Apply postal code to first entry
                });
            }
        }

        // Update locations if provided
        if (locationsToSave !== undefined && Array.isArray(locationsToSave) && locationsToSave.length > 0) {
            // Delete old mappings
            await ExpenseLocationGroupMapping.destroy({
                where: { location_group_id: id },
                transaction
            });

            // Create new mappings
            for (const location of locationsToSave) {
                await ExpenseLocationGroupMapping.create({
                    location_group_id: id,
                    country_id: location.country_id || null,
                    state_id: location.state_id || null,
                    city_id: location.city_id || null,
                    postal_code_range: location.postal_code_range || null,
                    created_by: userId
                }, { transaction });
            }
        }

        await transaction.commit();

        return {
            id: locationGroup.id,
            group_name: locationGroup.group_name,
            updated_at: locationGroup.updated_at
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Delete location group (soft delete)
 * @param {number} locationGroupId - Location group ID
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is deleting
 * @returns {Promise<Object>} Delete result
 */
const deleteLocationGroup = async (locationGroupId, companyId, userId) => {
    if (!locationGroupId) {
        throw new Error('Location group ID is required');
    }

    // Find location group
    const locationGroup = await ExpenseLocationGroup.findOne({
        where: {
            id: locationGroupId,
            company_id: companyId,
            deleted_at: null
        }
    });

    if (!locationGroup) {
        throw new Error('Location group not found');
    }

    // TODO: Check if location group is used in expense categories or policies
    // This will be added when those modules are implemented
    // const usageCount = await checkLocationGroupUsage(locationGroupId);
    // if (usageCount > 0) {
    //     throw new Error('Cannot delete location group as it is being used in expense categories/policies');
    // }

    // Soft delete
    await locationGroup.update({
        deleted_at: new Date(),
        deleted_by: userId,
        is_active: 0
    });

    return { message: 'Location group deleted successfully' };
};

/**
 * Generate a unique location group code
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Generated code
 */
const generateCode = async (companyId) => {
    // Find the highest existing code for this company
    const latestGroup = await ExpenseLocationGroup.findOne({
        where: {
            company_id: companyId,
            group_code: {
                [Op.like]: 'LG%'
            }
        },
        order: [['group_code', 'DESC']]
    });

    let nextNumber = 1;

    if (latestGroup && latestGroup.group_code) {
        // Extract the number from the code (e.g., "LG005" -> 5)
        const match = latestGroup.group_code.match(/^LG(\d+)$/);
        if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
        }
    }

    // Generate code with zero-padded number (e.g., LG001, LG002, etc.)
    const generatedCode = `LG${String(nextNumber).padStart(3, '0')}`;

    return {
        code: generatedCode
    };
};

/**
 * Get location dropdown data (countries, states, cities)
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Dropdown data
 */
const getLocationDropdownData = async (filters = {}) => {
    const { country_id, state_id } = filters;

    // Get all active countries
    const countries = await HrmsCountryMaster.findAll({
        attributes: ['id', 'country_name', 'country_code', 'iso_code_2'],
        where: { is_active: 1 },
        order: [['country_name', 'ASC']]
    });

    // Get states if country_id provided
    let states = [];
    if (country_id) {
        states = await HrmsStateMaster.findAll({
            attributes: ['id', 'state_name', 'country_id'],
            where: {
                country_id: country_id,
                is_active: 1
            },
            order: [['state_name', 'ASC']]
        });
    }

    // Get cities if state_id provided
    let cities = [];
    if (state_id) {
        cities = await HrmsCityMaster.findAll({
            attributes: ['id', 'city_name', 'state_id'],
            where: {
                state_id: state_id,
                is_active: 1
            },
            order: [['city_name', 'ASC']]
        });
    }

    return {
        countries: countries.map(c => ({
            id: c.id,
            name: c.country_name,
            code: c.country_code,
            iso_code: c.iso_code_2
        })),
        states: states.map(s => ({
            id: s.id,
            name: s.state_name,
            country_id: s.country_id
        })),
        cities: cities.map(c => ({
            id: c.id,
            name: c.city_name,
            state_id: c.state_id
        }))
    };
};

/**
 * Check if location group is being used in other modules
 * @param {number} locationGroupId - Location group ID
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Usage details
 */
const checkUsage = async (locationGroupId, companyId) => {
    if (!locationGroupId) {
        throw new Error('Location group ID is required');
    }

    // Check if location group exists
    const locationGroup = await ExpenseLocationGroup.findOne({
        where: {
            id: locationGroupId,
            company_id: companyId,
            deleted_at: null
        },
        attributes: ['id', 'group_name', 'group_code']
    });

    if (!locationGroup) {
        throw new Error('Location group not found');
    }

    // Check usage in ExpenseCategoryLimit
    const categoryLimitCount = await ExpenseCategoryLimit.count({
        where: {
            location_group_id: locationGroupId
        }
    });

    const usages = [];

    if (categoryLimitCount > 0) {
        usages.push({
            module: 'Category Limits',
            count: categoryLimitCount,
            message: `Used in ${categoryLimitCount} category limit(s)`
        });
    }

    const totalUsageCount = categoryLimitCount;
    const isInUse = totalUsageCount > 0;

    return {
        location_group: {
            id: locationGroup.id,
            group_name: locationGroup.group_name,
            group_code: locationGroup.group_code
        },
        is_in_use: isInUse,
        total_usage_count: totalUsageCount,
        usages,
        can_delete: !isInUse,
        message: isInUse
            ? `Location group is being used in ${totalUsageCount} place(s). Please remove dependencies before deleting.`
            : 'Location group is not in use and can be safely deleted.'
    };
};

module.exports = {
    createLocationGroup,
    getAllLocationGroups,
    getLocationGroupDetails,
    updateLocationGroup,
    deleteLocationGroup,
    generateCode,
    getLocationDropdownData,
    checkUsage
};
