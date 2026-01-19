/**
 * Expense Models Index
 * Exports all expense-related models
 */

const { ExpenseLocationGroup } = require('./ExpenseLocationGroup');
const { ExpenseLocationGroupMapping } = require('./ExpenseLocationGroupMapping');

// Define associations
ExpenseLocationGroup.hasMany(ExpenseLocationGroupMapping, {
    foreignKey: 'location_group_id',
    as: 'locations',
    onDelete: 'CASCADE'
});

ExpenseLocationGroupMapping.belongsTo(ExpenseLocationGroup, {
    foreignKey: 'location_group_id',
    as: 'locationGroup'
});

module.exports = {
    ExpenseLocationGroup,
    ExpenseLocationGroupMapping
};
