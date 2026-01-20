/**
 * Expense Approval Workflow Stage Model
 * Stages within a workflow
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseApprovalWorkflowStage = sequelize.define('ExpenseApprovalWorkflowStage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    workflow_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_expense_approval_workflows'
    },

    // Stage Identification
    stage_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Execution order (1, 2, 3...)'
    },
    stage_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Name of the stage'
    },
    stage_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of the stage'
    },

    // Amount Conditions
    min_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Stage triggers if amount >= this'
    },
    max_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Stage triggers if amount <= this (null = no max)'
    },

    // Category Conditions
    applies_to_categories: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Category IDs this stage applies to (null = all)'
    },

    // Approver Configuration
    approver_type: {
        type: DataTypes.ENUM(
            'Reporting_Manager',
            'Skip_Level_Manager',
            'Department_Head',
            'HOD_Chain',
            'Specific_User',
            'Specific_Role',
            'Users_With_Permission',
            'Finance_Team',
            'HR_Team',
            'Cost_Center_Owner',
            'Project_Manager',
            'Budget_Owner',
            'Custom_Field_Based'
        ),
        allowNull: false,
        comment: 'Type of approver'
    },

    // Approver References
    approver_user_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'User IDs when type=Specific_User'
    },
    approver_role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Role ID when type=Specific_Role'
    },
    approver_permission_code: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Permission code when type=Users_With_Permission'
    },
    custom_approver_field: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Field name for Custom_Field_Based'
    },

    // Multi-Approver Settings
    multi_approver_mode: {
        type: DataTypes.ENUM('Any_One', 'All_Must_Approve', 'Majority'),
        allowNull: false,
        defaultValue: 'Any_One',
        comment: 'When multiple approvers'
    },
    min_approvals_required: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'For Majority mode'
    },

    // Stage Behavior
    is_mandatory: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '0=Can be skipped if conditions not met'
    },
    skip_if_same_approver: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: 'Skip if approver same as previous stage'
    },
    skip_if_self_approved: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: 'Skip if requester is the approver'
    },

    // Actions Available
    can_approve: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    can_reject: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    can_send_back: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    can_hold: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0
    },
    can_delegate: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0
    },
    can_modify_amount: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0
    },
    can_add_comments: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    can_request_documents: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    comments_mandatory_on_reject: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },

    // SLA Configuration
    sla_hours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 48,
        comment: 'Expected completion time'
    },
    sla_warning_hours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 36,
        comment: 'Send warning at this hour'
    },
    sla_breach_action: {
        type: DataTypes.ENUM('Notify', 'Escalate', 'Auto_Approve', 'None'),
        allowNull: false,
        defaultValue: 'Notify',
        comment: 'Action on SLA breach'
    },

    // Stage-level Escalation
    stage_escalation_enabled: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        comment: 'null = use workflow setting'
    },
    stage_escalation_hours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Override workflow escalation hours'
    },
    stage_escalation_to: {
        type: DataTypes.ENUM('Skip_Level_Manager', 'Department_Head', 'Next_Stage_Approver', 'Specific_User'),
        allowNull: true,
        comment: 'Override workflow escalation target'
    },
    stage_escalation_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Specific user for escalation'
    },

    // Status
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Active, 0=Inactive'
    },

    // Audit fields
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
    tableName: 'hrms_expense_approval_workflow_stages',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_workflow',
            fields: ['workflow_id']
        },
        {
            name: 'idx_stage_order',
            fields: ['workflow_id', 'stage_order']
        },
        {
            name: 'idx_amount_range',
            fields: ['min_amount', 'max_amount']
        },
        {
            name: 'idx_approver_type',
            fields: ['approver_type']
        }
    ]
});

module.exports = { ExpenseApprovalWorkflowStage };
