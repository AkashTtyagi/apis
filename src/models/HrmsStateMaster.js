/**
 * State/Province Master Model
 * Stores all states and provinces
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsStateMaster = sequelize.define('HrmsStateMaster', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'State ID'
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
    state_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Full state/province name'
    },
    state_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: 'State/province code'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this state is active'
    },
    display_order: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order for display in UI'
    }
}, {
    tableName: 'hrms_state_master',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_country_id',
            fields: ['country_id']
        },
        {
            name: 'idx_state_code',
            fields: ['state_code']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        },
        {
            name: 'unique_country_state',
            unique: true,
            fields: ['country_id', 'state_name']
        }
    ],
    comment: 'State/Province master table - stores all states and provinces'
});

/**
 * Define associations
 */
HrmsStateMaster.associate = (models) => {
    // State belongs to Country
    HrmsStateMaster.belongsTo(models.HrmsCountryMaster, {
        foreignKey: 'country_id',
        as: 'country'
    });

    // State has many Cities
    HrmsStateMaster.hasMany(models.HrmsCityMaster, {
        foreignKey: 'state_id',
        as: 'cities'
    });
};

module.exports = { HrmsStateMaster };
