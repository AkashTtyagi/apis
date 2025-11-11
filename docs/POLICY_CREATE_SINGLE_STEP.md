# Policy Creation - Single Step Process

## ✅ Updated Approach

Policy creation is now **ONE STEP** instead of multiple steps. You can create:
- Policy basic info
- Initial version with content
- Applicability rules

All in a single API call!

---

## API Endpoint

```
POST /api/admin/policy/create
```

---

## Complete Request Body

```json
{
  // Basic Policy Info (Required)
  "company_id": 23,
  "category_id": 1,
  "policy_title": "Leave Policy 2025",
  "policy_slug": "leave_policy_2025",
  "policy_description": "Company leave policy for year 2025",

  // Acknowledgment Settings
  "requires_acknowledgment": true,
  "force_acknowledgment": true,
  "grace_period_days": 7,

  // Notification Settings
  "send_notifications": true,
  "notification_channels": ["email", "in_app"],
  "reminder_frequency_days": 3,

  // Effective Dates
  "effective_from": "2025-01-01",
  "expires_on": "2025-12-31",

  // Version Info (Optional - but recommended)
  "version_title": "Leave Policy 2025 - Version 1.0",
  "version_description": "Initial version with all leave types",
  "policy_content": "<h1>Leave Policy 2025</h1><h2>1. Annual Leave</h2><p>Employees are entitled to 20 days of annual leave per year.</p><h2>2. Sick Leave</h2><p>12 days of sick leave with medical certificate.</p>",

  // Applicability Rules (Optional - but recommended)
  "applicability_rules": [
    {
      "applicability_type": "company",
      "applicability_value": "23",
      "is_excluded": false,
      "priority": 1
    }
  ]
}
```

---

## Response

```json
{
  "success": true,
  "message": "Policy created successfully with version and applicability",
  "data": {
    "id": 1,
    "company_id": 23,
    "category_id": 1,
    "policy_title": "Leave Policy 2025",
    "policy_slug": "leave_policy_2025",
    "current_version_number": 1,
    "requires_acknowledgment": true,
    "force_acknowledgment": true,
    "grace_period_days": 7,
    "versions": [
      {
        "id": 1,
        "version_number": 1,
        "version_title": "Leave Policy 2025 - Version 1.0",
        "is_current_version": true,
        "policy_content": "<h1>Leave Policy 2025</h1>..."
      }
    ],
    "applicability": [
      {
        "id": 1,
        "applicability_type": "company",
        "applicability_value": "23",
        "is_excluded": false,
        "priority": 1
      }
    ]
  }
}
```

---

## Examples

### Example 1: Company-Wide Policy

```json
{
  "company_id": 23,
  "category_id": 1,
  "policy_title": "Code of Conduct",
  "policy_slug": "code_of_conduct",
  "requires_acknowledgment": true,
  "force_acknowledgment": true,
  "grace_period_days": 5,
  "version_title": "Code of Conduct v1.0",
  "policy_content": "<h1>Code of Conduct</h1><p>Professional behavior guidelines...</p>",
  "applicability_rules": [
    {
      "applicability_type": "company",
      "applicability_value": "23",
      "is_excluded": false,
      "priority": 1
    }
  ]
}
```

### Example 2: Department-Specific Policy

```json
{
  "company_id": 23,
  "category_id": 2,
  "policy_title": "IT Security Policy",
  "policy_slug": "it_security_policy",
  "requires_acknowledgment": true,
  "force_acknowledgment": true,
  "grace_period_days": 10,
  "version_title": "IT Security Policy v1.0",
  "policy_content": "<h1>IT Security</h1><p>Data protection guidelines...</p>",
  "applicability_rules": [
    {
      "applicability_type": "department",
      "applicability_value": "1,2,3",
      "is_excluded": false,
      "priority": 1
    }
  ]
}
```

### Example 3: Policy with Exclusions

```json
{
  "company_id": 23,
  "category_id": 1,
  "policy_title": "Attendance Policy",
  "policy_slug": "attendance_policy",
  "requires_acknowledgment": true,
  "force_acknowledgment": true,
  "grace_period_days": 7,
  "version_title": "Attendance Policy v1.0",
  "policy_content": "<h1>Attendance</h1><p>Clock-in requirements...</p>",
  "applicability_rules": [
    {
      "applicability_type": "company",
      "applicability_value": "23",
      "is_excluded": false,
      "priority": 1
    },
    {
      "applicability_type": "designation",
      "applicability_value": "5,6",
      "is_excluded": true,
      "priority": 2
    }
  ]
}
```
**Meaning**: Apply to entire company EXCEPT designations 5 and 6

### Example 4: Multiple Departments with Advanced Filter

```json
{
  "company_id": 23,
  "category_id": 1,
  "policy_title": "Sales Commission Policy",
  "policy_slug": "sales_commission_policy",
  "requires_acknowledgment": true,
  "force_acknowledgment": false,
  "version_title": "Sales Commission Policy v1.0",
  "policy_content": "<h1>Commission Structure</h1><p>Sales incentive details...</p>",
  "applicability_rules": [
    {
      "applicability_type": "department",
      "applicability_value": "3,4",
      "is_excluded": false,
      "advanced_applicability_type": "location",
      "advanced_applicability_value": "10,11",
      "priority": 1
    }
  ]
}
```
**Meaning**: Sales and Marketing departments (3,4) at Mumbai & Delhi locations (10,11)

---

## Applicability Types

Available options for `applicability_type`:
- `company` - Entire company
- `entity` - Specific entities
- `location` - Specific locations
- `level` - Employee levels
- `designation` - Specific designations
- `department` - Departments
- `sub_department` - Sub-departments
- `employee` - Specific employees
- `grade` - Employee grades

---

## Benefits of Single-Step Creation

### ❌ Old Way (Multiple Steps)
```
1. POST /api/admin/policy/create
2. POST /api/admin/policy/version/create
3. POST /api/admin/policy/applicability/set
4. POST /api/admin/policy/assign
```
**4 API calls needed!**

### ✅ New Way (Single Step)
```
1. POST /api/admin/policy/create (with all data)
2. POST /api/admin/policy/assign (only this)
```
**Just 2 API calls!**

### Advantages
1. **Better UX** - Less steps for user
2. **Atomic Operation** - All or nothing (transaction)
3. **Consistent Data** - Version and applicability always created
4. **Faster** - Fewer API calls
5. **Error Reduction** - No partial policy creation

---

## Optional Fields

You can create a basic policy without version and applicability:

```json
{
  "company_id": 23,
  "category_id": 1,
  "policy_title": "Draft Policy",
  "policy_slug": "draft_policy",
  "requires_acknowledgment": false
}
```

Then add version and applicability later using separate APIs.

---

## Next Steps After Creation

Once policy is created with applicability:

```
POST /api/admin/policy/assign
{
  "policy_id": 1
}
```

This will assign the policy to all matching employees based on applicability rules.

---

## Postman Collection Updated

The **Admin - Policy Management > Policy CRUD > Create Policy** request has been updated with the new format.

Import `postman/HRMS_Complete_Collection.postman_collection.json` to see the example!
