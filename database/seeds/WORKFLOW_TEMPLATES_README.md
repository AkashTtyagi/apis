# Workflow Templates Seeder

## Overview
This directory contains pre-configured workflow templates that can be used as starting points for company-specific workflows. Templates are stored with `company_id = 0` to mark them as templates.

## Files

### 1. `workflow_master_seed.sql`
Master list of all workflow types available in the system (Leave, On Duty, Regularization, etc.)

**Run this first** if not already executed.

### 2. `workflow_templates_seed.sql`
Pre-configured workflow templates with stages and approvers for common use cases.

## Available Templates

### Leave Workflows

#### 1. Simple Leave Workflow (RM Only)
- **Code**: `TEMPLATE_LEAVE_SIMPLE`
- **Stages**: 1
- **Flow**: RM Approval
- **Best For**: Small teams, simple approval structure
- **SLA**: 2 days

#### 2. Standard Leave Workflow (RM + HR)
- **Code**: `TEMPLATE_LEAVE_STANDARD`
- **Stages**: 2
- **Flow**: RM Approval → HR Admin Approval
- **Best For**: Medium to large organizations
- **SLA**: Stage 1: 2 days, Stage 2: 1 day

#### 3. Extended Leave Workflow (RM + HOD + HR)
- **Code**: `TEMPLATE_LEAVE_EXTENDED`
- **Stages**: 3
- **Flow**: RM Approval → HOD Approval → HR Admin Approval
- **Best For**: Long leaves (>5 days), high-level approvals
- **SLA**: Stage 1: 2 days, Stage 2: 2 days, Stage 3: 1 day

### Attendance Workflows

#### 4. Auto-Approve Short Leave
- **Code**: `TEMPLATE_SHORT_LEAVE_AUTO`
- **Stages**: 1 (notification only)
- **Flow**: Auto-approve + RM notification
- **Best For**: Short breaks, flexible work environments
- **Auto-Approve**: Immediate

#### 5. Simple On Duty Workflow
- **Code**: `TEMPLATE_ONDUTY_SIMPLE`
- **Stages**: 1
- **Flow**: RM Approval
- **Best For**: On-duty/field work requests
- **SLA**: 1 day

#### 6. Standard Regularization Workflow
- **Code**: `TEMPLATE_REGULARIZATION_STANDARD`
- **Stages**: 2
- **Flow**: RM Approval → HR Verification
- **Best For**: Attendance correction requests
- **SLA**: Stage 1: 2 days, Stage 2: 1 day

#### 7. Simple WFH Workflow
- **Code**: `TEMPLATE_WFH_SIMPLE`
- **Stages**: 1
- **Flow**: RM Approval
- **Best For**: Work from home requests
- **SLA**: 1 day

### Time-Off Workflows

#### 8. Standard Comp Off Workflow
- **Code**: `TEMPLATE_COMPOFF_STANDARD`
- **Stages**: 2
- **Flow**: RM Approval → HR Admin Approval
- **Best For**: Compensatory off after overtime/weekend work
- **SLA**: Stage 1: 2 days, Stage 2: 1 day

#### 9. Standard Overtime Workflow
- **Code**: `TEMPLATE_OVERTIME_STANDARD`
- **Stages**: 2
- **Flow**: RM Approval → HOD Approval
- **Best For**: Overtime requests and approvals
- **SLA**: Stage 1: 2 days, Stage 2: 1 day

### HR Workflows

#### 10. Standard Resignation Workflow
- **Code**: `TEMPLATE_RESIGNATION_STANDARD`
- **Stages**: 3
- **Flow**: RM Approval → HOD Approval → HR Exit Formalities
- **Best For**: Employee resignation process
- **SLA**: Stage 1: 3 days, Stage 2: 3 days, Stage 3: 5 days

