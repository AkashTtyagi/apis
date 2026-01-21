/**
 * Currency Service
 * Business logic for currency management
 */

const {
    ExpenseCurrency,
    ExpenseExchangeRate,
    ExpenseCurrencyPolicy,
    ExpenseExchangeRateHistory
} = require('../../../models/expense');
const { sequelize } = require('../../../utils/database');
const { Op } = require('sequelize');

/**
 * Create a new currency
 * @param {Object} data - Currency data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is creating
 * @returns {Promise<Object>} Created currency
 */
const createCurrency = async (data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            currency_code,
            currency_name,
            currency_symbol,
            currency_symbol_position,
            decimal_places,
            decimal_separator,
            thousands_separator,
            is_base_currency,
            is_default_expense_currency,
            country_id,
            is_active
        } = data;

        // Validate required fields
        if (!currency_code || currency_code.trim() === '') {
            throw new Error('Currency code is required');
        }

        if (!currency_name || currency_name.trim() === '') {
            throw new Error('Currency name is required');
        }

        if (!currency_symbol || currency_symbol.trim() === '') {
            throw new Error('Currency symbol is required');
        }

        // Validate currency code format (3-letter ISO 4217)
        const codeRegex = /^[A-Z]{3}$/;
        if (!codeRegex.test(currency_code.trim().toUpperCase())) {
            throw new Error('Currency code must be a valid 3-letter ISO 4217 code');
        }

        // Validate decimal_places (0-4)
        if (decimal_places !== undefined && (decimal_places < 0 || decimal_places > 4)) {
            throw new Error('Decimal places must be between 0 and 4');
        }

        // Check for duplicate currency_code within the company (active)
        const existingCurrency = await ExpenseCurrency.findOne({
            where: {
                company_id: companyId,
                currency_code: currency_code.trim().toUpperCase(),
                deleted_at: null
            },
            transaction
        });

        if (existingCurrency) {
            throw new Error('A currency with this code already exists');
        }

        // Check if a deleted currency with same code exists - if so, restore it
        const deletedCurrency = await ExpenseCurrency.findOne({
            where: {
                company_id: companyId,
                currency_code: currency_code.trim().toUpperCase(),
                deleted_at: { [Op.ne]: null }
            },
            transaction
        });

        // If setting as base currency, unset existing base currency
        if (is_base_currency) {
            await ExpenseCurrency.update(
                { is_base_currency: 0, updated_by: userId },
                {
                    where: {
                        company_id: companyId,
                        is_base_currency: 1,
                        deleted_at: null
                    },
                    transaction
                }
            );
        }

        // If setting as default expense currency, unset existing default
        if (is_default_expense_currency) {
            await ExpenseCurrency.update(
                { is_default_expense_currency: 0, updated_by: userId },
                {
                    where: {
                        company_id: companyId,
                        is_default_expense_currency: 1,
                        deleted_at: null
                    },
                    transaction
                }
            );
        }

        let currency;

        // If deleted currency exists, restore and update it
        if (deletedCurrency) {
            await deletedCurrency.update({
                currency_name: currency_name.trim(),
                currency_symbol: currency_symbol.trim(),
                currency_symbol_position: currency_symbol_position || 'Before',
                decimal_places: decimal_places !== undefined ? decimal_places : 2,
                decimal_separator: decimal_separator || '.',
                thousands_separator: thousands_separator || ',',
                is_base_currency: is_base_currency ? 1 : 0,
                is_default_expense_currency: is_default_expense_currency ? 1 : 0,
                country_id: country_id || null,
                is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1,
                deleted_at: null,
                deleted_by: null,
                updated_by: userId
            }, { transaction });
            currency = deletedCurrency;
        } else {
            // Create the currency
            currency = await ExpenseCurrency.create({
                company_id: companyId,
                currency_code: currency_code.trim().toUpperCase(),
                currency_name: currency_name.trim(),
                currency_symbol: currency_symbol.trim(),
                currency_symbol_position: currency_symbol_position || 'Before',
                decimal_places: decimal_places !== undefined ? decimal_places : 2,
                decimal_separator: decimal_separator || '.',
                thousands_separator: thousands_separator || ',',
                is_base_currency: is_base_currency ? 1 : 0,
                is_default_expense_currency: is_default_expense_currency ? 1 : 0,
                country_id: country_id || null,
                is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1,
                created_by: userId
            }, { transaction });
        }

        await transaction.commit();

        return {
            success: true,
            message: 'Currency added successfully',
            data: {
                id: currency.id,
                currency_code: currency.currency_code,
                currency_name: currency.currency_name,
                currency_symbol: currency.currency_symbol,
                is_base_currency: currency.is_base_currency === 1,
                is_active: currency.is_active === 1,
                created_at: currency.created_at
            }
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get all currencies with filters
 * @param {Object} filters - Filter options
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} List of currencies
 */
