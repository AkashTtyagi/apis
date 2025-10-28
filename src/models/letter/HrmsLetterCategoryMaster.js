const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsLetterCategoryMaster = sequelize.define('HrmsLetterCategoryMaster', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    category_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    category_code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    category_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'hrms_letter_category_master',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['is_active'] },
        { fields: ['category_code'], unique: true }
    ]
});

module.exports = HrmsLetterCategoryMaster;