#### 11. Standard Expense Claim Workflow
- **Code**: `TEMPLATE_EXPENSE_STANDARD`
- **Stages**: 3
- **Flow**: RM Approval → HOD Approval (conditional) → Finance Verification
- **Best For**: Expense claims with amount-based routing
- **SLA**: Stage 1: 3 days, Stage 2: 2 days, Stage 3: 2 days
- **Note**: Stage 2 can be skipped for low amounts

### Advanced Examples

#### 12. Parallel Approval Travel Workflow
- **Code**: `TEMPLATE_TRAVEL_PARALLEL`
- **Stages**: 2
- **Flow**: (RM AND HOD - parallel) → HR Admin
- **Best For**: Demonstrating parallel approvals (AND logic)
- **SLA**: Stage 1: 3 days, Stage 2: 2 days
- **Special**: Stage 1 requires BOTH RM and HOD to approve

## Installation

### Step 1: Run Master Seed (if not already done)
```sql
SOURCE database/seeds/workflow_master_seed.sql;
```

### Step 2: Run Templates Seed
```sql
SOURCE database/seeds/workflow_templates_seed.sql;
```

### Step 3: Verify Installation
```sql
-- Check templates created
SELECT workflow_code, workflow_name, description
FROM hrms_workflow_config
WHERE company_id = 0;

-- Check template stages
SELECT
    wc.workflow_code,
    ws.stage_name,
    ws.stage_order,
    ws.stage_type,
    ws.approver_logic
FROM hrms_workflow_config wc
INNER JOIN hrms_workflow_stages ws ON ws.workflow_config_id = wc.id
WHERE wc.company_id = 0
ORDER BY wc.id, ws.stage_order;
```

## Using Templates via API

### 1. List Available Templates
```javascript
GET /api/workflow/templates
```

### 2. Copy Template for Company
```javascript
POST /api/workflow/copy-template
{
  "company_id": 1,
  "template_code": "TEMPLATE_LEAVE_STANDARD",
  "customize": {
    "workflow_name": "ABC Corp Leave Workflow",
    "stages": [
      {
        "stage_order": 1,
        "sla_days": 3  // Customize SLA
      }
    ]
  }
}
```

### 3. Create Custom Workflow from Scratch
```javascript
POST /api/workflow/config
{
  "company_id": 1,
  "workflow_master_id": 1,
  "workflow_name": "Custom Leave Workflow",
  "workflow_code": "CUSTOM_LEAVE_COMP1",
  "stages": [
    {
      "stage_name": "RM Approval",
      "stage_order": 1,
      "stage_type": "approval",
      "approver_logic": "OR",
      "sla_days": 2,
      "approvers": [
        {
          "approver_type": "RM"
        }
      ]
    }
  ]
}
```

## Approver Types Explained

| Approver Type | Description | Use Case |
|--------------|-------------|----------|
| `RM` | Reporting Manager | Direct supervisor approval |
| `RM_OF_RM` | Manager's Manager | Second-level escalation |
| `HR_ADMIN` | HR Administrator | HR verification/approval |
| `HOD` | Head of Department | Department head approval |
| `FUNCTIONAL_HEAD` | Functional Head | Function-level approval |
| `SUB_ADMIN` | Sub Administrator | Secondary admin approval |
| `SECONDARY_RM` | Secondary Reporting Manager | Dotted line manager |
| `SELF` | Self (requestor) | Self-service actions |
| `AUTO_APPROVE` | Automatic Approval | No manual intervention |
| `CUSTOM_USER` | Specific User | Named individual (use with custom_user_id) |

## Stage Types Explained

| Stage Type | Description | Use Case |
|-----------|-------------|----------|
| `approval` | Requires explicit approval | Standard approval stages |
| `notify_only` | No approval needed, just notification | FYI notifications |
| `auto_action` | Automatic system action | Automated processing |

## Approver Logic Explained

| Logic | Description | Behavior |
|-------|-------------|----------|
| `OR` | Any one approver can approve | First approval completes stage |
| `AND` | All approvers must approve | All must approve to complete stage |

## SLA Actions

