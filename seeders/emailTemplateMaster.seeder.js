/**
 * Email Template Master Seeder
 * Seeds default email template slugs with available variables
 * Run: node seeders/emailTemplateMaster.seeder.js
 */

const { HrmsEmailTemplateMaster } = require('../src/models/HrmsEmailTemplateMaster');
const { HrmsWorkflowMaster } = require('../src/models/workflow/HrmsWorkflowMaster');
const { sequelize } = require('../src/utils/database');

const emailTemplateMasters = [
    // Authentication Templates (No Workflow)
    {
        slug: 'reset_password',
        name: 'Reset Password',
        description: 'Sent when user requests password reset',
        category: 'authentication',
        available_variables: ['user_name', 'reset_link', 'expiry_time', 'company_name'],
        workflow_master_id: null,  // No workflow
        is_active: true,
        display_order: 1
    },
    {
        slug: 'set_password',
        name: 'Set Password',
        description: 'Sent to new users to set their password',
        category: 'authentication',
        available_variables: ['user_name', 'set_password_link', 'expiry_time', 'company_name', 'employee_code'],
        workflow_master_id: null,  // No workflow
        is_active: true,
        display_order: 2
    },

    // Onboarding Templates (No Workflow)
    {
        slug: 'welcome_email',
        name: 'Welcome Email',
        description: 'Sent when a new employee is onboarded',
        category: 'onboarding',
        available_variables: ['user_name', 'company_name', 'employee_code', 'department', 'designation', 'joining_date'],
        workflow_master_id: null,  // No workflow
        is_active: true,
        display_order: 3
    },

    // Leave Workflow Templates (workflow_code: LEAVE)
    {
        slug: 'leave_approved',
        name: 'Leave Approved',
        description: 'Sent when leave request is approved',
        category: 'leave',
        available_variables: ['user_name', 'leave_type', 'from_date', 'to_date', 'total_days', 'approver_name', 'remarks'],
        workflow_code: 'LEAVE',  // Will be mapped to workflow_master_id
        is_active: true,
        display_order: 4
    },
    {
        slug: 'leave_rejected',
        name: 'Leave Rejected',
        description: 'Sent when leave request is rejected',
        category: 'leave',
        available_variables: ['user_name', 'leave_type', 'from_date', 'to_date', 'total_days', 'approver_name', 'rejection_reason'],
        workflow_code: 'LEAVE',
        is_active: true,
        display_order: 5
    },

    // Regularization Workflow Templates (workflow_code: REGULARIZATION)
    {
        slug: 'attendance_regularization_approved',
        name: 'Attendance Regularization Approved',
        description: 'Sent when attendance regularization is approved',
        category: 'attendance',
        available_variables: ['user_name', 'date', 'check_in', 'check_out', 'approver_name', 'remarks'],
        workflow_code: 'REGULARIZATION',
        is_active: true,
        display_order: 6
    },
    {
        slug: 'attendance_regularization_rejected',
        name: 'Attendance Regularization Rejected',
        description: 'Sent when attendance regularization is rejected',
        category: 'attendance',
        available_variables: ['user_name', 'date', 'approver_name', 'rejection_reason'],
        workflow_code: 'REGULARIZATION',
        is_active: true,
        display_order: 7
    },

    // WFH Workflow Templates (workflow_code: WFH)
    {
        slug: 'wfh_approved',
        name: 'Work From Home Approved',
        description: 'Sent when WFH request is approved',
        category: 'attendance',
        available_variables: ['user_name', 'from_date', 'to_date', 'total_days', 'approver_name', 'remarks'],
        workflow_code: 'WFH',
        is_active: true,
        display_order: 8
    },
    {
        slug: 'wfh_rejected',
        name: 'Work From Home Rejected',
        description: 'Sent when WFH request is rejected',
        category: 'attendance',
        available_variables: ['user_name', 'from_date', 'to_date', 'approver_name', 'rejection_reason'],
        workflow_code: 'WFH',
        is_active: true,
        display_order: 9
    },

    // On Duty Workflow Templates (workflow_code: ONDUTY)
    {
        slug: 'onduty_approved',
        name: 'On Duty Approved',
        description: 'Sent when on duty request is approved',
        category: 'attendance',
        available_variables: ['user_name', 'from_date', 'to_date', 'purpose', 'approver_name', 'remarks'],
        workflow_code: 'ONDUTY',
        is_active: true,
        display_order: 10
    },
    {
        slug: 'onduty_rejected',
        name: 'On Duty Rejected',
        description: 'Sent when on duty request is rejected',
        category: 'attendance',
        available_variables: ['user_name', 'from_date', 'to_date', 'approver_name', 'rejection_reason'],
        workflow_code: 'ONDUTY',
        is_active: true,
        display_order: 11
    },

    // Shift/Roster Templates (No Workflow - Admin Action)
    {
        slug: 'shift_assignment',
        name: 'Shift Assignment',
        description: 'Sent when employee is assigned to a shift',
        category: 'shift',
        available_variables: ['user_name', 'shift_name', 'shift_start_time', 'shift_end_time', 'effective_date', 'assigned_by'],
        workflow_master_id: null,
        is_active: true,
        display_order: 12
    },
    {
        slug: 'roster_assignment',
        name: 'Roster Assignment',
        description: 'Sent when employee is assigned to a roster',
        category: 'roster',
        available_variables: ['user_name', 'roster_name', 'start_date', 'end_date', 'shift_details', 'assigned_by'],
        workflow_master_id: null,
        is_active: true,
        display_order: 13
    },

    // General Workflow Template (Used for multiple workflows)
    {
        slug: 'workflow_pending_approval',
        name: 'Workflow Pending Approval',
        description: 'Sent to approver when any workflow request is pending',
        category: 'workflow',
        available_variables: ['approver_name', 'requester_name', 'request_type', 'request_date', 'approval_link', 'request_details'],
        workflow_master_id: null,  // Generic - can be used for any workflow
        is_active: true,
        display_order: 14
    },

    // Recruitment Templates (No Workflow)
    {
        slug: 'offer_letter',
        name: 'Offer Letter',
        description: 'Sent when candidate receives offer letter',
        category: 'recruitment',
        available_variables: ['candidate_name', 'position', 'department', 'joining_date', 'salary', 'company_name', 'hr_name'],
        workflow_master_id: null,
        is_active: true,
        display_order: 15
    },

    // Engagement Templates (No Workflow)
    {
        slug: 'birthday_wishes',
        name: 'Birthday Wishes',
        description: 'Sent on employee birthday',
        category: 'engagement',
        available_variables: ['user_name', 'company_name', 'wishes_message'],
        workflow_master_id: null,
        is_active: true,
        display_order: 16
    },
    {
        slug: 'work_anniversary',
        name: 'Work Anniversary',
        description: 'Sent on employee work anniversary',
        category: 'engagement',
        available_variables: ['user_name', 'company_name', 'years_completed', 'joining_date', 'appreciation_message'],
        workflow_master_id: null,
        is_active: true,
        display_order: 17
    },

    // Payroll Templates (No Workflow)
    {
        slug: 'payslip_notification',
        name: 'Payslip Notification',
        description: 'Sent when payslip is generated',
        category: 'payroll',
        available_variables: ['user_name', 'month', 'year', 'payslip_link', 'net_pay', 'company_name'],
        workflow_master_id: null,
        is_active: true,
        display_order: 18
    },

    // Offboarding Templates (workflow_code: RESIGNATION)
    {
        slug: 'resignation_approved',
        name: 'Resignation Approved',
        description: 'Sent when resignation is approved',
        category: 'offboarding',
        available_variables: ['user_name', 'last_working_day', 'approver_name', 'remarks', 'company_name'],
        workflow_code: 'RESIGNATION',
        is_active: true,
        display_order: 19
    },
    {
        slug: 'exit_clearance',
        name: 'Exit Clearance',
        description: 'Sent during employee exit process',
        category: 'offboarding',
        available_variables: ['user_name', 'last_working_day', 'clearance_checklist', 'hr_name', 'company_name'],
        workflow_master_id: null,  // Admin action, not workflow-based
        is_active: true,
        display_order: 20
    }
];

