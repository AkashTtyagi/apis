const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const HrmsDocumentReminder = sequelize.define('HrmsDocumentReminder', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    employee_document_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    reminder_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    reminder_type: {
        type: DataTypes.ENUM('expiry_warning', 'expiry_due', 'expired'),
        allowNull: false
    },
    days_before_expiry: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    is_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    sent_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reminder_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'hrms_document_reminders',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['company_id'] },
        { fields: ['employee_document_id'] },
        { fields: ['reminder_date'] },
        { fields: ['is_sent'] }
    ]
});

module.exports = HrmsDocumentReminder;
