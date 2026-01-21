/**
 * Currency Controller
 * Handles HTTP requests for currency management
 */

const currencyService = require('../../services/currency.service');

/**
 * Create a new currency
 * POST /api/expense/admin/currencies/create
 */
const createCurrency = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;
        const userId = req.user?.id || req.body.user_id;

        if (!companyId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID and User ID are required'
            });
        }

        const result = await currencyService.createCurrency(req.body, companyId, userId);
        return res.status(201).json(result);
    } catch (error) {
        console.error('Error creating currency:', error);

        // Handle duplicate entry error
        if (error.name === 'SequelizeUniqueConstraintError' || error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'A currency with this code already exists'
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to create currency'
        });
    }
};

/**
 * Get all currencies with filters
 * POST /api/expense/admin/currencies/list
 */
const getAllCurrencies = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        const result = await currencyService.getAllCurrencies(req.body, companyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching currencies:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch currencies'
        });
    }
};

/**
 * Get currency details
 * POST /api/expense/admin/currencies/details
 */
const getCurrencyDetails = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;
        const { currency_id } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        if (!currency_id) {
            return res.status(400).json({
                success: false,
                message: 'Currency ID is required'
            });
        }

        const result = await currencyService.getCurrencyDetails(currency_id, companyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching currency details:', error);
        return res.status(error.message === 'Currency not found' ? 404 : 500).json({
            success: false,
            message: error.message || 'Failed to fetch currency details'
        });
    }
};

/**
 * Update currency
 * POST /api/expense/admin/currencies/update
 */
const updateCurrency = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;
        const userId = req.user?.id || req.body.user_id;

        if (!companyId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID and User ID are required'
            });
        }

        if (!req.body.currency_id) {
            return res.status(400).json({
                success: false,
                message: 'Currency ID is required'
            });
        }

        const result = await currencyService.updateCurrency(req.body, companyId, userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error updating currency:', error);
        return res.status(error.message === 'Currency not found' ? 404 : 400).json({
            success: false,
            message: error.message || 'Failed to update currency'
        });
    }
};

/**
 * Delete currency
 * POST /api/expense/admin/currencies/delete
 */
const deleteCurrency = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;
        const userId = req.user?.id || req.body.user_id;
        const { currency_id } = req.body;

        if (!companyId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID and User ID are required'
            });
        }

        if (!currency_id) {
            return res.status(400).json({
                success: false,
                message: 'Currency ID is required'
            });
        }

        const result = await currencyService.deleteCurrency(currency_id, companyId, userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting currency:', error);
        return res.status(error.message.includes('Cannot delete') ? 400 : 404).json({
            success: false,
            message: error.message || 'Failed to delete currency'
        });
    }
};

/**
 * Set base currency
 * POST /api/expense/admin/currencies/set-base
 */
const setBaseCurrency = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;
        const userId = req.user?.id || req.body.user_id;
        const { currency_id } = req.body;

        if (!companyId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID and User ID are required'
            });
        }

        if (!currency_id) {
            return res.status(400).json({
                success: false,
                message: 'Currency ID is required'
            });
        }

        const result = await currencyService.setBaseCurrency(currency_id, companyId, userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error setting base currency:', error);
        return res.status(error.message.includes('not found') ? 404 : 400).json({
            success: false,
            message: error.message || 'Failed to set base currency'
        });
    }
};

/**
 * Add/Update exchange rate
 * POST /api/expense/admin/currencies/exchange-rates/upsert
 */
const upsertExchangeRate = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;
        const userId = req.user?.id || req.body.user_id;

        if (!companyId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID and User ID are required'
            });
        }

        const result = await currencyService.upsertExchangeRate(req.body, companyId, userId);
        return res.status(201).json(result);
    } catch (error) {
        console.error('Error upserting exchange rate:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to add/update exchange rate'
        });
    }
};

