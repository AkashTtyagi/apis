/**
 * Expense Settings Service
 * Business logic for company-wide expense settings management
 */

const {
    ExpenseSettings,
    ExpenseMileageRate,
    ExpensePerDiemRate,
    ExpenseLocationGroup
} = require('../../../models/expense');
const { sequelize } = require('../../../utils/database');
const { Op } = require('sequelize');

// ==================== GENERAL SETTINGS ====================

/**
 * Get settings for a company (create with defaults if not exists)
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Settings
 */
const getSettings = async (companyId) => {
    let settings = await ExpenseSettings.findOne({
        where: { company_id: companyId }
    });

    // Create default settings if not exists
    if (!settings) {
        settings = await ExpenseSettings.create({
            company_id: companyId,
            created_by: 1 // System created
        });

        // Reload
        settings = await ExpenseSettings.findOne({
            where: { company_id: companyId }
        });
    }

    return settings;
};

/**
 * Update settings for a company
 * @param {Object} data - Settings data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated settings
 */
const updateSettings = async (data, companyId, userId) => {
    let settings = await ExpenseSettings.findOne({
        where: { company_id: companyId }
    });

    if (!settings) {
        // Create with provided data
        settings = await ExpenseSettings.create({
            ...data,
            company_id: companyId,
            created_by: userId
        });
    } else {
        // Update existing
        await settings.update({
            ...data,
            updated_by: userId
        });
    }

    return await getSettings(companyId);
};

/**
 * Update a specific section of settings
 * @param {string} section - Section name
 * @param {Object} data - Section data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated settings
 */
const updateSettingsSection = async (section, data, companyId, userId) => {
    const sectionFields = {
        general: [
            'expense_module_enabled', 'expense_code_prefix', 'expense_code_format',
            'expense_code_sequence_length', 'auto_generate_expense_code'
        ],
        submission_window: [
            'submission_window_enabled', 'submission_window_type', 'submission_window_start_day',
            'submission_window_end_day', 'submission_window_start_time', 'submission_window_end_time',
            'allow_late_submission', 'late_submission_penalty_percent', 'late_submission_max_days'
        ],
        date_time: [
            'fiscal_year_start_month', 'fiscal_year_start_day', 'date_format', 'time_format',
            'timezone', 'week_start_day', 'working_days', 'default_max_past_days',
            'default_max_future_days', 'allow_backdated_expenses', 'backdated_approval_required',
            'backdated_threshold_days'
        ],
        mileage: [
            'distance_unit', 'default_mileage_rate', 'mileage_calculation_method',
            'google_maps_api_enabled', 'google_maps_api_key', 'allow_round_trip_calculation',
            'max_daily_mileage', 'max_monthly_mileage', 'require_odometer_reading', 'require_route_details'
        ],
        per_diem: [
            'per_diem_calculation_method', 'per_diem_full_day_hours', 'per_diem_half_day_hours',
            'per_diem_include_travel_days', 'per_diem_deduct_meals_provided',
            'meal_deduction_breakfast_percent', 'meal_deduction_lunch_percent', 'meal_deduction_dinner_percent'
        ],
        receipt: [
            'default_receipt_required_above', 'allowed_file_types', 'max_file_size_mb',
            'max_files_per_expense', 'require_original_receipt', 'receipt_retention_days', 'auto_ocr_enabled'
        ],
        violation: [
            'duplicate_detection_enabled', 'duplicate_detection_fields', 'duplicate_detection_days',
            'duplicate_action', 'policy_violation_action', 'over_limit_action',
            'suspicious_pattern_detection', 'round_amount_threshold', 'weekend_expense_flag', 'holiday_expense_flag'
        ],
        payment: [
            'payment_cycle', 'payment_day', 'minimum_payment_amount', 'payment_consolidation',
            'auto_adjust_advance', 'bank_transfer_format', 'include_tax_in_reimbursement',
            'tds_applicable', 'tds_threshold', 'tds_rate'
        ],
        notification: [
            'email_notifications_enabled', 'push_notifications_enabled', 'sms_notifications_enabled',
            'notify_on_submission', 'notify_on_approval', 'notify_on_rejection', 'notify_on_payment',
            'reminder_before_window_close_days', 'pending_approval_reminder_hours', 'escalation_reminder_hours'
        ],
        audit: [
            'audit_trail_enabled', 'audit_log_retention_days', 'log_all_views', 'log_field_changes',
            'ip_tracking_enabled', 'device_tracking_enabled', 'geo_location_tracking'
        ],
        integration: [
            'erp_integration_enabled', 'erp_system', 'erp_sync_frequency',
            'accounting_integration_enabled', 'default_expense_account', 'default_liability_account'
        ],
        ui: [
            'default_list_page_size', 'show_expense_summary_dashboard', 'allow_draft_save',
            'auto_save_interval_seconds', 'show_policy_hints', 'show_limit_warnings',
            'allow_expense_templates', 'allow_recurring_expenses'
        ]
    };

    const allowedFields = sectionFields[section];
    if (!allowedFields) {
        throw new Error(`Invalid section: ${section}`);
    }

    // Filter data to only include allowed fields
    const filteredData = {};
    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            filteredData[field] = data[field];
        }
    }

    return await updateSettings(filteredData, companyId, userId);
};

