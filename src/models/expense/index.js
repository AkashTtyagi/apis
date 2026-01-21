/**
 * Expense Models Index
 * Exports all expense-related models with associations
 */

const { ExpenseLocationGroup } = require('./ExpenseLocationGroup');
const { ExpenseLocationGroupMapping } = require('./ExpenseLocationGroupMapping');

// Import HRMS models for associations
const { HrmsCountryMaster } = require('../HrmsCountryMaster');
const { HrmsStateMaster } = require('../HrmsStateMaster');
const { HrmsCityMaster } = require('../HrmsCityMaster');
const { ExpenseCategory } = require('./ExpenseCategory');
const { ExpenseCategoryLimit } = require('./ExpenseCategoryLimit');
const { ExpenseCategoryCustomField } = require('./ExpenseCategoryCustomField');
const { ExpenseCategoryFilingRule } = require('./ExpenseCategoryFilingRule');
const { ExpenseCurrency } = require('./ExpenseCurrency');
const { ExpenseExchangeRate } = require('./ExpenseExchangeRate');
const { ExpenseCurrencyPolicy } = require('./ExpenseCurrencyPolicy');
const { ExpenseExchangeRateHistory } = require('./ExpenseExchangeRateHistory');

// Workflow Models
const { ExpenseApprovalWorkflow } = require('./ExpenseApprovalWorkflow');
const { ExpenseApprovalWorkflowStage } = require('./ExpenseApprovalWorkflowStage');
const { ExpenseWorkflowCategoryMapping } = require('./ExpenseWorkflowCategoryMapping');
const { ExpenseWorkflowApplicability } = require('./ExpenseWorkflowApplicability');
const { ExpenseApprovalRequest } = require('./ExpenseApprovalRequest');
const { ExpenseApprovalRequestItem } = require('./ExpenseApprovalRequestItem');
const { ExpenseApprovalHistory } = require('./ExpenseApprovalHistory');
const { ExpenseApprovalPending } = require('./ExpenseApprovalPending');
const { ExpenseApprovalDelegate } = require('./ExpenseApprovalDelegate');

// ==================== LOCATION GROUP ASSOCIATIONS ====================

// Location Group -> Mappings (one-to-many)
ExpenseLocationGroup.hasMany(ExpenseLocationGroupMapping, {
    foreignKey: 'location_group_id',
    as: 'locations',
    onDelete: 'CASCADE'
});

// Location Group Mapping -> Country
ExpenseLocationGroupMapping.belongsTo(HrmsCountryMaster, {
    foreignKey: 'country_id',
    as: 'country'
});

// Location Group Mapping -> State
ExpenseLocationGroupMapping.belongsTo(HrmsStateMaster, {
    foreignKey: 'state_id',
    as: 'state'
});

// Location Group Mapping -> City
ExpenseLocationGroupMapping.belongsTo(HrmsCityMaster, {
    foreignKey: 'city_id',
    as: 'city'
});

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

// ==================== WORKFLOW ASSOCIATIONS ====================

// Workflow -> Stages (one-to-many)
ExpenseApprovalWorkflow.hasMany(ExpenseApprovalWorkflowStage, {
    foreignKey: 'workflow_id',
    as: 'stages',
    onDelete: 'CASCADE'
});

ExpenseApprovalWorkflowStage.belongsTo(ExpenseApprovalWorkflow, {
    foreignKey: 'workflow_id',
    as: 'workflow'
});

// Workflow -> Category Mappings (one-to-many)
ExpenseApprovalWorkflow.hasMany(ExpenseWorkflowCategoryMapping, {
    foreignKey: 'workflow_id',
    as: 'categoryMappings',
    onDelete: 'CASCADE'
});

ExpenseWorkflowCategoryMapping.belongsTo(ExpenseApprovalWorkflow, {
    foreignKey: 'workflow_id',
    as: 'workflow'
});

// Workflow -> Applicability (one-to-many)
ExpenseApprovalWorkflow.hasMany(ExpenseWorkflowApplicability, {
    foreignKey: 'workflow_id',
    as: 'applicability',
    onDelete: 'CASCADE'
});

ExpenseWorkflowApplicability.belongsTo(ExpenseApprovalWorkflow, {
    foreignKey: 'workflow_id',
    as: 'workflow'
});

// Category -> Workflow Mappings
ExpenseCategory.hasMany(ExpenseWorkflowCategoryMapping, {
    foreignKey: 'category_id',
    as: 'workflowMappings',
    onDelete: 'CASCADE'
});

ExpenseWorkflowCategoryMapping.belongsTo(ExpenseCategory, {
    foreignKey: 'category_id',
    as: 'category'
});

// Workflow -> Approval Requests (one-to-many)
ExpenseApprovalWorkflow.hasMany(ExpenseApprovalRequest, {
    foreignKey: 'workflow_id',
    as: 'approvalRequests'
});

ExpenseApprovalRequest.belongsTo(ExpenseApprovalWorkflow, {
    foreignKey: 'workflow_id',
    as: 'workflow'
});

// Approval Request -> Current Stage
ExpenseApprovalRequest.belongsTo(ExpenseApprovalWorkflowStage, {
    foreignKey: 'current_stage_id',
    as: 'currentStage'
});

// Approval Request -> Items (one-to-many)
ExpenseApprovalRequest.hasMany(ExpenseApprovalRequestItem, {
    foreignKey: 'approval_request_id',
    as: 'items',
    onDelete: 'CASCADE'
});

ExpenseApprovalRequestItem.belongsTo(ExpenseApprovalRequest, {
    foreignKey: 'approval_request_id',
    as: 'approvalRequest'
});

// Approval Request Item -> Stage
ExpenseApprovalRequestItem.belongsTo(ExpenseApprovalWorkflowStage, {
    foreignKey: 'current_stage_id',
    as: 'currentStage'
});

// Approval Request Item -> Workflow (for category-specific)
ExpenseApprovalRequestItem.belongsTo(ExpenseApprovalWorkflow, {
    foreignKey: 'item_workflow_id',
    as: 'itemWorkflow'
});

// Approval Request -> History (one-to-many)
ExpenseApprovalRequest.hasMany(ExpenseApprovalHistory, {
    foreignKey: 'approval_request_id',
    as: 'history'
});

ExpenseApprovalHistory.belongsTo(ExpenseApprovalRequest, {
    foreignKey: 'approval_request_id',
    as: 'approvalRequest'
});

// Approval Request -> Pending (one-to-many)
ExpenseApprovalRequest.hasMany(ExpenseApprovalPending, {
    foreignKey: 'approval_request_id',
    as: 'pendingApprovals'
});

ExpenseApprovalPending.belongsTo(ExpenseApprovalRequest, {
    foreignKey: 'approval_request_id',
    as: 'approvalRequest'
});

// Pending -> Stage
ExpenseApprovalPending.belongsTo(ExpenseApprovalWorkflowStage, {
    foreignKey: 'stage_id',
    as: 'stage'
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
    ExpenseExchangeRateHistory,

    // Workflow Models
    ExpenseApprovalWorkflow,
    ExpenseApprovalWorkflowStage,
    ExpenseWorkflowCategoryMapping,
    ExpenseWorkflowApplicability,
    ExpenseApprovalRequest,
    ExpenseApprovalRequestItem,
    ExpenseApprovalHistory,
    ExpenseApprovalPending,
    ExpenseApprovalDelegate
};