| Action | Description |
|--------|-------------|
| `auto_approve` | Automatically approve after SLA expires |
| `auto_reject` | Automatically reject after SLA expires |
| `escalate` | Escalate to next stage or specific stage |
| `notify` | Send notification reminders |

## Customization Guide

### Modifying SLA
```sql
-- Update SLA for a specific stage
UPDATE hrms_workflow_stages
SET sla_days = 3, sla_hours = 0
WHERE id = <stage_id>;
```

### Adding Custom Approvers
```sql
-- Add custom user as approver
INSERT INTO hrms_workflow_stage_approvers (
    stage_id, approver_type, custom_user_id, approver_order
) VALUES (
    <stage_id>, 'CUSTOM_USER', <user_id>, 1
);
```

### Changing Approver Logic
```sql
-- Change from OR to AND logic
UPDATE hrms_workflow_stages
SET approver_logic = 'AND'
WHERE id = <stage_id>;
```

## Best Practices

1. **Start with Templates**: Use templates as starting points, then customize
2. **Test Workflows**: Test with dummy data before going live
3. **SLA Configuration**: Set realistic SLAs based on your organization
4. **Escalation Paths**: Define clear escalation paths for pending requests
5. **Email Notifications**: Configure email templates for better communication
6. **Audit Trails**: Enable audit logging for compliance
7. **Version Control**: Use workflow versioning when making changes
8. **Documentation**: Document any customizations made to templates

## Workflow Configuration Checklist

- [ ] Select appropriate template
- [ ] Customize workflow name and code
- [ ] Review and adjust SLA days/hours
- [ ] Configure approver types
- [ ] Set up email notifications
- [ ] Define escalation rules
- [ ] Configure rejection actions
- [ ] Set up applicability rules (department, designation, etc.)
- [ ] Test with sample requests
- [ ] Train approvers on the workflow
- [ ] Document any customizations
- [ ] Enable workflow for production

## Common Scenarios

### Scenario 1: Skip Stage Based on Condition
```sql
-- Make stage skippable with condition
UPDATE hrms_workflow_stages
SET can_skip = TRUE,
    skip_condition = '{"field": "leave_days", "operator": "<", "value": 3}'
WHERE id = <stage_id>;
```

### Scenario 2: Route to Different Stage on Rejection
```sql
-- Send back to previous stage on rejection
UPDATE hrms_workflow_stages
SET on_reject_action = 'move_to_stage',
    on_reject_stage_id = <previous_stage_id>
WHERE id = <stage_id>;
```

### Scenario 3: Parallel Approvals
```sql
-- Multiple approvers, all must approve
UPDATE hrms_workflow_stages
SET approver_logic = 'AND'
WHERE id = <stage_id>;

-- Add multiple approvers
INSERT INTO hrms_workflow_stage_approvers (stage_id, approver_type, approver_order)
VALUES
    (<stage_id>, 'RM', 1),
    (<stage_id>, 'HOD', 2),
    (<stage_id>, 'HR_ADMIN', 3);
```

## Troubleshooting

### No Workflow Found for Employee
**Issue**: Employee cannot submit request
**Solution**: Check workflow applicability rules and ensure employee matches at least one rule

### SLA Not Working
**Issue**: SLA notifications not triggering
**Solution**:
1. Check `pending_action` is set
2. Verify scheduler is running
3. Check `WORKFLOW_SCHEDULER_ENABLED=true` in .env

### Email Not Sending
**Issue**: Approval emails not received
**Solution**:
1. Check SMTP configuration in .env
2. Verify `send_email_on_assign` is TRUE
3. Check email template is configured

### Stage Not Progressing
**Issue**: Request stuck at a stage
**Solution**:
1. Check if approver_logic is AND (all must approve)
2. Verify `on_approve_next_stage_id` is set correctly
3. Check if stage is marked as mandatory

## Support

For issues or questions:
1. Check this README
2. Review workflow system architecture documentation
3. Check application logs
4. Contact system administrator

## Version History

- **v1.0**: Initial templates (12 workflow templates covering common scenarios)