// ==================== MILEAGE RATES ====================

/**
 * Get all mileage rates
 * @param {number} companyId - Company ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Mileage rates
 */
const getMileageRates = async (companyId, filters = {}) => {
    const { is_active, vehicle_type, search } = filters;

    const where = { company_id: companyId };

    if (is_active !== undefined && is_active !== null) {
        where.is_active = is_active ? 1 : 0;
    }

    if (vehicle_type) {
        where.vehicle_type = vehicle_type;
    }

    if (search && search.trim()) {
        where[Op.or] = [
            { rate_name: { [Op.like]: `%${search.trim()}%` } },
            { rate_code: { [Op.like]: `%${search.trim()}%` } }
        ];
    }

    const rates = await ExpenseMileageRate.findAll({
        where,
        include: [
            {
                model: ExpenseLocationGroup,
                as: 'locationGroup',
                attributes: ['id', 'group_name', 'group_code'],
                required: false
            }
        ],
        order: [['vehicle_type', 'ASC'], ['rate_name', 'ASC']]
    });

    return rates;
};

/**
 * Create mileage rate
 * @param {Object} data - Rate data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Created rate
 */
const createMileageRate = async (data, companyId, userId) => {
    const {
        rate_name, rate_code, vehicle_type, fuel_type, rate_per_unit,
        min_distance, max_distance_per_day, max_distance_per_month,
        location_group_id, grade_ids, effective_from, effective_to, is_active
    } = data;

    // Check for duplicate code
    const existing = await ExpenseMileageRate.findOne({
        where: {
            company_id: companyId,
            rate_code: rate_code.trim().toUpperCase()
        }
    });

    if (existing) {
        throw new Error('A mileage rate with this code already exists');
    }

    const rate = await ExpenseMileageRate.create({
        company_id: companyId,
        rate_name: rate_name.trim(),
        rate_code: rate_code.trim().toUpperCase(),
        vehicle_type: vehicle_type || 'Four_Wheeler',
        fuel_type: fuel_type || 'Any',
        rate_per_unit,
        min_distance: min_distance || 0,
        max_distance_per_day,
        max_distance_per_month,
        location_group_id,
        grade_ids,
        effective_from,
        effective_to,
        is_active: is_active !== false ? 1 : 0,
        created_by: userId
    });

    return await ExpenseMileageRate.findByPk(rate.id, {
        include: [
            {
                model: ExpenseLocationGroup,
                as: 'locationGroup',
                attributes: ['id', 'group_name', 'group_code'],
                required: false
            }
        ]
    });
};

/**
 * Update mileage rate
 * @param {number} rateId - Rate ID
 * @param {Object} data - Update data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated rate
 */
const updateMileageRate = async (rateId, data, companyId, userId) => {
    const rate = await ExpenseMileageRate.findOne({
        where: { id: rateId, company_id: companyId }
    });

    if (!rate) {
        throw new Error('Mileage rate not found');
    }

    // Check for duplicate code if changing
    if (data.rate_code && data.rate_code.trim().toUpperCase() !== rate.rate_code) {
        const existing = await ExpenseMileageRate.findOne({
            where: {
                company_id: companyId,
                rate_code: data.rate_code.trim().toUpperCase(),
                id: { [Op.ne]: rateId }
            }
        });

        if (existing) {
            throw new Error('A mileage rate with this code already exists');
        }
    }

    await rate.update({
        ...data,
        rate_code: data.rate_code ? data.rate_code.trim().toUpperCase() : rate.rate_code,
        updated_by: userId
    });

    return await ExpenseMileageRate.findByPk(rateId, {
        include: [
            {
                model: ExpenseLocationGroup,
                as: 'locationGroup',
                attributes: ['id', 'group_name', 'group_code'],
                required: false
            }
        ]
    });
};

/**
 * Delete mileage rate
 * @param {number} rateId - Rate ID
 * @param {number} companyId - Company ID
 * @returns {Promise<boolean>} Success
 */
