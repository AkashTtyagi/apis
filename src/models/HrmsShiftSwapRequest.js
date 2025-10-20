/**
 * HRMS Shift Swap Request Model
 *
 * Purpose: Employee-to-employee shift swap requests
 * Employee requests to swap shift with another employee on specific date
 * Goes through workflow approval process
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsShiftSwapRequest = sequelize.define('HrmsShiftSwapRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_companies'
    },

    // Requestor (employee who wants to swap)
    requester_employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Employee requesting the swap'
    },

    // Target (employee to swap with)
    target_employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Employee with whom swap is requested'
    },

    // Swap Date
    swap_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Date for which shift swap is requested'
    },

    // Current shifts on swap_date
    requester_current_shift_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Requester current shift on swap date'
    },

    target_current_shift_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Target employee current shift on swap date'
    },

    // Reason
    swap_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for swap request'
    },

    // Target Consent (0=Pending, 1=Approved, 2=Rejected)
    target_consent: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '0=Pending consent, 1=Approved by target, 2=Rejected by target'
    },

    target_consent_at: {
        type: DataTypes.DATE,
        allowNull: true
    },

    target_rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason if target rejects'
    },

    // Workflow Integration
    workflow_config_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_workflow_configs - which workflow applies'
    },

    workflow_request_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to hrms_workflow_requests - created after target consent'
    },

    // Approval Status (0=Pending, 1=Approved, 2=Rejected by workflow)
    approval_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '0=Pending workflow approval, 1=Approved by workflow, 2=Rejected by workflow'
    },

    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User who approved (from workflow)'
    },

    approved_at: {
        type: DataTypes.DATE,
        allowNull: true
    },

    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Rejection reason from workflow approver'
    },

    // Status
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    // Audit
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Usually requester_employee_id'
    },

    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'hrms_shift_swap_requests',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['company_id'] },
        { fields: ['requester_employee_id'] },
        { fields: ['target_employee_id'] },
        { fields: ['swap_date'] },
        { fields: ['approval_status'] },
        { fields: ['target_consent'] },
        { fields: ['workflow_config_id'] },
        { fields: ['workflow_request_id'] },
        { fields: ['is_active'] }
    ]
});

HrmsShiftSwapRequest.associate = (models) => {
    HrmsShiftSwapRequest.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    HrmsShiftSwapRequest.belongsTo(models.HrmsEmployee, {
        foreignKey: 'requester_employee_id',
        as: 'requester'
    });

    HrmsShiftSwapRequest.belongsTo(models.HrmsEmployee, {
        foreignKey: 'target_employee_id',
        as: 'target'
    });

    HrmsShiftSwapRequest.belongsTo(models.HrmsShiftMaster, {
        foreignKey: 'requester_current_shift_id',
        as: 'requesterShift'
    });

    HrmsShiftSwapRequest.belongsTo(models.HrmsShiftMaster, {
        foreignKey: 'target_current_shift_id',
        as: 'targetShift'
    });

    if (models.HrmsWorkflowConfig) {
        HrmsShiftSwapRequest.belongsTo(models.HrmsWorkflowConfig, {
            foreignKey: 'workflow_config_id',
            as: 'workflowConfig'
        });
    }

    if (models.HrmsWorkflowRequest) {
        HrmsShiftSwapRequest.belongsTo(models.HrmsWorkflowRequest, {
            foreignKey: 'workflow_request_id',
            as: 'workflowRequest'
        });
    }
};

module.exports = {
    HrmsShiftSwapRequest
};