const getAllCurrencies = async (filters, companyId) => {
    const {
        is_active,
        search,
        limit = 50,
        offset = 0,
        sort_by = 'currency_code',
        sort_order = 'asc'
    } = filters;

    const whereConditions = {
        company_id: companyId,
        deleted_at: null
    };

    if (is_active !== undefined) {
        whereConditions.is_active = is_active ? 1 : 0;
    }

    if (search && search.trim() !== '') {
        whereConditions[Op.or] = [
            { currency_code: { [Op.like]: `%${search.trim()}%` } },
            { currency_name: { [Op.like]: `%${search.trim()}%` } }
        ];
    }

    const validSortFields = ['currency_code', 'currency_name', 'is_base_currency', 'created_at'];
    const orderField = validSortFields.includes(sort_by) ? sort_by : 'currency_code';
    const orderDirection = sort_order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const { count, rows: currencies } = await ExpenseCurrency.findAndCountAll({
        where: whereConditions,
        order: [[orderField, orderDirection]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
            {
                model: ExpenseExchangeRate,
                as: 'ratesFrom',
                required: false,
                where: {
                    is_active: 1,
                    effective_to: null
                },
                attributes: ['id', 'exchange_rate', 'to_currency_id']
            }
        ]
    });

    // Get base currency for rate calculation
    const baseCurrency = await ExpenseCurrency.findOne({
        where: {
            company_id: companyId,
            is_base_currency: 1,
            deleted_at: null
        }
    });

    const formattedCurrencies = currencies.map(currency => {
        const currencyData = currency.toJSON();

        // Find rate to base currency
        let latestRateToBase = null;
        if (baseCurrency && currency.id !== baseCurrency.id && currencyData.ratesFrom) {
            const rateToBase = currencyData.ratesFrom.find(r => r.to_currency_id === baseCurrency.id);
            if (rateToBase) {
                latestRateToBase = parseFloat(rateToBase.exchange_rate);
            }
        }

        return {
            id: currencyData.id,
            currency_code: currencyData.currency_code,
            currency_name: currencyData.currency_name,
            currency_symbol: currencyData.currency_symbol,
            currency_symbol_position: currencyData.currency_symbol_position,
            decimal_places: currencyData.decimal_places,
            is_base_currency: currencyData.is_base_currency === 1,
            is_default_expense_currency: currencyData.is_default_expense_currency === 1,
            is_active: currencyData.is_active === 1,
            exchange_rates_count: currencyData.ratesFrom ? currencyData.ratesFrom.length : 0,
            latest_rate_to_base: latestRateToBase,
            created_at: currencyData.created_at
        };
    });

    return {
        success: true,
        data: formattedCurrencies,
        pagination: {
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            total_pages: Math.ceil(count / limit),
            current_page: Math.floor(offset / limit) + 1
        }
    };
};

/**
 * Get currency details with exchange rates
 * @param {number} currencyId - Currency ID
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Currency details
 */
const getCurrencyDetails = async (currencyId, companyId) => {
    const currency = await ExpenseCurrency.findOne({
        where: {
            id: currencyId,
            company_id: companyId,
            deleted_at: null
        }
    });

    if (!currency) {
        throw new Error('Currency not found');
    }

    // Get base currency
    const baseCurrency = await ExpenseCurrency.findOne({
        where: {
            company_id: companyId,
            is_base_currency: 1,
            deleted_at: null
        }
    });

    // Get current exchange rate to base currency
    let currentExchangeRate = null;
    let recentRates = [];

    if (baseCurrency && currency.id !== baseCurrency.id) {
        const today = new Date().toISOString().split('T')[0];

        currentExchangeRate = await ExpenseExchangeRate.findOne({
            where: {
                company_id: companyId,
                from_currency_id: currency.id,
                to_currency_id: baseCurrency.id,
                is_active: 1,
                effective_from: { [Op.lte]: today },
                [Op.or]: [
                    { effective_to: null },
                    { effective_to: { [Op.gte]: today } }
                ]
            },
            order: [['effective_from', 'DESC']]
        });

        // Get recent rates history
        recentRates = await ExpenseExchangeRate.findAll({
            where: {
                company_id: companyId,
                from_currency_id: currency.id,
                to_currency_id: baseCurrency.id
            },
            order: [['effective_from', 'DESC']],
            limit: 10
        });
    }

    return {
        success: true,
        data: {
            id: currency.id,
            currency_code: currency.currency_code,
            currency_name: currency.currency_name,
            currency_symbol: currency.currency_symbol,
            currency_symbol_position: currency.currency_symbol_position,
            decimal_places: currency.decimal_places,
            decimal_separator: currency.decimal_separator,
            thousands_separator: currency.thousands_separator,
            is_base_currency: currency.is_base_currency === 1,
            is_default_expense_currency: currency.is_default_expense_currency === 1,
            country_id: currency.country_id,
            is_active: currency.is_active === 1,
            current_exchange_rate: currentExchangeRate ? {
                id: currentExchangeRate.id,
                to_currency: baseCurrency.currency_code,
                rate: parseFloat(currentExchangeRate.exchange_rate),
                effective_from: currentExchangeRate.effective_from,
                rate_source: currentExchangeRate.rate_source
            } : null,
            recent_rates: recentRates.map(rate => ({
                id: rate.id,
                rate: parseFloat(rate.exchange_rate),
                effective_from: rate.effective_from,
                effective_to: rate.effective_to
            })),
            created_by: currency.created_by,
            created_at: currency.created_at,
            updated_by: currency.updated_by,
            updated_at: currency.updated_at
        }
    };
};

/**
 * Update a currency
 * @param {Object} data - Update data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is updating
 * @returns {Promise<Object>} Updated currency
 */