const deleteMileageRate = async (rateId, companyId) => {
    const rate = await ExpenseMileageRate.findOne({
        where: { id: rateId, company_id: companyId }
    });

    if (!rate) {
        throw new Error('Mileage rate not found');
    }

    await rate.destroy();
    return true;
};

// ==================== PER DIEM RATES ====================

/**
 * Get all per diem rates
 * @param {number} companyId - Company ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Per diem rates
 */
const getPerDiemRates = async (companyId, filters = {}) => {
    const { is_active, city_tier, search } = filters;

    const where = { company_id: companyId };

    if (is_active !== undefined && is_active !== null) {
        where.is_active = is_active ? 1 : 0;
    }

    if (city_tier) {
        where.city_tier = city_tier;
    }

    if (search && search.trim()) {
        where[Op.or] = [
            { rate_name: { [Op.like]: `%${search.trim()}%` } },
            { rate_code: { [Op.like]: `%${search.trim()}%` } }
        ];
    }

    const rates = await ExpensePerDiemRate.findAll({
        where,
        include: [
            {
                model: ExpenseLocationGroup,
                as: 'locationGroup',
                attributes: ['id', 'group_name', 'group_code'],
                required: false
            }
        ],
        order: [['city_tier', 'ASC'], ['rate_name', 'ASC']]
    });

    return rates;
};

/**
 * Create per diem rate
 * @param {Object} data - Rate data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Created rate
 */
const createPerDiemRate = async (data, companyId, userId) => {
    const {
        rate_name, rate_code, location_group_id, city_tier,
        full_day_rate, half_day_rate, hourly_rate,
        breakfast_rate, lunch_rate, dinner_rate, incidental_rate,
        grade_ids, designation_ids, effective_from, effective_to, is_active
    } = data;

    // Check for duplicate code
    const existing = await ExpensePerDiemRate.findOne({
        where: {
            company_id: companyId,
            rate_code: rate_code.trim().toUpperCase()
        }
    });

    if (existing) {
        throw new Error('A per diem rate with this code already exists');
    }

    const rate = await ExpensePerDiemRate.create({
        company_id: companyId,
        rate_name: rate_name.trim(),
        rate_code: rate_code.trim().toUpperCase(),
        location_group_id,
        city_tier: city_tier || 'Metro',
        full_day_rate,
        half_day_rate,
        hourly_rate,
        breakfast_rate,
        lunch_rate,
        dinner_rate,
        incidental_rate,
        grade_ids,
        designation_ids,
        effective_from,
        effective_to,
        is_active: is_active !== false ? 1 : 0,
        created_by: userId
    });

    return await ExpensePerDiemRate.findByPk(rate.id, {
        include: [
            {
                model: ExpenseLocationGroup,
                as: 'locationGroup',
                attributes: ['id', 'group_name', 'group_code'],
                required: false
            }
        ]
    });
};

/**
 * Update per diem rate
 * @param {number} rateId - Rate ID
 * @param {Object} data - Update data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated rate
 */
const updatePerDiemRate = async (rateId, data, companyId, userId) => {
    const rate = await ExpensePerDiemRate.findOne({
        where: { id: rateId, company_id: companyId }
    });

    if (!rate) {
        throw new Error('Per diem rate not found');
    }

    // Check for duplicate code if changing
    if (data.rate_code && data.rate_code.trim().toUpperCase() !== rate.rate_code) {
        const existing = await ExpensePerDiemRate.findOne({
            where: {
                company_id: companyId,
                rate_code: data.rate_code.trim().toUpperCase(),
                id: { [Op.ne]: rateId }
            }
        });

        if (existing) {
            throw new Error('A per diem rate with this code already exists');
        }
    }

    await rate.update({
        ...data,
        rate_code: data.rate_code ? data.rate_code.trim().toUpperCase() : rate.rate_code,
        updated_by: userId
    });

    return await ExpensePerDiemRate.findByPk(rateId, {
        include: [
            {
                model: ExpenseLocationGroup,
                as: 'locationGroup',
                attributes: ['id', 'group_name', 'group_code'],
                required: false
            }
        ]
    });
};

/**
 * Delete per diem rate
 * @param {number} rateId - Rate ID
 * @param {number} companyId - Company ID
 * @returns {Promise<boolean>} Success
 */
