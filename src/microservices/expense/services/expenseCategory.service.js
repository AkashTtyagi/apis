/**
 * Expense Category Service
 * Business logic for expense category management
 */

const {
    ExpenseCategory,
    ExpenseCategoryLimit,
    ExpenseCategoryCustomField,
    ExpenseCategoryFilingRule,
    ExpenseLocationGroup
} = require('../../../models/expense');
const { HrmsEmployee } = require('../../../models/HrmsEmployee');
const { sequelize } = require('../../../utils/database');
const { Op, fn, col } = require('sequelize');

/**
 * Create a new expense category with limits, custom fields, and filing rules
 * @param {Object} data - Category data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is creating
 * @returns {Promise<Object>} Created category
 */
const createCategory = async (data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            category_name,
            category_code,
            category_description,
            category_icon,
            parent_category_id,
            expense_type,
            mileage_rate_per_km,
            mileage_vehicle_type,
            per_diem_rate,
            per_diem_half_day_rate,
            hourly_rate,
            min_hours,
            max_hours_per_day,
            receipt_required,
            receipt_required_above,
            is_taxable,
            tax_percentage,
            gst_applicable,
            hsn_code,
            display_order,
            is_active,
            limits,
            custom_fields,
            filing_rules
        } = data;

        // Validate required fields
        if (!category_name || category_name.trim() === '') {
            throw new Error('Category name is required');
        }

        if (!category_code || category_code.trim() === '') {
            throw new Error('Category code is required');
        }

        if (category_name.length > 100) {
            throw new Error('Category name must be 100 characters or less');
        }

        if (category_code.length > 50) {
            throw new Error('Category code must be 50 characters or less');
        }

        // Validate expense type specific fields
        if (expense_type === 'Mileage' && !mileage_rate_per_km) {
            throw new Error('Mileage rate per km is required for Mileage expense type');
        }

        if (expense_type === 'Per_Diem' && !per_diem_rate) {
            throw new Error('Per diem rate is required for Per Diem expense type');
        }

        if (expense_type === 'Time_Based' && !hourly_rate) {
            throw new Error('Hourly rate is required for Time Based expense type');
        }

        // Check for duplicate category_code within the company
        const existingCategory = await ExpenseCategory.findOne({
            where: {
                company_id: companyId,
                category_code: category_code.trim().toUpperCase(),
                deleted_at: null
            },
            transaction
        });

        if (existingCategory) {
            throw new Error('A category with this code already exists');
        }

        // Validate parent category if provided
        if (parent_category_id) {
            const parentCategory = await ExpenseCategory.findOne({
                where: {
                    id: parent_category_id,
                    company_id: companyId,
                    deleted_at: null
                },
                transaction
            });

            if (!parentCategory) {
                throw new Error('Parent category not found');
            }
        }

        // Create category
        const category = await ExpenseCategory.create({
            company_id: companyId,
            category_name: category_name.trim(),
            category_code: category_code.trim().toUpperCase(),
            category_description: category_description || null,
            category_icon: category_icon || null,
            parent_category_id: parent_category_id || null,
            expense_type: expense_type || 'Amount',
            mileage_rate_per_km: mileage_rate_per_km || null,
            mileage_vehicle_type: mileage_vehicle_type || null,
            per_diem_rate: per_diem_rate || null,
            per_diem_half_day_rate: per_diem_half_day_rate || null,
            hourly_rate: hourly_rate || null,
            min_hours: min_hours || null,
            max_hours_per_day: max_hours_per_day || null,
            receipt_required: receipt_required || 'Above_Limit',
            receipt_required_above: receipt_required_above || 500,
            is_taxable: is_taxable ? 1 : 0,
            tax_percentage: tax_percentage || null,
            gst_applicable: gst_applicable ? 1 : 0,
            hsn_code: hsn_code || null,
            display_order: display_order || 0,
            is_active: is_active !== false ? 1 : 0,
            created_by: userId
        }, { transaction });

        // Create limits if provided
        let limitsCount = 0;
        if (limits && Array.isArray(limits) && limits.length > 0) {
            for (const limit of limits) {
                await ExpenseCategoryLimit.create({
                    category_id: category.id,
                    limit_type: limit.limit_type || 'Global',
                    location_group_id: limit.location_group_id || null,
                    grade_id: limit.grade_id || null,
                    department_id: limit.department_id || null,
                    limit_per_transaction: limit.limit_per_transaction || null,
                    limit_per_day: limit.limit_per_day || null,
                    limit_per_week: limit.limit_per_week || null,
                    limit_per_month: limit.limit_per_month || null,
                    limit_per_quarter: limit.limit_per_quarter || null,
                    limit_per_year: limit.limit_per_year || null,
                    max_transactions_per_day: limit.max_transactions_per_day || null,
                    max_transactions_per_month: limit.max_transactions_per_month || null,
                    max_km_per_day: limit.max_km_per_day || null,
                    max_km_per_month: limit.max_km_per_month || null,
                    allow_limit_override: limit.allow_limit_override ? 1 : 0,
                    override_approval_required: limit.override_approval_required !== false ? 1 : 0,
                    effective_from: limit.effective_from || null,
                    effective_to: limit.effective_to || null,
                    is_active: limit.is_active !== false ? 1 : 0,
                    created_by: userId
                }, { transaction });
                limitsCount++;
            }
        }

        // Create custom fields if provided
        let customFieldsCount = 0;
        if (custom_fields && Array.isArray(custom_fields) && custom_fields.length > 0) {
            for (let i = 0; i < custom_fields.length; i++) {
                const field = custom_fields[i];

                // Validate field name uniqueness
                const existingField = custom_fields.slice(0, i).find(
                    f => f.field_name === field.field_name
                );
                if (existingField) {
                    throw new Error(`Duplicate custom field name: ${field.field_name}`);
                }

                await ExpenseCategoryCustomField.create({
                    category_id: category.id,
                    field_name: field.field_name,
                    field_label: field.field_label || field.field_name,
                    field_type: field.field_type,
                    field_placeholder: field.field_placeholder || null,
                    field_description: field.field_description || null,
                    is_required: field.is_required ? 1 : 0,
                    min_length: field.min_length || null,
                    max_length: field.max_length || null,
                    min_value: field.min_value || null,
                    max_value: field.max_value || null,
                    regex_pattern: field.regex_pattern || null,
                    dropdown_options: field.dropdown_options || null,
                    allowed_file_types: field.allowed_file_types || null,
                    max_file_size_mb: field.max_file_size_mb || 5,
                    display_order: field.display_order || i,
                    show_in_list: field.show_in_list ? 1 : 0,
                    is_active: field.is_active !== false ? 1 : 0,
                    created_by: userId
                }, { transaction });
                customFieldsCount++;
            }
        }

        // Create filing rules if provided
        if (filing_rules) {
            await ExpenseCategoryFilingRule.create({
                category_id: category.id,
                allow_past_date_filing: filing_rules.allow_past_date_filing !== false ? 1 : 0,
                max_past_days: filing_rules.max_past_days || 30,
                allow_future_date_filing: filing_rules.allow_future_date_filing ? 1 : 0,
                max_future_days: filing_rules.max_future_days || 0,
                filing_window_start_day: filing_rules.filing_window_start_day || null,
                filing_window_end_day: filing_rules.filing_window_end_day || null,
                min_gap_between_claims_days: filing_rules.min_gap_between_claims_days || null,
                max_claims_per_period: filing_rules.max_claims_per_period || null,
                claims_period: filing_rules.claims_period || null,
                require_project_code: filing_rules.require_project_code ? 1 : 0,
                require_cost_center: filing_rules.require_cost_center ? 1 : 0,
                require_client_name: filing_rules.require_client_name ? 1 : 0,
                require_purpose_description: filing_rules.require_purpose_description !== false ? 1 : 0,
                min_purpose_length: filing_rules.min_purpose_length || 10,
                auto_approve_below_amount: filing_rules.auto_approve_below_amount || null,
                auto_approve_for_grades: filing_rules.auto_approve_for_grades || null,
                allow_weekend_expenses: filing_rules.allow_weekend_expenses !== false ? 1 : 0,
                allow_holiday_expenses: filing_rules.allow_holiday_expenses !== false ? 1 : 0,
                require_justification_for_holiday: filing_rules.require_justification_for_holiday !== false ? 1 : 0,
                check_duplicate_expenses: filing_rules.check_duplicate_expenses !== false ? 1 : 0,
                duplicate_check_fields: filing_rules.duplicate_check_fields || ['amount', 'date'],
                duplicate_check_days: filing_rules.duplicate_check_days || 7,
                created_by: userId
            }, { transaction });
        }

        await transaction.commit();

        return {
            id: category.id,
            category_name: category.category_name,
            category_code: category.category_code,
            expense_type: category.expense_type,
            limits_count: limitsCount,
            custom_fields_count: customFieldsCount,
            is_active: category.is_active === 1,
            created_at: category.created_at
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get all expense categories with filters and pagination
 * @param {Object} filters - Filter options
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Categories with pagination
 */
const getAllCategories = async (filters, companyId) => {
    const {
        is_active,
        search,
        expense_type,
        parent_category_id,
        include_children = false,
        limit = 50,
        offset = 0,
        sort_by = 'display_order',
        sort_order = 'asc'
    } = filters;

    const where = {
        company_id: companyId,
        deleted_at: null
    };

    // Filter by active status
    if (is_active !== undefined) {
        where.is_active = is_active ? 1 : 0;
    }

    // Filter by expense type
    if (expense_type) {
        where.expense_type = expense_type;
    }

    // Filter by parent category
    if (parent_category_id !== undefined) {
        where.parent_category_id = parent_category_id;
    }

    // Search by name or code
    if (search && search.trim()) {
        where[Op.or] = [
            { category_name: { [Op.like]: `%${search.trim()}%` } },
            { category_code: { [Op.like]: `%${search.trim()}%` } }
        ];
    }

    // Validate sort_by field
    const validSortFields = ['category_name', 'category_code', 'expense_type', 'display_order', 'created_at', 'updated_at'];
    const orderField = validSortFields.includes(sort_by) ? sort_by : 'display_order';
    const orderDirection = sort_order?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Get total count
    const total = await ExpenseCategory.count({ where });

    // Build include options
    const includeOptions = [
        {
            model: ExpenseCategoryLimit,
            as: 'limits',
            attributes: ['id'],
            where: { is_active: 1 },
            required: false
        },
        {
            model: ExpenseCategoryCustomField,
            as: 'customFields',
            attributes: ['id'],
            where: { is_active: 1 },
            required: false
        }
    ];

    if (include_children) {
        includeOptions.push({
            model: ExpenseCategory,
            as: 'children',
            attributes: ['id', 'category_name', 'category_code', 'expense_type', 'is_active'],
            where: { deleted_at: null },
            required: false
        });
    }

    // Get categories
    const categories = await ExpenseCategory.findAll({
        where,
        include: includeOptions,
        order: [[orderField, orderDirection]],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    // Format response
    const data = categories.map(category => ({
        id: category.id,
        category_name: category.category_name,
        category_code: category.category_code,
        category_description: category.category_description,
        category_icon: category.category_icon,
        expense_type: category.expense_type,
        mileage_rate_per_km: category.mileage_rate_per_km,
        per_diem_rate: category.per_diem_rate,
        hourly_rate: category.hourly_rate,
        parent_category_id: category.parent_category_id,
        is_active: category.is_active === 1,
        limits_count: category.limits ? category.limits.length : 0,
        custom_fields_count: category.customFields ? category.customFields.length : 0,
        display_order: category.display_order,
        children: include_children ? (category.children || []).map(child => ({
            id: child.id,
            category_name: child.category_name,
            category_code: child.category_code,
            expense_type: child.expense_type,
            is_active: child.is_active === 1
        })) : undefined,
        created_at: category.created_at
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
 * Get category details by ID
 * @param {number} categoryId - Category ID
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Category details
 */
const getCategoryDetails = async (categoryId, companyId) => {
    if (!categoryId) {
        throw new Error('Category ID is required');
    }

    const category = await ExpenseCategory.findOne({
        where: {
            id: categoryId,
            company_id: companyId,
            deleted_at: null
        },
        include: [
            {
                model: ExpenseCategory,
                as: 'parent',
                attributes: ['id', 'category_name', 'category_code']
            },
            {
                model: ExpenseCategory,
                as: 'children',
                attributes: ['id', 'category_name', 'category_code', 'expense_type', 'is_active'],
                where: { deleted_at: null },
                required: false
            },
            {
                model: ExpenseCategoryLimit,
                as: 'limits',
                include: [
                    {
                        model: ExpenseLocationGroup,
                        as: 'locationGroup',
                        attributes: ['id', 'group_name', 'group_code']
                    }
                ]
            },
            {
                model: ExpenseCategoryCustomField,
                as: 'customFields',
                order: [['display_order', 'ASC']]
            },
            {
                model: ExpenseCategoryFilingRule,
                as: 'filingRules'
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

    if (!category) {
        throw new Error('Category not found');
    }

    // Format limits
    const limits = (category.limits || []).map(limit => ({
        id: limit.id,
        limit_type: limit.limit_type,
        location_group_id: limit.location_group_id,
        location_group_name: limit.locationGroup?.group_name || null,
        grade_id: limit.grade_id,
        department_id: limit.department_id,
        limit_per_transaction: limit.limit_per_transaction,
        limit_per_day: limit.limit_per_day,
        limit_per_week: limit.limit_per_week,
        limit_per_month: limit.limit_per_month,
        limit_per_quarter: limit.limit_per_quarter,
        limit_per_year: limit.limit_per_year,
        max_transactions_per_day: limit.max_transactions_per_day,
        max_transactions_per_month: limit.max_transactions_per_month,
        max_km_per_day: limit.max_km_per_day,
        max_km_per_month: limit.max_km_per_month,
        allow_limit_override: limit.allow_limit_override === 1,
        override_approval_required: limit.override_approval_required === 1,
        effective_from: limit.effective_from,
        effective_to: limit.effective_to,
        is_active: limit.is_active === 1
    }));

    // Format custom fields
    const customFields = (category.customFields || []).map(field => ({
        id: field.id,
        field_name: field.field_name,
        field_label: field.field_label,
        field_type: field.field_type,
        field_placeholder: field.field_placeholder,
        field_description: field.field_description,
        is_required: field.is_required === 1,
        min_length: field.min_length,
        max_length: field.max_length,
        min_value: field.min_value,
        max_value: field.max_value,
        regex_pattern: field.regex_pattern,
        dropdown_options: field.dropdown_options,
        allowed_file_types: field.allowed_file_types,
        max_file_size_mb: field.max_file_size_mb,
        display_order: field.display_order,
        show_in_list: field.show_in_list === 1,
        is_active: field.is_active === 1
    }));

    // Format filing rules
    const filingRules = category.filingRules ? {
        id: category.filingRules.id,
        allow_past_date_filing: category.filingRules.allow_past_date_filing === 1,
        max_past_days: category.filingRules.max_past_days,
        allow_future_date_filing: category.filingRules.allow_future_date_filing === 1,
        max_future_days: category.filingRules.max_future_days,
        filing_window_start_day: category.filingRules.filing_window_start_day,
        filing_window_end_day: category.filingRules.filing_window_end_day,
        min_gap_between_claims_days: category.filingRules.min_gap_between_claims_days,
        max_claims_per_period: category.filingRules.max_claims_per_period,
        claims_period: category.filingRules.claims_period,
        require_project_code: category.filingRules.require_project_code === 1,
        require_cost_center: category.filingRules.require_cost_center === 1,
        require_client_name: category.filingRules.require_client_name === 1,
        require_purpose_description: category.filingRules.require_purpose_description === 1,
        min_purpose_length: category.filingRules.min_purpose_length,
        auto_approve_below_amount: category.filingRules.auto_approve_below_amount,
        auto_approve_for_grades: category.filingRules.auto_approve_for_grades,
        allow_weekend_expenses: category.filingRules.allow_weekend_expenses === 1,
        allow_holiday_expenses: category.filingRules.allow_holiday_expenses === 1,
        require_justification_for_holiday: category.filingRules.require_justification_for_holiday === 1,
        check_duplicate_expenses: category.filingRules.check_duplicate_expenses === 1,
        duplicate_check_fields: category.filingRules.duplicate_check_fields,
        duplicate_check_days: category.filingRules.duplicate_check_days
    } : null;

    return {
        id: category.id,
        category_name: category.category_name,
        category_code: category.category_code,
        category_description: category.category_description,
        category_icon: category.category_icon,
        parent_category_id: category.parent_category_id,
        parent_category: category.parent ? {
            id: category.parent.id,
            category_name: category.parent.category_name,
            category_code: category.parent.category_code
        } : null,
        expense_type: category.expense_type,
        mileage_rate_per_km: category.mileage_rate_per_km,
        mileage_vehicle_type: category.mileage_vehicle_type,
        per_diem_rate: category.per_diem_rate,
        per_diem_half_day_rate: category.per_diem_half_day_rate,
        hourly_rate: category.hourly_rate,
        min_hours: category.min_hours,
        max_hours_per_day: category.max_hours_per_day,
        receipt_required: category.receipt_required,
        receipt_required_above: category.receipt_required_above,
        is_taxable: category.is_taxable === 1,
        tax_percentage: category.tax_percentage,
        gst_applicable: category.gst_applicable === 1,
        hsn_code: category.hsn_code,
        display_order: category.display_order,
        is_active: category.is_active === 1,
        limits,
        custom_fields: customFields,
        filing_rules: filingRules,
        children: (category.children || []).map(child => ({
            id: child.id,
            category_name: child.category_name,
            category_code: child.category_code,
            expense_type: child.expense_type,
            is_active: child.is_active === 1
        })),
        created_by: category.createdByEmployee ? {
            id: category.createdByEmployee.id,
            code: category.createdByEmployee.employee_code,
            name: category.createdByEmployee.get('name')
        } : null,
        created_at: category.created_at,
        updated_by: category.updatedByEmployee ? {
            id: category.updatedByEmployee.id,
            code: category.updatedByEmployee.employee_code,
            name: category.updatedByEmployee.get('name')
        } : null,
        updated_at: category.updated_at
    };
};

/**
 * Update expense category
 * @param {Object} data - Update data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is updating
 * @returns {Promise<Object>} Updated category
 */
const updateCategory = async (data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const { category_id, limits, custom_fields, filing_rules, ...updateData } = data;

        if (!category_id) {
            throw new Error('Category ID is required');
        }

        // Find existing category
        const category = await ExpenseCategory.findOne({
            where: {
                id: category_id,
                company_id: companyId,
                deleted_at: null
            },
            transaction
        });

        if (!category) {
            throw new Error('Category not found');
        }

        // Validate category_name if provided
        if (updateData.category_name !== undefined) {
            if (!updateData.category_name || updateData.category_name.trim() === '') {
                throw new Error('Category name cannot be empty');
            }
            if (updateData.category_name.length > 100) {
                throw new Error('Category name must be 100 characters or less');
            }
        }

        // Build update object
        const categoryUpdate = {
            updated_by: userId
        };

        // Only include fields that are provided
        const allowedFields = [
            'category_name', 'category_description', 'category_icon',
            'parent_category_id', 'mileage_rate_per_km', 'mileage_vehicle_type',
            'per_diem_rate', 'per_diem_half_day_rate', 'hourly_rate',
            'min_hours', 'max_hours_per_day', 'receipt_required',
            'receipt_required_above', 'is_taxable', 'tax_percentage',
            'gst_applicable', 'hsn_code', 'display_order', 'is_active'
        ];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                if (field === 'is_active' || field === 'is_taxable' || field === 'gst_applicable') {
                    categoryUpdate[field] = updateData[field] ? 1 : 0;
                } else if (field === 'category_name') {
                    categoryUpdate[field] = updateData[field].trim();
                } else {
                    categoryUpdate[field] = updateData[field];
                }
            }
        }

        // Update category
        await category.update(categoryUpdate, { transaction });

        // Update limits if provided
        if (limits !== undefined && Array.isArray(limits)) {
            // Get existing limit IDs
            const existingLimits = await ExpenseCategoryLimit.findAll({
                where: { category_id },
                attributes: ['id'],
                transaction
            });
            const existingLimitIds = existingLimits.map(l => l.id);

            // Process limits
            const providedLimitIds = limits.filter(l => l.id).map(l => l.id);
            const limitsToDelete = existingLimitIds.filter(id => !providedLimitIds.includes(id));

            // Delete removed limits
            if (limitsToDelete.length > 0) {
                await ExpenseCategoryLimit.destroy({
                    where: { id: limitsToDelete },
                    transaction
                });
            }

            // Update or create limits
            for (const limit of limits) {
                if (limit.id) {
                    // Update existing limit
                    await ExpenseCategoryLimit.update({
                        limit_type: limit.limit_type,
                        location_group_id: limit.location_group_id || null,
                        grade_id: limit.grade_id || null,
                        department_id: limit.department_id || null,
                        limit_per_transaction: limit.limit_per_transaction,
                        limit_per_day: limit.limit_per_day,
                        limit_per_week: limit.limit_per_week,
                        limit_per_month: limit.limit_per_month,
                        limit_per_quarter: limit.limit_per_quarter,
                        limit_per_year: limit.limit_per_year,
                        max_transactions_per_day: limit.max_transactions_per_day,
                        max_transactions_per_month: limit.max_transactions_per_month,
                        max_km_per_day: limit.max_km_per_day,
                        max_km_per_month: limit.max_km_per_month,
                        allow_limit_override: limit.allow_limit_override ? 1 : 0,
                        override_approval_required: limit.override_approval_required !== false ? 1 : 0,
                        effective_from: limit.effective_from,
                        effective_to: limit.effective_to,
                        is_active: limit.is_active !== false ? 1 : 0,
                        updated_by: userId
                    }, {
                        where: { id: limit.id, category_id },
                        transaction
                    });
                } else {
                    // Create new limit
                    await ExpenseCategoryLimit.create({
                        category_id,
                        limit_type: limit.limit_type || 'Global',
                        location_group_id: limit.location_group_id || null,
                        grade_id: limit.grade_id || null,
                        department_id: limit.department_id || null,
                        limit_per_transaction: limit.limit_per_transaction,
                        limit_per_day: limit.limit_per_day,
                        limit_per_week: limit.limit_per_week,
                        limit_per_month: limit.limit_per_month,
                        limit_per_quarter: limit.limit_per_quarter,
                        limit_per_year: limit.limit_per_year,
                        max_transactions_per_day: limit.max_transactions_per_day,
                        max_transactions_per_month: limit.max_transactions_per_month,
                        max_km_per_day: limit.max_km_per_day,
                        max_km_per_month: limit.max_km_per_month,
                        allow_limit_override: limit.allow_limit_override ? 1 : 0,
                        override_approval_required: limit.override_approval_required !== false ? 1 : 0,
                        effective_from: limit.effective_from,
                        effective_to: limit.effective_to,
                        is_active: limit.is_active !== false ? 1 : 0,
                        created_by: userId
                    }, { transaction });
                }
            }
        }

        // Update custom fields if provided
        if (custom_fields !== undefined && Array.isArray(custom_fields)) {
            // Get existing field IDs
            const existingFields = await ExpenseCategoryCustomField.findAll({
                where: { category_id },
                attributes: ['id'],
                transaction
            });
            const existingFieldIds = existingFields.map(f => f.id);

            // Process fields
            const providedFieldIds = custom_fields.filter(f => f.id).map(f => f.id);
            const fieldsToDelete = existingFieldIds.filter(id => !providedFieldIds.includes(id));

            // Delete removed fields
            if (fieldsToDelete.length > 0) {
                await ExpenseCategoryCustomField.destroy({
                    where: { id: fieldsToDelete },
                    transaction
                });
            }

            // Update or create fields
            for (let i = 0; i < custom_fields.length; i++) {
                const field = custom_fields[i];
                if (field.id) {
                    // Update existing field
                    await ExpenseCategoryCustomField.update({
                        field_name: field.field_name,
                        field_label: field.field_label,
                        field_type: field.field_type,
                        field_placeholder: field.field_placeholder,
                        field_description: field.field_description,
                        is_required: field.is_required ? 1 : 0,
                        min_length: field.min_length,
                        max_length: field.max_length,
                        min_value: field.min_value,
                        max_value: field.max_value,
                        regex_pattern: field.regex_pattern,
                        dropdown_options: field.dropdown_options,
                        allowed_file_types: field.allowed_file_types,
                        max_file_size_mb: field.max_file_size_mb,
                        display_order: field.display_order !== undefined ? field.display_order : i,
                        show_in_list: field.show_in_list ? 1 : 0,
                        is_active: field.is_active !== false ? 1 : 0,
                        updated_by: userId
                    }, {
                        where: { id: field.id, category_id },
                        transaction
                    });
                } else {
                    // Create new field
                    await ExpenseCategoryCustomField.create({
                        category_id,
                        field_name: field.field_name,
                        field_label: field.field_label || field.field_name,
                        field_type: field.field_type,
                        field_placeholder: field.field_placeholder,
                        field_description: field.field_description,
                        is_required: field.is_required ? 1 : 0,
                        min_length: field.min_length,
                        max_length: field.max_length,
                        min_value: field.min_value,
                        max_value: field.max_value,
                        regex_pattern: field.regex_pattern,
                        dropdown_options: field.dropdown_options,
                        allowed_file_types: field.allowed_file_types,
                        max_file_size_mb: field.max_file_size_mb || 5,
                        display_order: field.display_order !== undefined ? field.display_order : i,
                        show_in_list: field.show_in_list ? 1 : 0,
                        is_active: field.is_active !== false ? 1 : 0,
                        created_by: userId
                    }, { transaction });
                }
            }
        }

        // Update filing rules if provided
        if (filing_rules !== undefined) {
            const existingFilingRule = await ExpenseCategoryFilingRule.findOne({
                where: { category_id },
                transaction
            });

            const filingRuleData = {
                allow_past_date_filing: filing_rules.allow_past_date_filing !== false ? 1 : 0,
                max_past_days: filing_rules.max_past_days,
                allow_future_date_filing: filing_rules.allow_future_date_filing ? 1 : 0,
                max_future_days: filing_rules.max_future_days,
                filing_window_start_day: filing_rules.filing_window_start_day,
                filing_window_end_day: filing_rules.filing_window_end_day,
                min_gap_between_claims_days: filing_rules.min_gap_between_claims_days,
                max_claims_per_period: filing_rules.max_claims_per_period,
                claims_period: filing_rules.claims_period,
                require_project_code: filing_rules.require_project_code ? 1 : 0,
                require_cost_center: filing_rules.require_cost_center ? 1 : 0,
                require_client_name: filing_rules.require_client_name ? 1 : 0,
                require_purpose_description: filing_rules.require_purpose_description !== false ? 1 : 0,
                min_purpose_length: filing_rules.min_purpose_length,
                auto_approve_below_amount: filing_rules.auto_approve_below_amount,
                auto_approve_for_grades: filing_rules.auto_approve_for_grades,
                allow_weekend_expenses: filing_rules.allow_weekend_expenses !== false ? 1 : 0,
                allow_holiday_expenses: filing_rules.allow_holiday_expenses !== false ? 1 : 0,
                require_justification_for_holiday: filing_rules.require_justification_for_holiday !== false ? 1 : 0,
                check_duplicate_expenses: filing_rules.check_duplicate_expenses !== false ? 1 : 0,
                duplicate_check_fields: filing_rules.duplicate_check_fields,
                duplicate_check_days: filing_rules.duplicate_check_days
            };

            if (existingFilingRule) {
                await existingFilingRule.update({
                    ...filingRuleData,
                    updated_by: userId
                }, { transaction });
            } else {
                await ExpenseCategoryFilingRule.create({
                    category_id,
                    ...filingRuleData,
                    created_by: userId
                }, { transaction });
            }
        }

        await transaction.commit();

        return {
            id: category.id,
            category_name: category.category_name,
            updated_at: new Date()
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Delete expense category (soft delete)
 * @param {number} categoryId - Category ID
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is deleting
 * @returns {Promise<Object>} Delete result
 */
const deleteCategory = async (categoryId, companyId, userId) => {
    if (!categoryId) {
        throw new Error('Category ID is required');
    }

    // Find category
    const category = await ExpenseCategory.findOne({
        where: {
            id: categoryId,
            company_id: companyId,
            deleted_at: null
        },
        include: [
            {
                model: ExpenseCategory,
                as: 'children',
                where: { deleted_at: null },
                required: false
            }
        ]
    });

    if (!category) {
        throw new Error('Category not found');
    }

    // Check for child categories
    if (category.children && category.children.length > 0) {
        throw new Error('Cannot delete category as it has sub-categories');
    }

    // TODO: Check if category has any expense requests filed
    // This will be implemented when expense request module is ready
    // const expenseCount = await ExpenseRequest.count({
    //     where: { category_id: categoryId }
    // });
    // if (expenseCount > 0) {
    //     throw new Error('Cannot delete category as expenses have been filed under it');
    // }

    // Soft delete
    await category.update({
        deleted_at: new Date(),
        deleted_by: userId,
        is_active: 0
    });

    return { message: 'Category deleted successfully' };
};

/**
 * Get dropdown data for category forms
 * @param {Object} filters - Filter options
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Dropdown data
 */
const getCategoryDropdownData = async (filters, companyId) => {
    const { include_inactive = false, expense_type } = filters;

    // Get categories for parent selection
    const categoryWhere = {
        company_id: companyId,
        deleted_at: null
    };

    if (!include_inactive) {
        categoryWhere.is_active = 1;
    }

    if (expense_type) {
        categoryWhere.expense_type = expense_type;
    }

    const categories = await ExpenseCategory.findAll({
        where: categoryWhere,
        attributes: ['id', 'category_name', 'category_code', 'expense_type', 'parent_category_id'],
        order: [['display_order', 'ASC'], ['category_name', 'ASC']]
    });

    // Get location groups
    const locationGroups = await ExpenseLocationGroup.findAll({
        where: {
            company_id: companyId,
            is_active: 1,
            deleted_at: null
        },
        attributes: ['id', 'group_name', 'group_code'],
        order: [['group_name', 'ASC']]
    });

    // Static dropdown options
    const expenseTypes = [
        { value: 'Amount', label: 'Amount Based' },
        { value: 'Mileage', label: 'Mileage Based' },
        { value: 'Per_Diem', label: 'Per Diem' },
        { value: 'Time_Based', label: 'Time Based' }
    ];

    const receiptOptions = [
        { value: 'Always', label: 'Always Required' },
        { value: 'Above_Limit', label: 'Above Limit' },
        { value: 'Never', label: 'Never Required' }
    ];

    const fieldTypes = [
        { value: 'Text', label: 'Text' },
        { value: 'Number', label: 'Number' },
        { value: 'Date', label: 'Date' },
        { value: 'DateTime', label: 'Date & Time' },
        { value: 'Dropdown', label: 'Dropdown' },
        { value: 'MultiSelect', label: 'Multi Select' },
        { value: 'File', label: 'File Upload' },
        { value: 'Checkbox', label: 'Checkbox' },
        { value: 'TextArea', label: 'Text Area' }
    ];

    const limitTypes = [
        { value: 'Global', label: 'Global' },
        { value: 'Location_Based', label: 'Location Based' },
        { value: 'Grade_Based', label: 'Grade Based' },
        { value: 'Department_Based', label: 'Department Based' }
    ];

    const claimPeriods = [
        { value: 'Day', label: 'Per Day' },
        { value: 'Week', label: 'Per Week' },
        { value: 'Month', label: 'Per Month' },
        { value: 'Quarter', label: 'Per Quarter' },
        { value: 'Year', label: 'Per Year' }
    ];

    return {
        categories: categories.map(c => ({
            id: c.id,
            name: c.category_name,
            code: c.category_code,
            expense_type: c.expense_type,
            parent_id: c.parent_category_id
        })),
        expense_types: expenseTypes,
        receipt_options: receiptOptions,
        field_types: fieldTypes,
        limit_types: limitTypes,
        claim_periods: claimPeriods,
        location_groups: locationGroups.map(lg => ({
            id: lg.id,
            name: lg.group_name,
            code: lg.group_code
        }))
    };
};

/**
 * Manage category limits (add/update/delete)
 * @param {Object} data - Limit data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Result
 */
const manageCategoryLimits = async (data, companyId, userId) => {
    const { category_id, action, limit, limit_id } = data;

    if (!category_id) {
        throw new Error('Category ID is required');
    }

    // Verify category exists and belongs to company
    const category = await ExpenseCategory.findOne({
        where: {
            id: category_id,
            company_id: companyId,
            deleted_at: null
        }
    });

    if (!category) {
        throw new Error('Category not found');
    }

    if (action === 'delete') {
        if (!limit_id) {
            throw new Error('Limit ID is required for delete action');
        }

        await ExpenseCategoryLimit.destroy({
            where: { id: limit_id, category_id }
        });

        return { message: 'Limit deleted successfully' };
    }

    if (action === 'upsert') {
        if (!limit) {
            throw new Error('Limit data is required');
        }

        if (limit.id) {
            // Update existing limit
            await ExpenseCategoryLimit.update({
                limit_type: limit.limit_type,
                location_group_id: limit.location_group_id || null,
                grade_id: limit.grade_id || null,
                department_id: limit.department_id || null,
                limit_per_transaction: limit.limit_per_transaction,
                limit_per_day: limit.limit_per_day,
                limit_per_week: limit.limit_per_week,
                limit_per_month: limit.limit_per_month,
                limit_per_quarter: limit.limit_per_quarter,
                limit_per_year: limit.limit_per_year,
                max_transactions_per_day: limit.max_transactions_per_day,
                max_transactions_per_month: limit.max_transactions_per_month,
                max_km_per_day: limit.max_km_per_day,
                max_km_per_month: limit.max_km_per_month,
                allow_limit_override: limit.allow_limit_override ? 1 : 0,
                override_approval_required: limit.override_approval_required !== false ? 1 : 0,
                effective_from: limit.effective_from,
                effective_to: limit.effective_to,
                is_active: limit.is_active !== false ? 1 : 0,
                updated_by: userId
            }, {
                where: { id: limit.id, category_id }
            });

            return {
                message: 'Limit updated successfully',
                data: { id: limit.id, limit_type: limit.limit_type }
            };
        } else {
            // Create new limit
            const newLimit = await ExpenseCategoryLimit.create({
                category_id,
                limit_type: limit.limit_type || 'Global',
                location_group_id: limit.location_group_id || null,
                grade_id: limit.grade_id || null,
                department_id: limit.department_id || null,
                limit_per_transaction: limit.limit_per_transaction,
                limit_per_day: limit.limit_per_day,
                limit_per_week: limit.limit_per_week,
                limit_per_month: limit.limit_per_month,
                limit_per_quarter: limit.limit_per_quarter,
                limit_per_year: limit.limit_per_year,
                max_transactions_per_day: limit.max_transactions_per_day,
                max_transactions_per_month: limit.max_transactions_per_month,
                max_km_per_day: limit.max_km_per_day,
                max_km_per_month: limit.max_km_per_month,
                allow_limit_override: limit.allow_limit_override ? 1 : 0,
                override_approval_required: limit.override_approval_required !== false ? 1 : 0,
                effective_from: limit.effective_from,
                effective_to: limit.effective_to,
                is_active: limit.is_active !== false ? 1 : 0,
                created_by: userId
            });

            return {
                message: 'Limit created successfully',
                data: { id: newLimit.id, limit_type: newLimit.limit_type }
            };
        }
    }

    throw new Error('Invalid action');
};

/**
 * Manage custom fields (add/update/delete)
 * @param {Object} data - Field data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Result
 */
const manageCustomFields = async (data, companyId, userId) => {
    const { category_id, action, field, field_id } = data;

    if (!category_id) {
        throw new Error('Category ID is required');
    }

    // Verify category exists and belongs to company
    const category = await ExpenseCategory.findOne({
        where: {
            id: category_id,
            company_id: companyId,
            deleted_at: null
        }
    });

    if (!category) {
        throw new Error('Category not found');
    }

    if (action === 'delete') {
        if (!field_id) {
            throw new Error('Field ID is required for delete action');
        }

        await ExpenseCategoryCustomField.destroy({
            where: { id: field_id, category_id }
        });

        return { message: 'Custom field deleted successfully' };
    }

    if (action === 'upsert') {
        if (!field) {
            throw new Error('Field data is required');
        }

        if (!field.field_name || !field.field_type) {
            throw new Error('Field name and type are required');
        }

        // Check for duplicate field name
        const existingField = await ExpenseCategoryCustomField.findOne({
            where: {
                category_id,
                field_name: field.field_name,
                id: { [Op.ne]: field.id || 0 }
            }
        });

        if (existingField) {
            throw new Error(`A field with name '${field.field_name}' already exists`);
        }

        if (field.id) {
            // Update existing field
            await ExpenseCategoryCustomField.update({
                field_name: field.field_name,
                field_label: field.field_label || field.field_name,
                field_type: field.field_type,
                field_placeholder: field.field_placeholder,
                field_description: field.field_description,
                is_required: field.is_required ? 1 : 0,
                min_length: field.min_length,
                max_length: field.max_length,
                min_value: field.min_value,
                max_value: field.max_value,
                regex_pattern: field.regex_pattern,
                dropdown_options: field.dropdown_options,
                allowed_file_types: field.allowed_file_types,
                max_file_size_mb: field.max_file_size_mb,
                display_order: field.display_order,
                show_in_list: field.show_in_list ? 1 : 0,
                is_active: field.is_active !== false ? 1 : 0,
                updated_by: userId
            }, {
                where: { id: field.id, category_id }
            });

            return {
                message: 'Custom field updated successfully',
                data: { id: field.id, field_name: field.field_name, field_label: field.field_label }
            };
        } else {
            // Create new field
            const newField = await ExpenseCategoryCustomField.create({
                category_id,
                field_name: field.field_name,
                field_label: field.field_label || field.field_name,
                field_type: field.field_type,
                field_placeholder: field.field_placeholder,
                field_description: field.field_description,
                is_required: field.is_required ? 1 : 0,
                min_length: field.min_length,
                max_length: field.max_length,
                min_value: field.min_value,
                max_value: field.max_value,
                regex_pattern: field.regex_pattern,
                dropdown_options: field.dropdown_options,
                allowed_file_types: field.allowed_file_types,
                max_file_size_mb: field.max_file_size_mb || 5,
                display_order: field.display_order || 0,
                show_in_list: field.show_in_list ? 1 : 0,
                is_active: field.is_active !== false ? 1 : 0,
                created_by: userId
            });

            return {
                message: 'Custom field created successfully',
                data: { id: newField.id, field_name: newField.field_name, field_label: newField.field_label }
            };
        }
    }

    throw new Error('Invalid action');
};

/**
 * Update filing rules for a category
 * @param {Object} data - Filing rules data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Result
 */
const updateFilingRules = async (data, companyId, userId) => {
    const { category_id, filing_rules } = data;

    if (!category_id) {
        throw new Error('Category ID is required');
    }

    if (!filing_rules) {
        throw new Error('Filing rules data is required');
    }

    // Verify category exists and belongs to company
    const category = await ExpenseCategory.findOne({
        where: {
            id: category_id,
            company_id: companyId,
            deleted_at: null
        }
    });

    if (!category) {
        throw new Error('Category not found');
    }

    const filingRuleData = {
        allow_past_date_filing: filing_rules.allow_past_date_filing !== false ? 1 : 0,
        max_past_days: filing_rules.max_past_days,
        allow_future_date_filing: filing_rules.allow_future_date_filing ? 1 : 0,
        max_future_days: filing_rules.max_future_days,
        filing_window_start_day: filing_rules.filing_window_start_day,
        filing_window_end_day: filing_rules.filing_window_end_day,
        min_gap_between_claims_days: filing_rules.min_gap_between_claims_days,
        max_claims_per_period: filing_rules.max_claims_per_period,
        claims_period: filing_rules.claims_period,
        require_project_code: filing_rules.require_project_code ? 1 : 0,
        require_cost_center: filing_rules.require_cost_center ? 1 : 0,
        require_client_name: filing_rules.require_client_name ? 1 : 0,
        require_purpose_description: filing_rules.require_purpose_description !== false ? 1 : 0,
        min_purpose_length: filing_rules.min_purpose_length,
        auto_approve_below_amount: filing_rules.auto_approve_below_amount,
        auto_approve_for_grades: filing_rules.auto_approve_for_grades,
        allow_weekend_expenses: filing_rules.allow_weekend_expenses !== false ? 1 : 0,
        allow_holiday_expenses: filing_rules.allow_holiday_expenses !== false ? 1 : 0,
        require_justification_for_holiday: filing_rules.require_justification_for_holiday !== false ? 1 : 0,
        check_duplicate_expenses: filing_rules.check_duplicate_expenses !== false ? 1 : 0,
        duplicate_check_fields: filing_rules.duplicate_check_fields,
        duplicate_check_days: filing_rules.duplicate_check_days
    };

    const existingRule = await ExpenseCategoryFilingRule.findOne({
        where: { category_id }
    });

    if (existingRule) {
        await existingRule.update({
            ...filingRuleData,
            updated_by: userId
        });
    } else {
        await ExpenseCategoryFilingRule.create({
            category_id,
            ...filingRuleData,
            created_by: userId
        });
    }

    return {
        message: 'Filing rules updated successfully',
        data: { category_id, updated_at: new Date() }
    };
};

/**
 * Clone an existing category
 * @param {Object} data - Clone data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} New category
 */
const cloneCategory = async (data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            source_category_id,
            new_category_name,
            new_category_code,
            include_limits = true,
            include_custom_fields = true,
            include_filing_rules = true
        } = data;

        if (!source_category_id) {
            throw new Error('Source category ID is required');
        }

        if (!new_category_name || !new_category_code) {
            throw new Error('New category name and code are required');
        }

        // Check for duplicate code
        const existingCategory = await ExpenseCategory.findOne({
            where: {
                company_id: companyId,
                category_code: new_category_code.trim().toUpperCase(),
                deleted_at: null
            },
            transaction
        });

        if (existingCategory) {
            throw new Error('A category with this code already exists');
        }

        // Get source category with all related data
        const sourceCategory = await ExpenseCategory.findOne({
            where: {
                id: source_category_id,
                company_id: companyId,
                deleted_at: null
            },
            include: [
                { model: ExpenseCategoryLimit, as: 'limits' },
                { model: ExpenseCategoryCustomField, as: 'customFields' },
                { model: ExpenseCategoryFilingRule, as: 'filingRules' }
            ],
            transaction
        });

        if (!sourceCategory) {
            throw new Error('Source category not found');
        }

        // Create new category
        const newCategory = await ExpenseCategory.create({
            company_id: companyId,
            category_name: new_category_name.trim(),
            category_code: new_category_code.trim().toUpperCase(),
            category_description: sourceCategory.category_description,
            category_icon: sourceCategory.category_icon,
            parent_category_id: sourceCategory.parent_category_id,
            expense_type: sourceCategory.expense_type,
            mileage_rate_per_km: sourceCategory.mileage_rate_per_km,
            mileage_vehicle_type: sourceCategory.mileage_vehicle_type,
            per_diem_rate: sourceCategory.per_diem_rate,
            per_diem_half_day_rate: sourceCategory.per_diem_half_day_rate,
            hourly_rate: sourceCategory.hourly_rate,
            min_hours: sourceCategory.min_hours,
            max_hours_per_day: sourceCategory.max_hours_per_day,
            receipt_required: sourceCategory.receipt_required,
            receipt_required_above: sourceCategory.receipt_required_above,
            is_taxable: sourceCategory.is_taxable,
            tax_percentage: sourceCategory.tax_percentage,
            gst_applicable: sourceCategory.gst_applicable,
            hsn_code: sourceCategory.hsn_code,
            display_order: sourceCategory.display_order,
            is_active: 1,
            created_by: userId
        }, { transaction });

        // Clone limits if requested
        if (include_limits && sourceCategory.limits && sourceCategory.limits.length > 0) {
            for (const limit of sourceCategory.limits) {
                await ExpenseCategoryLimit.create({
                    category_id: newCategory.id,
                    limit_type: limit.limit_type,
                    location_group_id: limit.location_group_id,
                    grade_id: limit.grade_id,
                    department_id: limit.department_id,
                    limit_per_transaction: limit.limit_per_transaction,
                    limit_per_day: limit.limit_per_day,
                    limit_per_week: limit.limit_per_week,
                    limit_per_month: limit.limit_per_month,
                    limit_per_quarter: limit.limit_per_quarter,
                    limit_per_year: limit.limit_per_year,
                    max_transactions_per_day: limit.max_transactions_per_day,
                    max_transactions_per_month: limit.max_transactions_per_month,
                    max_km_per_day: limit.max_km_per_day,
                    max_km_per_month: limit.max_km_per_month,
                    allow_limit_override: limit.allow_limit_override,
                    override_approval_required: limit.override_approval_required,
                    effective_from: limit.effective_from,
                    effective_to: limit.effective_to,
                    is_active: limit.is_active,
                    created_by: userId
                }, { transaction });
            }
        }

        // Clone custom fields if requested
        if (include_custom_fields && sourceCategory.customFields && sourceCategory.customFields.length > 0) {
            for (const field of sourceCategory.customFields) {
                await ExpenseCategoryCustomField.create({
                    category_id: newCategory.id,
                    field_name: field.field_name,
                    field_label: field.field_label,
                    field_type: field.field_type,
                    field_placeholder: field.field_placeholder,
                    field_description: field.field_description,
                    is_required: field.is_required,
                    min_length: field.min_length,
                    max_length: field.max_length,
                    min_value: field.min_value,
                    max_value: field.max_value,
                    regex_pattern: field.regex_pattern,
                    dropdown_options: field.dropdown_options,
                    allowed_file_types: field.allowed_file_types,
                    max_file_size_mb: field.max_file_size_mb,
                    display_order: field.display_order,
                    show_in_list: field.show_in_list,
                    is_active: field.is_active,
                    created_by: userId
                }, { transaction });
            }
        }

        // Clone filing rules if requested
        if (include_filing_rules && sourceCategory.filingRules) {
            const rules = sourceCategory.filingRules;
            await ExpenseCategoryFilingRule.create({
                category_id: newCategory.id,
                allow_past_date_filing: rules.allow_past_date_filing,
                max_past_days: rules.max_past_days,
                allow_future_date_filing: rules.allow_future_date_filing,
                max_future_days: rules.max_future_days,
                filing_window_start_day: rules.filing_window_start_day,
                filing_window_end_day: rules.filing_window_end_day,
                min_gap_between_claims_days: rules.min_gap_between_claims_days,
                max_claims_per_period: rules.max_claims_per_period,
                claims_period: rules.claims_period,
                require_project_code: rules.require_project_code,
                require_cost_center: rules.require_cost_center,
                require_client_name: rules.require_client_name,
                require_purpose_description: rules.require_purpose_description,
                min_purpose_length: rules.min_purpose_length,
                auto_approve_below_amount: rules.auto_approve_below_amount,
                auto_approve_for_grades: rules.auto_approve_for_grades,
                allow_weekend_expenses: rules.allow_weekend_expenses,
                allow_holiday_expenses: rules.allow_holiday_expenses,
                require_justification_for_holiday: rules.require_justification_for_holiday,
                check_duplicate_expenses: rules.check_duplicate_expenses,
                duplicate_check_fields: rules.duplicate_check_fields,
                duplicate_check_days: rules.duplicate_check_days,
                created_by: userId
            }, { transaction });
        }

        await transaction.commit();

        return {
            id: newCategory.id,
            category_name: newCategory.category_name,
            category_code: newCategory.category_code,
            created_at: newCategory.created_at
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Reorder categories
 * @param {Object} data - Reorder data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Result
 */
const reorderCategories = async (data, companyId, userId) => {
    const { category_orders } = data;

    if (!category_orders || !Array.isArray(category_orders) || category_orders.length === 0) {
        throw new Error('Category orders array is required');
    }

    const transaction = await sequelize.transaction();

    try {
        for (const order of category_orders) {
            await ExpenseCategory.update({
                display_order: order.display_order,
                updated_by: userId
            }, {
                where: {
                    id: order.category_id,
                    company_id: companyId,
                    deleted_at: null
                },
                transaction
            });
        }

        await transaction.commit();
        return { message: 'Categories reordered successfully' };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get category hierarchy (tree structure)
 * @param {Object} filters - Filter options
 * @param {number} companyId - Company ID
 * @returns {Promise<Array>} Category tree
 */
const getCategoryHierarchy = async (filters, companyId) => {
    const { include_inactive = false } = filters;

    const where = {
        company_id: companyId,
        deleted_at: null,
        parent_category_id: null // Get only root categories
    };

    if (!include_inactive) {
        where.is_active = 1;
    }

    // Recursive function to build tree
    const buildTree = async (parentWhere, childActiveFilter) => {
        const categories = await ExpenseCategory.findAll({
            where: parentWhere,
            attributes: ['id', 'category_name', 'category_code', 'expense_type', 'is_active', 'display_order'],
            order: [['display_order', 'ASC'], ['category_name', 'ASC']]
        });

        const tree = [];
        for (const category of categories) {
            const childWhere = {
                company_id: companyId,
                deleted_at: null,
                parent_category_id: category.id
            };

            if (childActiveFilter) {
                childWhere.is_active = 1;
            }

            const children = await buildTree(childWhere, childActiveFilter);

            tree.push({
                id: category.id,
                category_name: category.category_name,
                category_code: category.category_code,
                expense_type: category.expense_type,
                is_active: category.is_active === 1,
                children
            });
        }

        return tree;
    };

    return await buildTree(where, !include_inactive);
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryDetails,
    updateCategory,
    deleteCategory,
    getCategoryDropdownData,
    manageCategoryLimits,
    manageCustomFields,
    updateFilingRules,
    cloneCategory,
    reorderCategories,
    getCategoryHierarchy
};