const updateCurrency = async (data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            currency_id,
            currency_name,
            currency_symbol,
            currency_symbol_position,
            decimal_places,
            decimal_separator,
            thousands_separator,
            is_base_currency,
            is_default_expense_currency,
            country_id,
            is_active
        } = data;

        const currency = await ExpenseCurrency.findOne({
            where: {
                id: currency_id,
                company_id: companyId,
                deleted_at: null
            },
            transaction
        });

        if (!currency) {
            throw new Error('Currency not found');
        }

        // Validate decimal_places if provided
        if (decimal_places !== undefined && (decimal_places < 0 || decimal_places > 4)) {
            throw new Error('Decimal places must be between 0 and 4');
        }

        // If setting as base currency, unset existing base currency
        if (is_base_currency && currency.is_base_currency !== 1) {
            await ExpenseCurrency.update(
                { is_base_currency: 0, updated_by: userId },
                {
                    where: {
                        company_id: companyId,
                        is_base_currency: 1,
                        id: { [Op.ne]: currency_id },
                        deleted_at: null
                    },
                    transaction
                }
            );
        }

        // If setting as default expense currency, unset existing default
        if (is_default_expense_currency && currency.is_default_expense_currency !== 1) {
            await ExpenseCurrency.update(
                { is_default_expense_currency: 0, updated_by: userId },
                {
                    where: {
                        company_id: companyId,
                        is_default_expense_currency: 1,
                        id: { [Op.ne]: currency_id },
                        deleted_at: null
                    },
                    transaction
                }
            );
        }

        // Update currency fields
        const updateData = { updated_by: userId };

        if (currency_name !== undefined) updateData.currency_name = currency_name.trim();
        if (currency_symbol !== undefined) updateData.currency_symbol = currency_symbol.trim();
        if (currency_symbol_position !== undefined) updateData.currency_symbol_position = currency_symbol_position;
        if (decimal_places !== undefined) updateData.decimal_places = decimal_places;
        if (decimal_separator !== undefined) updateData.decimal_separator = decimal_separator;
        if (thousands_separator !== undefined) updateData.thousands_separator = thousands_separator;
        if (is_base_currency !== undefined) updateData.is_base_currency = is_base_currency ? 1 : 0;
        if (is_default_expense_currency !== undefined) updateData.is_default_expense_currency = is_default_expense_currency ? 1 : 0;
        if (country_id !== undefined) updateData.country_id = country_id;
        if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

        await currency.update(updateData, { transaction });

        await transaction.commit();

        return {
            success: true,
            message: 'Currency updated successfully',
            data: {
                id: currency.id,
                currency_code: currency.currency_code,
                currency_name: currency.currency_name,
                updated_at: currency.updated_at
            }
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Delete a currency (soft delete)
 * @param {number} currencyId - Currency ID
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID who is deleting
 * @returns {Promise<Object>} Delete result
 */
const deleteCurrency = async (currencyId, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const currency = await ExpenseCurrency.findOne({
            where: {
                id: currencyId,
                company_id: companyId,
                deleted_at: null
            },
            transaction
        });

        if (!currency) {
            throw new Error('Currency not found');
        }

        // Cannot delete base currency
        if (currency.is_base_currency === 1) {
            throw new Error('Cannot delete base currency. Please set another currency as base first.');
        }

        // TODO: Check if expenses exist in this currency
        // const expenseCount = await Expense.count({ where: { currency_id: currencyId } });
        // if (expenseCount > 0) {
        //     throw new Error('Cannot delete currency with existing expenses');
        // }

        // Soft delete the currency
        await currency.update({
            deleted_at: new Date(),
            deleted_by: userId,
            is_active: 0
        }, { transaction });

        // Deactivate related exchange rates
        await ExpenseExchangeRate.update(
            { is_active: 0, updated_by: userId },
            {
                where: {
                    company_id: companyId,
                    [Op.or]: [
                        { from_currency_id: currencyId },
                        { to_currency_id: currencyId }
                    ]
                },
                transaction
            }
        );

        await transaction.commit();

        return {
            success: true,
            message: 'Currency deleted successfully'
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Set base currency
 * @param {number} currencyId - Currency ID
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Result
 */
const setBaseCurrency = async (currencyId, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const currency = await ExpenseCurrency.findOne({
            where: {
                id: currencyId,
                company_id: companyId,
                deleted_at: null,
                is_active: 1
            },
            transaction
        });

        if (!currency) {
            throw new Error('Currency not found or inactive');
        }

        // Unset existing base currency
        await ExpenseCurrency.update(
            { is_base_currency: 0, updated_by: userId },
            {
                where: {
                    company_id: companyId,
                    is_base_currency: 1,
                    deleted_at: null
                },
                transaction
            }
        );

        // Set new base currency
        await currency.update({
            is_base_currency: 1,
            updated_by: userId
        }, { transaction });

        await transaction.commit();

        return {
            success: true,
            message: 'Base currency updated successfully',
            data: {
                base_currency: {
                    id: currency.id,
                    currency_code: currency.currency_code,
                    currency_name: currency.currency_name
                }
            }
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Add or update exchange rate
 * @param {Object} data - Exchange rate data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Created/updated rate
 */
const upsertExchangeRate = async (data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            from_currency_id,
            to_currency_id,
            exchange_rate,
            effective_from,
            effective_to,
            rate_source,
            source_reference,
            change_reason
        } = data;

        // Validate required fields
        if (!from_currency_id || !to_currency_id) {
            throw new Error('Both from_currency_id and to_currency_id are required');
        }

        if (from_currency_id === to_currency_id) {
            throw new Error('From and To currencies must be different');
        }

        if (!exchange_rate || exchange_rate <= 0) {
            throw new Error('Exchange rate must be greater than 0');
        }

        if (!effective_from) {
            throw new Error('Effective from date is required');
        }

        // Validate currencies exist and are active
        const fromCurrency = await ExpenseCurrency.findOne({
            where: {
                id: from_currency_id,
                company_id: companyId,
                is_active: 1,
                deleted_at: null
            },
            transaction
        });

        if (!fromCurrency) {
            throw new Error('From currency not found or inactive');
        }

        const toCurrency = await ExpenseCurrency.findOne({
            where: {
                id: to_currency_id,
                company_id: companyId,
                is_active: 1,
                deleted_at: null
            },
            transaction
        });

        if (!toCurrency) {
            throw new Error('To currency not found or inactive');
        }

        // Close previous active rate for this currency pair
        const previousRate = await ExpenseExchangeRate.findOne({
            where: {
                company_id: companyId,
                from_currency_id,
                to_currency_id,
                is_active: 1,
                effective_to: null
            },
            transaction
        });

        if (previousRate) {
            // Set effective_to to day before new rate starts
            const effectiveToDate = new Date(effective_from);
            effectiveToDate.setDate(effectiveToDate.getDate() - 1);

            await previousRate.update({
                effective_to: effectiveToDate.toISOString().split('T')[0],
                updated_by: userId
            }, { transaction });

            // Log the update
            await ExpenseExchangeRateHistory.create({
                exchange_rate_id: previousRate.id,
                company_id: companyId,
                action: 'Update',
                old_rate: previousRate.exchange_rate,
                new_rate: previousRate.exchange_rate,
                old_effective_from: previousRate.effective_from,
                new_effective_from: previousRate.effective_from,
                old_effective_to: null,
                new_effective_to: effectiveToDate.toISOString().split('T')[0],
                change_reason: 'Auto-closed due to new rate',
                changed_by: userId
            }, { transaction });
        }

        // Create new exchange rate
        const newRate = await ExpenseExchangeRate.create({
            company_id: companyId,
            from_currency_id,
            to_currency_id,
            exchange_rate,
            effective_from,
            effective_to: effective_to || null,
            rate_source: rate_source || 'Manual',
            source_reference: source_reference || null,
            is_active: 1,
            created_by: userId
        }, { transaction });

        // Log the creation
        await ExpenseExchangeRateHistory.create({
            exchange_rate_id: newRate.id,
            company_id: companyId,
            action: 'Create',
            old_rate: null,
            new_rate: exchange_rate,
            old_effective_from: null,
            new_effective_from: effective_from,
            old_effective_to: null,
            new_effective_to: effective_to || null,
            change_reason: change_reason || 'New rate created',
            changed_by: userId
        }, { transaction });

        await transaction.commit();

        return {
            success: true,
            message: 'Exchange rate added successfully',
            data: {
                id: newRate.id,
                from_currency: fromCurrency.currency_code,
                to_currency: toCurrency.currency_code,
                exchange_rate: parseFloat(newRate.exchange_rate),
                effective_from: newRate.effective_from,
                effective_to: newRate.effective_to,
                created_at: newRate.created_at
            }
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get exchange rates with optional history
 * @param {Object} filters - Filter options
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Exchange rates
 */
const getExchangeRates = async (filters, companyId) => {
    const {
        from_currency_id,
        to_currency_id,
        effective_date,
        include_history = false,
        include_inactive = false,
        limit = 50,
        offset = 0
    } = filters;

    const whereConditions = {
        company_id: companyId
    };

    if (from_currency_id) {
        whereConditions.from_currency_id = from_currency_id;
    }

    if (to_currency_id) {
        whereConditions.to_currency_id = to_currency_id;
    }

    // Apply inactive filter
    if (!include_inactive) {
        whereConditions.is_active = 1;
    }

    // If both currencies are specified, get the current rate for that pair
    let currentRate = null;
    if (from_currency_id && to_currency_id) {
        const dateToCheck = effective_date || new Date().toISOString().split('T')[0];

        const currentRateWhere = {
            company_id: companyId,
            from_currency_id,
            to_currency_id,
            effective_from: { [Op.lte]: dateToCheck },
            [Op.or]: [
                { effective_to: null },
                { effective_to: { [Op.gte]: dateToCheck } }
            ]
        };

        if (!include_inactive) {
            currentRateWhere.is_active = 1;
        }

        currentRate = await ExpenseExchangeRate.findOne({
            where: currentRateWhere,
            include: [
                {
                    model: ExpenseCurrency,
                    as: 'fromCurrency',
                    attributes: ['currency_code', 'currency_name']
                },
                {
                    model: ExpenseCurrency,
                    as: 'toCurrency',
                    attributes: ['currency_code', 'currency_name']
                }
            ],
            order: [['effective_from', 'DESC']]
        });
    }

    // Get all exchange rates matching the filters (list mode)
    const { count, rows: rates } = await ExpenseExchangeRate.findAndCountAll({
        where: whereConditions,
        include: [
            {
                model: ExpenseCurrency,
                as: 'fromCurrency',
                attributes: ['id', 'currency_code', 'currency_name', 'currency_symbol']
            },
            {
                model: ExpenseCurrency,
                as: 'toCurrency',
                attributes: ['id', 'currency_code', 'currency_name', 'currency_symbol']
            }
        ],
        order: [['effective_from', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    // Get history if requested (for specific currency pair)
    let history = [];
    if (include_history && from_currency_id && to_currency_id) {
        history = await ExpenseExchangeRate.findAll({
            where: {
                company_id: companyId,
                from_currency_id,
                to_currency_id
            },
            order: [['effective_from', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    }

    const formattedCurrentRate = currentRate ? {
        id: currentRate.id,
        from_currency_code: currentRate.fromCurrency.currency_code,
        from_currency_name: currentRate.fromCurrency.currency_name,
        to_currency_code: currentRate.toCurrency.currency_code,
        to_currency_name: currentRate.toCurrency.currency_name,
        exchange_rate: parseFloat(currentRate.exchange_rate),
        effective_from: currentRate.effective_from,
        effective_to: currentRate.effective_to,
        rate_source: currentRate.rate_source,
        is_active: currentRate.is_active === 1
    } : null;

    const formattedRates = rates.map(rate => ({
        id: rate.id,
        from_currency_id: rate.from_currency_id,
        from_currency_code: rate.fromCurrency.currency_code,
        from_currency_name: rate.fromCurrency.currency_name,
        to_currency_id: rate.to_currency_id,
        to_currency_code: rate.toCurrency.currency_code,
        to_currency_name: rate.toCurrency.currency_name,
        exchange_rate: parseFloat(rate.exchange_rate),
        effective_from: rate.effective_from,
        effective_to: rate.effective_to,
        rate_source: rate.rate_source,
        is_active: rate.is_active === 1,
        created_at: rate.created_at
    }));

    const formattedHistory = history.map(rate => ({
        id: rate.id,
        exchange_rate: parseFloat(rate.exchange_rate),
        effective_from: rate.effective_from,
        effective_to: rate.effective_to,
        rate_source: rate.rate_source,
        created_at: rate.created_at
    }));

    return {
        success: true,
        data: {
            rates: formattedRates,
            current_rate: formattedCurrentRate,
            history: formattedHistory
        },
        pagination: {
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            total_pages: Math.ceil(count / limit),
            current_page: Math.floor(offset / limit) + 1
        }
    };
};

/**
 * Delete exchange rate
 * @param {number} exchangeRateId - Exchange rate ID
 * @param {string} deleteReason - Reason for deletion
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Result
 */
const deleteExchangeRate = async (exchangeRateId, deleteReason, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const rate = await ExpenseExchangeRate.findOne({
            where: {
                id: exchangeRateId,
                company_id: companyId
            },
            transaction
        });

        if (!rate) {
            throw new Error('Exchange rate not found');
        }

        // Log the deactivation
        await ExpenseExchangeRateHistory.create({
            exchange_rate_id: rate.id,
            company_id: companyId,
            action: 'Deactivate',
            old_rate: rate.exchange_rate,
            new_rate: null,
            old_effective_from: rate.effective_from,
            new_effective_from: null,
            old_effective_to: rate.effective_to,
            new_effective_to: null,
            change_reason: deleteReason || 'Rate deleted',
            changed_by: userId
        }, { transaction });

        // Deactivate the rate
        await rate.update({
            is_active: 0,
            updated_by: userId
        }, { transaction });

        await transaction.commit();

        return {
            success: true,
            message: 'Exchange rate deleted successfully'
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Bulk update exchange rates
 * @param {Object} data - Bulk update data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Result
 */
const bulkUpdateRates = async (data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            effective_from,
            rate_source,
            source_reference,
            rates
        } = data;

        if (!rates || rates.length === 0) {
            throw new Error('No rates provided for update');
        }

        if (!effective_from) {
            throw new Error('Effective from date is required');
        }

        const updatedRates = [];

        for (const rateData of rates) {
            const { from_currency_id, to_currency_id, exchange_rate } = rateData;

            // Validate currencies
            const fromCurrency = await ExpenseCurrency.findOne({
                where: {
                    id: from_currency_id,
                    company_id: companyId,
                    is_active: 1,
                    deleted_at: null
                },
                transaction
            });

            const toCurrency = await ExpenseCurrency.findOne({
                where: {
                    id: to_currency_id,
                    company_id: companyId,
                    is_active: 1,
                    deleted_at: null
                },
                transaction
            });

            if (!fromCurrency || !toCurrency) {
                continue; // Skip invalid currency pairs
            }

            // Close previous active rate
            const previousRate = await ExpenseExchangeRate.findOne({
                where: {
                    company_id: companyId,
                    from_currency_id,
                    to_currency_id,
                    is_active: 1,
                    effective_to: null
                },
                transaction
            });

            if (previousRate) {
                const effectiveToDate = new Date(effective_from);
                effectiveToDate.setDate(effectiveToDate.getDate() - 1);

                await previousRate.update({
                    effective_to: effectiveToDate.toISOString().split('T')[0],
                    updated_by: userId
                }, { transaction });
            }

            // Create new rate
            const newRate = await ExpenseExchangeRate.create({
                company_id: companyId,
                from_currency_id,
                to_currency_id,
                exchange_rate,
                effective_from,
                effective_to: null,
                rate_source: rate_source || 'Manual',
                source_reference: source_reference || null,
                is_active: 1,
                created_by: userId
            }, { transaction });

            // Log creation
            await ExpenseExchangeRateHistory.create({
                exchange_rate_id: newRate.id,
                company_id: companyId,
                action: 'Create',
                old_rate: null,
                new_rate: exchange_rate,
                old_effective_from: null,
                new_effective_from: effective_from,
                change_reason: 'Bulk rate update',
                changed_by: userId
            }, { transaction });

            updatedRates.push({
                from: fromCurrency.currency_code,
                to: toCurrency.currency_code,
                rate: exchange_rate
            });
        }

        await transaction.commit();

        return {
            success: true,
            message: 'Exchange rates updated successfully',
            data: {
                updated_count: updatedRates.length,
                rates: updatedRates
            }
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get currency policy
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Currency policy
 */
const getCurrencyPolicy = async (companyId) => {
    let policy = await ExpenseCurrencyPolicy.findOne({
        where: { company_id: companyId }
    });

    // If no policy exists, return defaults
    if (!policy) {
        policy = {
            allow_multi_currency_expenses: 1,
            auto_convert_to_base: 1,
            conversion_timing: 'Submission',
            rate_tolerance_percentage: 5.00,
            allow_manual_rate_override: 0,
            require_rate_justification: 1,
            rounding_method: 'Round',
            rounding_precision: 2,
            use_expense_date_rate: 1,
            fallback_to_nearest_rate: 1,
            max_rate_age_days: 7,
            show_original_amount: 1,
            show_conversion_rate: 1
        };
    }

    // Get base currency and default expense currency
    const baseCurrency = await ExpenseCurrency.findOne({
        where: {
            company_id: companyId,
            is_base_currency: 1,
            deleted_at: null
        },
        attributes: ['id', 'currency_code', 'currency_name', 'currency_symbol']
    });

    const defaultExpenseCurrency = await ExpenseCurrency.findOne({
        where: {
            company_id: companyId,
            is_default_expense_currency: 1,
            deleted_at: null
        },
        attributes: ['id', 'currency_code', 'currency_name', 'currency_symbol']
    });

    const policyData = policy.toJSON ? policy.toJSON() : policy;

    return {
        success: true,
        data: {
            id: policyData.id || null,
            allow_multi_currency_expenses: policyData.allow_multi_currency_expenses === 1,
            auto_convert_to_base: policyData.auto_convert_to_base === 1,
            conversion_timing: policyData.conversion_timing,
            rate_tolerance_percentage: parseFloat(policyData.rate_tolerance_percentage),
            allow_manual_rate_override: policyData.allow_manual_rate_override === 1,
            require_rate_justification: policyData.require_rate_justification === 1,
            rounding_method: policyData.rounding_method,
            rounding_precision: policyData.rounding_precision,
            use_expense_date_rate: policyData.use_expense_date_rate === 1,
            fallback_to_nearest_rate: policyData.fallback_to_nearest_rate === 1,
            max_rate_age_days: policyData.max_rate_age_days,
            show_original_amount: policyData.show_original_amount === 1,
            show_conversion_rate: policyData.show_conversion_rate === 1,
            base_currency: baseCurrency ? {
                id: baseCurrency.id,
                code: baseCurrency.currency_code,
                name: baseCurrency.currency_name,
                symbol: baseCurrency.currency_symbol
            } : null,
            default_expense_currency: defaultExpenseCurrency ? {
                id: defaultExpenseCurrency.id,
                code: defaultExpenseCurrency.currency_code,
                name: defaultExpenseCurrency.currency_name,
                symbol: defaultExpenseCurrency.currency_symbol
            } : null
        }
    };
};

/**
 * Update currency policy
 * @param {Object} data - Policy data
 * @param {number} companyId - Company ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated policy
 */
const updateCurrencyPolicy = async (data, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        let policy = await ExpenseCurrencyPolicy.findOne({
            where: { company_id: companyId },
            transaction
        });

        const updateData = { updated_by: userId };

        if (data.allow_multi_currency_expenses !== undefined) {
            updateData.allow_multi_currency_expenses = data.allow_multi_currency_expenses ? 1 : 0;
        }
        if (data.auto_convert_to_base !== undefined) {
            updateData.auto_convert_to_base = data.auto_convert_to_base ? 1 : 0;
        }
        if (data.conversion_timing !== undefined) {
            updateData.conversion_timing = data.conversion_timing;
        }
        if (data.rate_tolerance_percentage !== undefined) {
            updateData.rate_tolerance_percentage = data.rate_tolerance_percentage;
        }
        if (data.allow_manual_rate_override !== undefined) {
            updateData.allow_manual_rate_override = data.allow_manual_rate_override ? 1 : 0;
        }
        if (data.require_rate_justification !== undefined) {
            updateData.require_rate_justification = data.require_rate_justification ? 1 : 0;
        }
        if (data.rounding_method !== undefined) {
            updateData.rounding_method = data.rounding_method;
        }
        if (data.rounding_precision !== undefined) {
            updateData.rounding_precision = data.rounding_precision;
        }
        if (data.use_expense_date_rate !== undefined) {
            updateData.use_expense_date_rate = data.use_expense_date_rate ? 1 : 0;
        }
        if (data.fallback_to_nearest_rate !== undefined) {
            updateData.fallback_to_nearest_rate = data.fallback_to_nearest_rate ? 1 : 0;
        }
        if (data.max_rate_age_days !== undefined) {
            updateData.max_rate_age_days = data.max_rate_age_days;
        }
        if (data.show_original_amount !== undefined) {
            updateData.show_original_amount = data.show_original_amount ? 1 : 0;
        }
        if (data.show_conversion_rate !== undefined) {
            updateData.show_conversion_rate = data.show_conversion_rate ? 1 : 0;
        }

        if (policy) {
            await policy.update(updateData, { transaction });
        } else {
            // Create new policy
            policy = await ExpenseCurrencyPolicy.create({
                company_id: companyId,
                ...updateData,
                created_by: userId
            }, { transaction });
        }

        await transaction.commit();

        return {
            success: true,
            message: 'Currency policy updated successfully',
            data: {
                id: policy.id,
                updated_at: policy.updated_at
            }
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Convert amount between currencies
 * @param {Object} data - Conversion data
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Converted amount
 */
const convertAmount = async (data, companyId) => {
    const {
        amount,
        from_currency_id,
        to_currency_id,
        conversion_date
    } = data;

    if (!amount || amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    if (!from_currency_id || !to_currency_id) {
        throw new Error('Both from_currency_id and to_currency_id are required');
    }

    // Get currencies
    const fromCurrency = await ExpenseCurrency.findOne({
        where: {
            id: from_currency_id,
            company_id: companyId,
            deleted_at: null
        }
    });

    if (!fromCurrency) {
        throw new Error('From currency not found');
    }

    const toCurrency = await ExpenseCurrency.findOne({
        where: {
            id: to_currency_id,
            company_id: companyId,
            deleted_at: null
        }
    });

    if (!toCurrency) {
        throw new Error('To currency not found');
    }

    // If same currency, return original amount
    if (from_currency_id === to_currency_id) {
        return {
            success: true,
            data: {
                original_amount: amount,
                original_currency: fromCurrency.currency_code,
                converted_amount: amount,
                target_currency: toCurrency.currency_code,
                exchange_rate: 1,
                rate_date: conversion_date || new Date().toISOString().split('T')[0],
                rate_source: 'Same Currency'
            }
        };
    }

    // Get exchange rate for the date
    const dateToCheck = conversion_date || new Date().toISOString().split('T')[0];

    const rate = await ExpenseExchangeRate.findOne({
        where: {
            company_id: companyId,
            from_currency_id,
            to_currency_id,
            is_active: 1,
            effective_from: { [Op.lte]: dateToCheck },
            [Op.or]: [
                { effective_to: null },
                { effective_to: { [Op.gte]: dateToCheck } }
            ]
        },
        order: [['effective_from', 'DESC']]
    });

    if (!rate) {
        throw new Error(`No exchange rate found for ${fromCurrency.currency_code} to ${toCurrency.currency_code} on ${dateToCheck}`);
    }

    // Get policy for rounding
    const policy = await ExpenseCurrencyPolicy.findOne({
        where: { company_id: companyId }
    });

    const exchangeRate = parseFloat(rate.exchange_rate);
    let convertedAmount = amount * exchangeRate;

    // Apply rounding based on policy
    const roundingMethod = policy?.rounding_method || 'Round';
    const precision = policy?.rounding_precision || 2;

    switch (roundingMethod) {
        case 'Floor':
            convertedAmount = Math.floor(convertedAmount * Math.pow(10, precision)) / Math.pow(10, precision);
            break;
        case 'Ceiling':
            convertedAmount = Math.ceil(convertedAmount * Math.pow(10, precision)) / Math.pow(10, precision);
            break;
        case 'Truncate':
            convertedAmount = Math.trunc(convertedAmount * Math.pow(10, precision)) / Math.pow(10, precision);
            break;
        case 'Round':
        default:
            convertedAmount = Math.round(convertedAmount * Math.pow(10, precision)) / Math.pow(10, precision);
            break;
    }

    return {
        success: true,
        data: {
            original_amount: amount,
            original_currency: fromCurrency.currency_code,
            converted_amount: convertedAmount,
            target_currency: toCurrency.currency_code,
            exchange_rate: exchangeRate,
            rate_date: rate.effective_from,
            rate_source: rate.rate_source
        }
    };
};

/**
 * Get dropdown data for currency forms
 * @param {boolean} includeInactive - Include inactive currencies
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Dropdown data
 */
const getDropdownData = async (includeInactive, companyId) => {
    const whereConditions = {
        company_id: companyId,
        deleted_at: null
    };

    if (!includeInactive) {
        whereConditions.is_active = 1;
    }

    const currencies = await ExpenseCurrency.findAll({
        where: whereConditions,
        attributes: ['id', 'currency_code', 'currency_name', 'currency_symbol', 'is_base_currency', 'is_default_expense_currency'],
        order: [['currency_code', 'ASC']]
    });

    return {
        success: true,
        data: {
            currencies: currencies.map(c => ({
                id: c.id,
                code: c.currency_code,
                name: c.currency_name,
                symbol: c.currency_symbol,
                is_base: c.is_base_currency === 1,
                is_default: c.is_default_expense_currency === 1
            })),
            symbol_positions: [
                { value: 'Before', label: 'Before Amount ($100)' },
                { value: 'After', label: 'After Amount (100$)' }
            ],
            rounding_methods: [
                { value: 'Round', label: 'Round (Standard)' },
                { value: 'Floor', label: 'Floor (Round Down)' },
                { value: 'Ceiling', label: 'Ceiling (Round Up)' },
                { value: 'Truncate', label: 'Truncate (Cut Off)' }
            ],
            conversion_timings: [
                { value: 'Submission', label: 'At Submission' },
                { value: 'Approval', label: 'At Approval' },
                { value: 'Payment', label: 'At Payment' }
            ],
            rate_sources: [
                { value: 'Manual', label: 'Manual Entry' },
                { value: 'API', label: 'External API' },
                { value: 'Bank', label: 'Bank Rate' }
            ]
        }
    };
};

/**
 * Get exchange rate history (audit log)
 * @param {Object} filters - Filter options
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} History records
 */
const getExchangeRateHistory = async (filters, companyId) => {
    const {
        exchange_rate_id,
        from_date,
        to_date,
        limit = 50,
        offset = 0
    } = filters;

    const whereConditions = {
        company_id: companyId
    };

    if (exchange_rate_id) {
        whereConditions.exchange_rate_id = exchange_rate_id;
    }

    if (from_date) {
        whereConditions.changed_at = {
            ...whereConditions.changed_at,
            [Op.gte]: new Date(from_date)
        };
    }

    if (to_date) {
        whereConditions.changed_at = {
            ...whereConditions.changed_at,
            [Op.lte]: new Date(to_date + ' 23:59:59')
        };
    }

    const { count, rows: history } = await ExpenseExchangeRateHistory.findAndCountAll({
        where: whereConditions,
        order: [['changed_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    return {
        success: true,
        data: history.map(h => ({
            id: h.id,
            action: h.action,
            old_rate: h.old_rate ? parseFloat(h.old_rate) : null,
            new_rate: h.new_rate ? parseFloat(h.new_rate) : null,
            old_effective_from: h.old_effective_from,
            new_effective_from: h.new_effective_from,
            old_effective_to: h.old_effective_to,
            new_effective_to: h.new_effective_to,
            change_reason: h.change_reason,
            changed_by: h.changed_by,
            changed_at: h.changed_at
        })),
        pagination: {
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset)
        }
    };
};

/**
 * Check if currency is being used in other modules
 * @param {number} currencyId - Currency ID
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Usage details
 */
const checkUsage = async (currencyId, companyId) => {
    if (!currencyId) {
        throw new Error('Currency ID is required');
    }

    // Check if currency exists
    const currency = await ExpenseCurrency.findOne({
        where: {
            id: currencyId,
            company_id: companyId,
            deleted_at: null
        },
        attributes: ['id', 'currency_code', 'currency_name', 'is_base_currency', 'is_default_expense_currency']
    });

    if (!currency) {
        throw new Error('Currency not found');
    }

    const usages = [];

    // Check if it's base currency
    if (currency.is_base_currency === 1) {
        usages.push({
            module: 'Base Currency',
            count: 1,
            message: 'This is the base currency'
        });
    }

    // Check if it's default expense currency
    if (currency.is_default_expense_currency === 1) {
        usages.push({
            module: 'Default Expense Currency',
            count: 1,
            message: 'This is the default expense currency'
        });
    }

    // Check usage in Exchange Rates (as from_currency)
    const ratesFromCount = await ExpenseExchangeRate.count({
        where: {
            from_currency_id: currencyId,
            is_active: 1
        }
    });

    if (ratesFromCount > 0) {
        usages.push({
            module: 'Exchange Rates (From)',
            count: ratesFromCount,
            message: `Used as source in ${ratesFromCount} exchange rate(s)`
        });
    }

    // Check usage in Exchange Rates (as to_currency)
    const ratesToCount = await ExpenseExchangeRate.count({
        where: {
            to_currency_id: currencyId,
            is_active: 1
        }
    });

    if (ratesToCount > 0) {
        usages.push({
            module: 'Exchange Rates (To)',
            count: ratesToCount,
            message: `Used as target in ${ratesToCount} exchange rate(s)`
        });
    }

    // TODO: Check usage in Expenses (when implemented)
    // const expenseCount = await Expense.count({
    //     where: { currency_id: currencyId }
    // });

    const totalUsageCount = (currency.is_base_currency === 1 ? 1 : 0) +
                           (currency.is_default_expense_currency === 1 ? 1 : 0) +
                           ratesFromCount + ratesToCount;
    const isInUse = totalUsageCount > 0;
    const isBaseCurrency = currency.is_base_currency === 1;

    return {
        currency: {
            id: currency.id,
            currency_code: currency.currency_code,
            currency_name: currency.currency_name,
            is_base_currency: isBaseCurrency,
            is_default_expense_currency: currency.is_default_expense_currency === 1
        },
        is_in_use: isInUse,
        total_usage_count: totalUsageCount,
        usages,
        can_delete: !isBaseCurrency && !isInUse,
        message: isBaseCurrency
            ? 'Cannot delete base currency. Please set another currency as base first.'
            : isInUse
                ? `Currency is being used in ${totalUsageCount} place(s). Please remove dependencies before deleting.`
                : 'Currency is not in use and can be safely deleted.'
    };
};

module.exports = {
    createCurrency,
    getAllCurrencies,
    getCurrencyDetails,
    updateCurrency,
    deleteCurrency,
    setBaseCurrency,
    upsertExchangeRate,
    getExchangeRates,
    deleteExchangeRate,
    bulkUpdateRates,
    getCurrencyPolicy,
    updateCurrencyPolicy,
    convertAmount,
    getDropdownData,
    getExchangeRateHistory,
    checkUsage
};
