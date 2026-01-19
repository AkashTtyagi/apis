/**
 * Expense Models Index
 * Exports all expense-related models with associations
 */

const { ExpenseLocationGroup } = require('./ExpenseLocationGroup');
const { ExpenseLocationGroupMapping } = require('./ExpenseLocationGroupMapping');
const { ExpenseCategory } = require('./ExpenseCategory');
const { ExpenseCategoryLimit } = require('./ExpenseCategoryLimit');
const { ExpenseCategoryCustomField } = require('./ExpenseCategoryCustomField');
const { ExpenseCategoryFilingRule } = require('./ExpenseCategoryFilingRule');
const { ExpenseCurrency } = require('./ExpenseCurrency');
const { ExpenseExchangeRate } = require('./ExpenseExchangeRate');
const { ExpenseCurrencyPolicy } = require('./ExpenseCurrencyPolicy');
const { ExpenseExchangeRateHistory } = require('./ExpenseExchangeRateHistory');

// ==================== EXPENSE CATEGORY ASSOCIATIONS ====================

// Category -> Limits (one-to-many)
ExpenseCategory.hasMany(ExpenseCategoryLimit, {
    foreignKey: 'category_id',
    as: 'limits',
    onDelete: 'CASCADE'
});

ExpenseCategoryLimit.belongsTo(ExpenseCategory, {
    foreignKey: 'category_id',
    as: 'category'
});

// Category -> Custom Fields (one-to-many)
ExpenseCategory.hasMany(ExpenseCategoryCustomField, {
    foreignKey: 'category_id',
    as: 'customFields',
    onDelete: 'CASCADE'
});

ExpenseCategoryCustomField.belongsTo(ExpenseCategory, {
    foreignKey: 'category_id',
    as: 'category'
});

// Category -> Filing Rules (one-to-one)
ExpenseCategory.hasOne(ExpenseCategoryFilingRule, {
    foreignKey: 'category_id',
    as: 'filingRules',
    onDelete: 'CASCADE'
});

ExpenseCategoryFilingRule.belongsTo(ExpenseCategory, {
    foreignKey: 'category_id',
    as: 'category'
});

// Category -> Parent Category (self-reference)
ExpenseCategory.belongsTo(ExpenseCategory, {
    foreignKey: 'parent_category_id',
    as: 'parent'
});

ExpenseCategory.hasMany(ExpenseCategory, {
    foreignKey: 'parent_category_id',
    as: 'children'
});

// ==================== CROSS-MODEL ASSOCIATIONS ====================

// Category Limit -> Location Group
ExpenseCategoryLimit.belongsTo(ExpenseLocationGroup, {
    foreignKey: 'location_group_id',
    as: 'locationGroup'
});

ExpenseLocationGroup.hasMany(ExpenseCategoryLimit, {
    foreignKey: 'location_group_id',
    as: 'categoryLimits'
});

// ==================== CURRENCY ASSOCIATIONS ====================

// Currency -> Exchange Rates (as from_currency)
ExpenseCurrency.hasMany(ExpenseExchangeRate, {
    foreignKey: 'from_currency_id',
    as: 'ratesFrom'
});

// Currency -> Exchange Rates (as to_currency)
ExpenseCurrency.hasMany(ExpenseExchangeRate, {
    foreignKey: 'to_currency_id',
    as: 'ratesTo'
});

// Exchange Rate -> From Currency
ExpenseExchangeRate.belongsTo(ExpenseCurrency, {
    foreignKey: 'from_currency_id',
    as: 'fromCurrency'
});

// Exchange Rate -> To Currency
ExpenseExchangeRate.belongsTo(ExpenseCurrency, {
    foreignKey: 'to_currency_id',
    as: 'toCurrency'
});

// Exchange Rate -> History (one-to-many)
ExpenseExchangeRate.hasMany(ExpenseExchangeRateHistory, {
    foreignKey: 'exchange_rate_id',
    as: 'history'
});

ExpenseExchangeRateHistory.belongsTo(ExpenseExchangeRate, {
    foreignKey: 'exchange_rate_id',
    as: 'exchangeRate'
});

module.exports = {
    // Location Group Models
    ExpenseLocationGroup,
    ExpenseLocationGroupMapping,

    // Category Models
    ExpenseCategory,
    ExpenseCategoryLimit,
    ExpenseCategoryCustomField,
    ExpenseCategoryFilingRule,

    // Currency Models
    ExpenseCurrency,
    ExpenseExchangeRate,
    ExpenseCurrencyPolicy,
    ExpenseExchangeRateHistory
};