const deletePerDiemRate = async (rateId, companyId) => {
    const rate = await ExpensePerDiemRate.findOne({
        where: { id: rateId, company_id: companyId }
    });

    if (!rate) {
        throw new Error('Per diem rate not found');
    }

    await rate.destroy();
    return true;
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get applicable mileage rate for an employee
 * @param {number} companyId - Company ID
 * @param {Object} params - Parameters
 * @returns {Promise<Object|null>} Applicable rate
 */
const getApplicableMileageRate = async (companyId, params) => {
    const { vehicle_type, location_group_id, grade_id, expense_date } = params;

    const where = {
        company_id: companyId,
        is_active: 1,
        vehicle_type,
        effective_from: { [Op.lte]: expense_date },
        [Op.or]: [
            { effective_to: null },
            { effective_to: { [Op.gte]: expense_date } }
        ]
    };

    // Get all matching rates
    const rates = await ExpenseMileageRate.findAll({
        where,
        order: [['location_group_id', 'DESC']] // Location-specific first
    });

    // Find best match
    for (const rate of rates) {
        // Check location match
        if (rate.location_group_id && rate.location_group_id !== location_group_id) {
            continue;
        }

        // Check grade match
        if (rate.grade_ids && rate.grade_ids.length > 0) {
            if (!rate.grade_ids.includes(grade_id)) {
                continue;
            }
        }

        return rate;
    }

    return null;
};

/**
 * Get applicable per diem rate for an employee
 * @param {number} companyId - Company ID
 * @param {Object} params - Parameters
 * @returns {Promise<Object|null>} Applicable rate
 */
const getApplicablePerDiemRate = async (companyId, params) => {
    const { city_tier, location_group_id, grade_id, designation_id, expense_date } = params;

    const where = {
        company_id: companyId,
        is_active: 1,
        effective_from: { [Op.lte]: expense_date },
        [Op.or]: [
            { effective_to: null },
            { effective_to: { [Op.gte]: expense_date } }
        ]
    };

    if (city_tier) {
        where.city_tier = city_tier;
    }

    // Get all matching rates
    const rates = await ExpensePerDiemRate.findAll({
        where,
        order: [['location_group_id', 'DESC']] // Location-specific first
    });

    // Find best match
    for (const rate of rates) {
        // Check location match
        if (rate.location_group_id && rate.location_group_id !== location_group_id) {
            continue;
        }

        // Check grade match
        if (rate.grade_ids && rate.grade_ids.length > 0) {
            if (!rate.grade_ids.includes(grade_id)) {
                continue;
            }
        }

        // Check designation match
        if (rate.designation_ids && rate.designation_ids.length > 0) {
            if (!rate.designation_ids.includes(designation_id)) {
                continue;
            }
        }

        return rate;
    }

    return null;
};

/**
 * Check if submission window is open
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Window status
 */
const checkSubmissionWindow = async (companyId) => {
    const settings = await getSettings(companyId);

    if (!settings.submission_window_enabled) {
        return { isOpen: true, message: 'Submission window not configured' };
    }

    const now = new Date();
    const currentDay = now.getDate();
    const currentTime = now.toTimeString().slice(0, 8);

    const startDay = settings.submission_window_start_day;
    const endDay = settings.submission_window_end_day;
    const startTime = settings.submission_window_start_time;
    const endTime = settings.submission_window_end_time;

    let isOpen = false;
    let message = '';

    if (settings.submission_window_type === 'Monthly') {
        if (currentDay >= startDay && currentDay <= endDay) {
            if (currentDay === startDay && currentTime < startTime) {
                message = `Window opens at ${startTime} on day ${startDay}`;
            } else if (currentDay === endDay && currentTime > endTime) {
                message = `Window closed at ${endTime} on day ${endDay}`;
            } else {
                isOpen = true;
                message = `Window open until day ${endDay} at ${endTime}`;
            }
        } else {
            message = `Window opens on day ${startDay} at ${startTime}`;
        }
    }

    // Check late submission
    if (!isOpen && settings.allow_late_submission) {
        const daysAfterClose = currentDay - endDay;
        if (daysAfterClose > 0 && daysAfterClose <= settings.late_submission_max_days) {
            isOpen = true;
            message = `Late submission allowed with ${settings.late_submission_penalty_percent}% penalty`;
        }
    }

    return { isOpen, message, settings };
};

module.exports = {
    // General Settings
    getSettings,
    updateSettings,
    updateSettingsSection,

    // Mileage Rates
    getMileageRates,
    createMileageRate,
    updateMileageRate,
    deleteMileageRate,
    getApplicableMileageRate,

    // Per Diem Rates
    getPerDiemRates,
    createPerDiemRate,
    updatePerDiemRate,
    deletePerDiemRate,
    getApplicablePerDiemRate,

    // Utilities
    checkSubmissionWindow
};