async function seedEmailTemplateMasters() {
    try {
        console.log('🌱 Starting Email Template Master seeder...\n');

        // Sync database
        await sequelize.sync();

        let created = 0;
        let skipped = 0;

        for (const template of emailTemplateMasters) {
            // Check if already exists
            const existing = await HrmsEmailTemplateMaster.findOne({
                where: { slug: template.slug }
            });

            if (existing) {
                console.log(`⏭️  Skipped: ${template.slug} (already exists)`);
                skipped++;
            } else {
                // If workflow_code is provided, fetch workflow_master_id
                let workflow_master_id = template.workflow_master_id;

                if (template.workflow_code) {
                    const workflowMaster = await HrmsWorkflowMaster.findOne({
                        where: { workflow_code: template.workflow_code }
                    });

                    if (workflowMaster) {
                        workflow_master_id = workflowMaster.id;
                        console.log(`   📎 Mapped ${template.workflow_code} → workflow_master_id: ${workflow_master_id}`);
                    } else {
                        console.log(`   ⚠️  Warning: Workflow '${template.workflow_code}' not found, setting workflow_master_id to NULL`);
                        workflow_master_id = null;
                    }
                }

                // Create template with workflow_master_id
                const { workflow_code, ...templateData } = template;  // Remove workflow_code field
                await HrmsEmailTemplateMaster.create({
                    ...templateData,
                    workflow_master_id
                });

                console.log(`✅ Created: ${template.slug} - ${template.name}`);
                created++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Created: ${created}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Total: ${emailTemplateMasters.length}`);
        console.log('\n✅ Email Template Master seeding completed!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding email template masters:', error);
        process.exit(1);
    }
}

// Run seeder
seedEmailTemplateMasters();
