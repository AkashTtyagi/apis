/**
 * Expense Location Group Mapping Model
 * Maps geographical locations (country/state/city) to location groups
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseLocationGroupMapping = sequelize.define('ExpenseLocationGroupMapping', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    location_group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_expense_location_groups'
    },
    country_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_countries'
    },
    state_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_states'
    },
    city_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_cities'
    },
    postal_code_range: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Postal code range (e.g., "110001-110099" or "110001,110002,110003")'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User ID who created this record'
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last updated this record'
    }
}, {
    tableName: 'hrms_expense_location_group_mappings',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_location_group',
            fields: ['location_group_id']
        },
        {
            name: 'idx_country',
            fields: ['country_id']
        },
        {
            name: 'idx_state',
            fields: ['state_id']
        },
        {
            name: 'idx_city',
            fields: ['city_id']
        }
    ]
});

ExpenseLocationGroupMapping.associate = (models) => {
    // Belongs to Location Group
    ExpenseLocationGroupMapping.belongsTo(models.ExpenseLocationGroup, {
        foreignKey: 'location_group_id',
        as: 'locationGroup'
    });

    // Belongs to Country
    ExpenseLocationGroupMapping.belongsTo(models.HrmsCountryMaster, {
        foreignKey: 'country_id',
        as: 'country'
    });

    // Belongs to State
    ExpenseLocationGroupMapping.belongsTo(models.HrmsStateMaster, {
        foreignKey: 'state_id',
        as: 'state'
    });

    // Belongs to City
    ExpenseLocationGroupMapping.belongsTo(models.HrmsCityMaster, {
        foreignKey: 'city_id',
        as: 'city'
    });
};

module.exports = { ExpenseLocationGroupMapping };