/**
 * Get exchange rates
 * POST /api/expense/admin/currencies/exchange-rates/list
 */
const getExchangeRates = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        const result = await currencyService.getExchangeRates(req.body, companyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch exchange rates'
        });
    }
};

/**
 * Delete exchange rate
 * POST /api/expense/admin/currencies/exchange-rates/delete
 */
const deleteExchangeRate = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;
        const userId = req.user?.id || req.body.user_id;
        const { exchange_rate_id, delete_reason } = req.body;

        if (!companyId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID and User ID are required'
            });
        }

        if (!exchange_rate_id) {
            return res.status(400).json({
                success: false,
                message: 'Exchange rate ID is required'
            });
        }

        const result = await currencyService.deleteExchangeRate(
            exchange_rate_id,
            delete_reason,
            companyId,
            userId
        );
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting exchange rate:', error);
        return res.status(error.message.includes('not found') ? 404 : 400).json({
            success: false,
            message: error.message || 'Failed to delete exchange rate'
        });
    }
};

/**
 * Bulk update exchange rates
 * POST /api/expense/admin/currencies/exchange-rates/bulk-update
 */
const bulkUpdateRates = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;
        const userId = req.user?.id || req.body.user_id;

        if (!companyId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID and User ID are required'
            });
        }

        const result = await currencyService.bulkUpdateRates(req.body, companyId, userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error bulk updating rates:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to bulk update rates'
        });
    }
};

/**
 * Get currency policy
 * POST /api/expense/admin/currencies/policy/get
 */
const getCurrencyPolicy = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        const result = await currencyService.getCurrencyPolicy(companyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching currency policy:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch currency policy'
        });
    }
};

/**
 * Update currency policy
 * POST /api/expense/admin/currencies/policy/update
 */
const updateCurrencyPolicy = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;
        const userId = req.user?.id || req.body.user_id;

        if (!companyId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID and User ID are required'
            });
        }

        const result = await currencyService.updateCurrencyPolicy(req.body, companyId, userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error updating currency policy:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to update currency policy'
        });
    }
};

/**
 * Convert amount between currencies
 * POST /api/expense/admin/currencies/convert
 */
const convertAmount = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        const result = await currencyService.convertAmount(req.body, companyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error converting amount:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to convert amount'
        });
    }
};

/**
 * Get dropdown data for currency forms
 * POST /api/expense/admin/currencies/dropdown
 */
const getDropdownData = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;
        const { include_inactive } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        const result = await currencyService.getDropdownData(include_inactive, companyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching dropdown data:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch dropdown data'
        });
    }
};

/**
 * Get exchange rate history (audit log)
 * POST /api/expense/admin/currencies/exchange-rates/history
 */
const getExchangeRateHistory = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        const result = await currencyService.getExchangeRateHistory(req.body, companyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching exchange rate history:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch exchange rate history'
        });
    }
};

/**
 * Set default expense currency
 * POST /api/expense/admin/currencies/set-default
 */
const setDefaultExpenseCurrency = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;
        const userId = req.user?.id || req.body.user_id;
        const { currency_id, id } = req.body;

        if (!companyId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID and User ID are required'
            });
        }

        const result = await currencyService.setDefaultExpenseCurrency(currency_id || id, companyId, userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error setting default expense currency:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to set default expense currency'
        });
    }
};

/**
 * Check currency usage in other modules
 * POST /api/expense/admin/currencies/check-usage
 */
const checkUsage = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id;
        const { currency_id, id } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        const result = await currencyService.checkUsage(currency_id || id, companyId);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error checking currency usage:', error);

        if (error.message === 'Currency not found' ||
            error.message.includes('required')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to check currency usage'
        });
    }
};

module.exports = {
    createCurrency,
    getAllCurrencies,
    getCurrencyDetails,
    updateCurrency,
    deleteCurrency,
    setBaseCurrency,
    setDefaultExpenseCurrency,
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
