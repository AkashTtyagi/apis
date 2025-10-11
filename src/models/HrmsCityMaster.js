/**
 * City Master Model
 * Stores all cities
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsCityMaster = sequelize.define('HrmsCityMaster', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'City ID'
    },
    state_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Reference to state',
        references: {
            model: 'hrms_state_master',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    country_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Reference to country',
        references: {
            model: 'hrms_country_master',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    city_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Full city name'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this city is active'
    },
    display_order: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order for display in UI'
    }
}, {
    tableName: 'hrms_city_master',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_state_id',
            fields: ['state_id']
        },
        {
            name: 'idx_country_id',
            fields: ['country_id']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        },
        {
            name: 'idx_city_name',
            fields: ['city_name']
        },
        {
            name: 'unique_state_city',
            unique: true,
            fields: ['state_id', 'city_name']
        }
    ],
    comment: 'City master table - stores all cities'
});

/**
 * Define associations
 */
HrmsCityMaster.associate = (models) => {
    // City belongs to State
    HrmsCityMaster.belongsTo(models.HrmsStateMaster, {
        foreignKey: 'state_id',
        as: 'state'
    });

    // City belongs to Country
    HrmsCityMaster.belongsTo(models.HrmsCountryMaster, {
        foreignKey: 'country_id',
        as: 'country'
    });
};

module.exports = { HrmsCityMaster };
