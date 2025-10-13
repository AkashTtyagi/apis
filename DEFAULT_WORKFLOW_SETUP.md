# Default Workflow Setup During Company Onboarding

## Overview
When a new company is onboarded in the HRMS system, default workflows are automatically created for all workflow types. This ensures that employees can immediately start submitting requests (leave, on duty, WFH, etc.) without requiring manual workflow configuration.

## What Gets Created

### Automated Workflow Setup
During company onboarding, the system automatically creates:

1. **One workflow configuration per workflow type** (20 workflows total)
2. **Single-stage approval workflow** for each type
3. **Reporting Manager as default approver**
4. **Version snapshot** for future tracking

### Default Workflow Types
All workflow types from `hrms_workflow_master` are configured:

| ID | Workflow Type | Workflow Code | Description |
|----|---------------|---------------|-------------|
| 1 | Leave | LEAVE | Leave approval workflow |
| 2 | On Duty | ONDUTY | On duty approval workflow |
| 3 | Regularization | REGULARIZATION | Attendance regularization workflow |
| 4 | Work From Home | WFH | Work from home approval workflow |
| 5 | Short Leave | SHORT_LEAVE | Short leave approval workflow |
| 6 | Comp Off | COMPOFF | Compensatory off approval workflow |
| 7 | Overtime | OVERTIME | Overtime approval workflow |
| 8 | Leave Encashment | LEAVE_ENCASHMENT | Leave encashment workflow |
| 9 | Travel Request | TRAVEL | Travel request approval workflow |
| 10 | Expense Claim | EXPENSE_CLAIM | Expense claim approval workflow |
| 11 | Asset Request | ASSET_REQUEST | Asset request workflow |
| 12 | Resignation | RESIGNATION | Resignation approval workflow |
| 13 | Loan Request | LOAN_REQUEST | Loan request workflow |
| 14 | Advance Salary | ADVANCE_SALARY | Advance salary request workflow |
| 15 | Transfer Request | TRANSFER_REQUEST | Transfer request workflow |
| 16 | Training Request | TRAINING_REQUEST | Training request workflow |
| 17 | IT Declaration | IT_DECLARATION | IT declaration workflow |
| 18 | Exit Interview | EXIT_INTERVIEW | Exit interview workflow |
| 19 | Grievance | GRIEVANCE | Grievance handling workflow |
| 20 | Performance Review | PERFORMANCE_REVIEW | Performance review workflow |

## Default Workflow Configuration

### Workflow Settings
Each default workflow is created with these settings:

```javascript
{
  workflow_name: "Default {WorkflowType} Workflow",
  description: "Auto-generated default workflow for {WorkflowType}",
  version: 1,
  is_active: true,
  is_default: true,
  allow_self_approval: false,
  allow_withdrawal: true,
  require_remarks_on_rejection: true,
  send_submission_email: true,
  send_approval_email: true,
  send_rejection_email: true
}
```

### Default Stage Configuration
Each workflow has a single approval stage:

```javascript
{
  stage_name: "Manager Approval",
  stage_order: 1,
  stage_type: "approval",
  stage_description: "Approval from reporting manager",
  approver_logic: "OR",
  min_approvals_required: 1,
  sla_days: 2,
  sla_hours: 0,
  pending_action: "auto_reject",
  pending_after_days: 7,
  on_reject_action: "reject"
}
```

### Default Approver
- **Approver Type**: `reporting_manager`
- **Order**: 1
- **Logic**: First available reporting manager approves

## Implementation Details

### Files Modified

#### 1. `/src/services/workflow/workflowConfig.service.js`
Added `createDefaultWorkflows()` function:
- Lines 926-1054: New function implementation
- Line 1092: Exported as part of module

Key features:
- Fetches all active workflow masters
- Creates workflow config for each type
- Creates single-stage approval with reporting manager
- Creates version snapshot for tracking
- Handles errors gracefully (continues on failure)

#### 2. `/src/services/onboarding.service.js`
Integrated workflow creation into onboarding:
- Line 13: Import `createDefaultWorkflows` function
- Lines 288-294: Call workflow creation in transaction
- Lines 324-325: Include workflow result in return object

### Database Tables Affected

During onboarding, these tables are populated:

1. **hrms_workflow_config**
   - 20 rows (one per workflow type)
   - All marked as `is_default = true`

2. **hrms_workflow_stages**
   - 20 rows (one stage per workflow)
   - All named "Manager Approval"

3. **hrms_workflow_stage_approvers**
   - 20 rows (one approver per stage)
   - All set to `reporting_manager` type

4. **hrms_workflow_versions**
   - 20 rows (version snapshot for each workflow)
   - All version 1 with simplified snapshot

## Usage After Onboarding

### For Employees
After onboarding, employees can immediately:
- Submit leave requests
- Apply for on duty
- Request work from home
- Submit attendance regularization
- All other workflow-enabled requests

The system will automatically route to their reporting manager.

### For Admins
Admins can later customize workflows:
- Add additional approval stages
- Change approver types (department head, custom user, etc.)
- Add conditions for conditional routing
- Set applicability rules
- Create multiple workflows per type

### Checking Created Workflows

Query to verify workflows were created:

```sql
-- Check all workflows for a company
SELECT
    wc.id,
    wc.workflow_name,
    wm.workflow_for_name,
    wm.workflow_code,
    wc.is_default,
    wc.is_active
FROM hrms_workflow_config wc
JOIN hrms_workflow_master wm ON wc.workflow_master_id = wm.id
WHERE wc.company_id = {company_id}
ORDER BY wm.display_order;

-- Check stages for a workflow
SELECT
    ws.stage_name,
    ws.stage_order,
    wsa.approver_type
FROM hrms_workflow_stages ws
LEFT JOIN hrms_workflow_stage_approvers wsa ON ws.id = wsa.stage_id
WHERE ws.workflow_config_id = {workflow_config_id}
ORDER BY ws.stage_order;
```

## Onboarding Response Structure

The onboarding API now returns workflow information:

```json
{
  "company": { ... },
  "user": { ... },
  "employee": { ... },
  "templates": {
    "templates_copied": 1,
    "total_sections": 8,
    "total_fields": 71
  },
  "workflows": {
    "total_workflows": 20,
    "created_count": 20,
    "workflows": [
      {
        "workflow_master_id": 1,
        "workflow_code": "LEAVE",
        "workflow_name": "Leave",
        "config_id": 1,
        "stage_id": 1,
        "approver_id": 1
      },
      // ... 19 more workflows
    ]
  }
}
```

## Error Handling

### Graceful Degradation
- If a specific workflow fails to create, it logs error but continues
- Other workflows will still be created
- Returns count of successfully created workflows

### Transaction Safety
- All workflow creation happens within the onboarding transaction
- If any critical error occurs, entire transaction rolls back
- Database remains consistent

### Common Issues

**Issue**: No workflows created
- **Cause**: `hrms_workflow_master` table is empty
- **Solution**: Run `database/seeds/workflow_master_seed.sql`

**Issue**: Partial workflow creation
- **Cause**: Individual workflow errors (logged to console)
- **Solution**: Check logs for specific workflow errors

## Customization After Setup

Admins can customize default workflows through:

### 1. Add Additional Stages
```javascript
POST /api/workflows/stages/create
{
  "workflow_config_id": 1,
  "stage_name": "HOD Approval",
  "stage_order": 2,
  "approver_type": "department_head"
}
```

### 2. Add Conditions
```javascript
POST /api/workflows/conditions/create
{
  "workflow_config_id": 1,
  "condition_name": "High Amount Leave",
  "condition_type": "global",
  "rules": [
    {
      "field_name": "duration",
      "operator": ">",
      "compare_value": "5"
    }
  ]
}
```

### 3. Set Applicability Rules
```javascript
POST /api/workflows/applicability/create
{
  "workflow_config_id": 1,
  "applicability_type": "department",
  "department_id": 5,
  "priority": 1
}
```

### 4. Clone and Modify
```javascript
POST /api/workflows/config/clone
{
  "source_config_id": 1,
  "workflow_name": "Senior Staff Leave Workflow",
  "is_active": true
}
```

## Testing

### Manual Testing Steps

1. **Run onboarding**:
```bash
POST /api/onboarding
{
  "org_name": "Test Company",
  "country_id": 1,
  "org_industry": 1,
  "first_name": "Admin",
  "last_name": "User",
  "email": "admin@test.com"
}
```

2. **Verify workflows created**:
```sql
SELECT COUNT(*) FROM hrms_workflow_config WHERE company_id = {new_company_id};
-- Expected: 20
```

3. **Test workflow execution**:
```bash
POST /api/attendance/employee/leave/apply
{
  "leave_type": 1,
  "from_date": "2025-02-01",
  "to_date": "2025-02-02",
  "duration": 2,
  "reason": "Test leave"
}
```

4. **Verify request created and assigned**:
```sql
SELECT
    wr.id,
    wr.workflow_master_id,
    wr.current_stage_id,
    wsa.approver_type
FROM hrms_workflow_requests wr
JOIN hrms_workflow_stages ws ON wr.current_stage_id = ws.id
JOIN hrms_workflow_stage_approvers wsa ON ws.id = wsa.stage_id
WHERE wr.id = {request_id};
```

## Benefits

1. **Zero Configuration Required**: Companies can start using workflows immediately
2. **Consistent Setup**: All companies get the same base configuration
3. **Easy to Customize**: Default workflows can be modified or cloned
4. **Complete Coverage**: All 20 workflow types pre-configured
5. **Best Practices**: Reporting manager approval is standard starting point

## Future Enhancements

Potential improvements:
- Industry-specific default workflows
- Company size-based workflow templates
- Role-based default approvers
- Configurable default SLA days
- Optional multi-stage defaults for specific workflow types

## Support

For issues or questions:
- Check logs during onboarding for specific errors
- Verify `hrms_workflow_master` seed data is populated
- Ensure reporting managers are assigned to employees
- Review workflow configuration via admin APIs

---

**Created**: 2025-01-13
**Version**: 1.0
**Feature**: Default Workflow Auto-Setup
**Tables**: hrms_workflow_config, hrms_workflow_stages, hrms_workflow_stage_approvers, hrms_workflow_versions
