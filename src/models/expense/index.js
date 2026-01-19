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

module.exports = {
    // Location Group Models
    ExpenseLocationGroup,
    ExpenseLocationGroupMapping,

    // Category Models
    ExpenseCategory,
    ExpenseCategoryLimit,
    ExpenseCategoryCustomField,
    ExpenseCategoryFilingRule
};
