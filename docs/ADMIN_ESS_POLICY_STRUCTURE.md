# Admin & ESS Policy Management - Separated Structure

## Overview
The Policy Management System has been separated into **Admin** and **ESS (Employee Self Service)** modules with distinct controllers, services, and routes for better organization and security.

## File Structure

```
src/
├── services/
│   └── policy/
│       ├── admin.policy.service.js    # Admin business logic
│       └── ess.policy.service.js      # Employee business logic
├── controllers/
│   └── policy/
│       ├── admin.policy.controller.js # Admin HTTP handlers
│       └── ess.policy.controller.js   # Employee HTTP handlers
└── routes/
    └── policy/
        ├── admin.policy.routes.js     # Admin API routes
        └── ess.policy.routes.js       # Employee API routes

postman/
├── Admin_Policy_Management.json       # Admin Postman collection
└── ESS_Policy_Management.json         # ESS Postman collection
```

## API Endpoint Structure

### Admin APIs (Prefix: `/api/admin/policy`)
Full CRUD and management capabilities for administrators.

### ESS APIs (Prefix: `/api/ess/policy`)
Read-only and acknowledgment capabilities for employees.

---

## Admin Policy Management

### Base URL
```
/api/admin/policy
```

### Features
- ✅ Complete CRUD operations for policies and categories
- ✅ Version management (create, publish, rollback)
- ✅ Applicability rule configuration
- ✅ Policy assignment to employees
- ✅ Analytics and reporting
- ✅ Manual reminder sending

### API Endpoints

#### Policy Categories
```
POST /api/admin/policy/categories/create
POST /api/admin/policy/categories/list
POST /api/admin/policy/categories/update
POST /api/admin/policy/categories/delete
```

#### Policy CRUD
```
POST /api/admin/policy/create
POST /api/admin/policy/list
POST /api/admin/policy/details
POST /api/admin/policy/update
POST /api/admin/policy/delete
```

#### Version Management
```
POST /api/admin/policy/version/create
POST /api/admin/policy/version/publish
POST /api/admin/policy/version/rollback
POST /api/admin/policy/version/list
```

#### Applicability
```
POST /api/admin/policy/applicability/set
POST /api/admin/policy/applicability/get
```

#### Assignment
```
POST /api/admin/policy/assign
```

#### Analytics & Reports
```
POST /api/admin/policy/analytics/stats
POST /api/admin/policy/analytics/pending-employees
POST /api/admin/policy/send-reminder
```

### Admin Service Functions

**`admin.policy.service.js`**
- `createPolicyCategory(categoryData)` - Create new category
- `getCategoriesByCompany(company_id, includeInactive)` - List categories
- `updatePolicyCategory(category_id, updateData)` - Update category
- `deletePolicyCategory(category_id, user_id)` - Soft delete category
- `createPolicy(policyData)` - Create new policy
- `getPoliciesByCompany(filters)` - List policies with filters
- `getPolicyById(policy_id)` - Get policy details
- `updatePolicy(policy_id, updateData)` - Update policy
- `deletePolicy(policy_id, user_id)` - Soft delete policy
- `createPolicyVersion(versionData)` - Create new version
- `publishPolicyVersion(version_id, user_id)` - Publish version
- `rollbackPolicyVersion(policy_id, target_version_number, user_id)` - Rollback
- `getPolicyVersions(policy_id)` - Get all versions
- `setPolicyApplicability(policy_id, rules, user_id)` - Set applicability
- `getPolicyApplicability(policy_id)` - Get applicability rules
- `assignPolicyToEmployees(policy_id, user_id)` - Assign to employees
- `getPolicyAcknowledgmentStats(policy_id)` - Get stats
- `getEmployeesWithPendingAcknowledgments(policy_id, page, limit)` - Pending list
- `sendManualReminder(acknowledgment_id, user_id)` - Send reminder

---

## ESS Policy Management

### Base URL
```
/api/ess/policy
```

### Features
- ✅ View assigned policies
- ✅ View pending policies (requires acknowledgment)
- ✅ View acknowledged policies (history)
- ✅ View policy details with attachments
- ✅ Acknowledge policies
- ✅ Check ESS block status
- ✅ Get ESS access summary
- ✅ View active policy categories

### API Endpoints

#### Policy Viewing
```
POST /api/ess/policy/list              # All assigned policies
POST /api/ess/policy/pending           # Pending acknowledgments
POST /api/ess/policy/acknowledged      # Acknowledged history
POST /api/ess/policy/details           # Single policy details
```

#### Acknowledgment
```
POST /api/ess/policy/acknowledge       # Acknowledge a policy
```

#### ESS Access
```
POST /api/ess/policy/check-block       # Check if ESS is blocked
POST /api/ess/policy/access-summary    # Full access summary
```

#### Categories
```
POST /api/ess/policy/categories/list   # Active categories
```

### ESS Service Functions

**`ess.policy.service.js`**
- `getEmployeeAssignedPolicies(employee_id, filters)` - All policies
- `getEmployeePendingPolicies(employee_id)` - Pending policies
- `getEmployeeAcknowledgedPolicies(employee_id, page, limit)` - History
- `getEmployeePolicyDetails(employee_id, acknowledgment_id)` - Policy details
- `acknowledgePolicyByEmployee(acknowledgmentData)` - Acknowledge
- `checkEmployeeESSBlocked(employee_id)` - Check block status
- `getEmployeeESSAccessSummary(employee_id)` - Full summary
- `getActivePolicyCategories(company_id)` - Active categories

---

## Key Differences: Admin vs ESS

| Feature | Admin | ESS |
|---------|-------|-----|
| **Create Policies** | ✅ | ❌ |
| **Update Policies** | ✅ | ❌ |
| **Delete Policies** | ✅ | ❌ |
| **Version Management** | ✅ | ❌ |
| **Set Applicability** | ✅ | ❌ |
| **Assign Policies** | ✅ | ❌ |
| **View Analytics** | ✅ | ❌ |
| **Send Reminders** | ✅ | ❌ |
| **View Assigned Policies** | ✅ | ✅ |
| **View Policy Details** | ✅ | ✅ |
| **Acknowledge Policies** | ❌ | ✅ |
| **Check Block Status** | ❌ | ✅ |
| **View Categories** | ✅ (with inactive) | ✅ (active only) |

---

## Usage Examples

### Admin: Create and Assign Policy

```javascript
// 1. Create category
POST /api/admin/policy/categories/create
{
  "company_id": 1,
  "category_name": "HR Policies",
  "category_slug": "hr_policies"
}

// 2. Create policy
POST /api/admin/policy/create
{
  "company_id": 1,
  "category_id": 1,
  "policy_title": "Leave Policy 2025",
  "policy_slug": "leave_policy_2025",
  "requires_acknowledgment": true,
  "force_acknowledgment": true,
  "grace_period_days": 7
}

// 3. Set applicability (company-wide)
POST /api/admin/policy/applicability/set
{
  "policy_id": 1,
  "applicability_rules": [
    {
      "applicability_type": "company",
      "applicability_value": "1",
      "is_excluded": false,
      "priority": 1
    }
  ]
}

// 4. Assign to employees
POST /api/admin/policy/assign
{
  "policy_id": 1
}

// 5. Check stats
POST /api/admin/policy/analytics/stats
{
  "policy_id": 1
}
```

### ESS: View and Acknowledge Policy

```javascript
// 1. Check access summary
POST /api/ess/policy/access-summary
{
  "employee_id": 10
}

// Response:
{
  "pending_policies": 3,
  "force_acknowledgment_pending": 1,
  "overdue_policies": 0,
  "is_ess_blocked": false,
  "blocked_policies_count": 0
}

// 2. Get pending policies
POST /api/ess/policy/pending
{
  "employee_id": 10
}

// 3. View policy details
POST /api/ess/policy/details
{
  "employee_id": 10,
  "acknowledgment_id": 1
}

// 4. Acknowledge policy
POST /api/ess/policy/acknowledge
{
  "acknowledgment_id": 1,
  "employee_id": 10,
  "acknowledgment_comments": "I have read and understood the policy"
}

// 5. Verify access
POST /api/ess/policy/check-block
{
  "employee_id": 10
}
```

---

## Security Considerations

### Admin Access
- Should be protected by admin role middleware
- Full control over policy lifecycle
- Can see all employees and analytics

### ESS Access
- Should be protected by employee authentication
- Can only see their own policies
- Can only acknowledge their assigned policies
- Cannot modify or delete policies

### Recommended Middleware
```javascript
// Admin routes - require admin role
router.use('/admin/policy', requireAdminRole, adminPolicyRoutes);

// ESS routes - require employee authentication
router.use('/ess/policy', requireAuth, essPolicyRoutes);
```

---

## Postman Collection

### Import Instructions

Import the main collection: `postman/HRMS_Complete_Collection.postman_collection.json`

The collection now includes two new folders:
1. **Admin - Policy Management** (6 subfolders)
   - Contains all admin endpoints
   - Full CRUD operations
   - Analytics and reporting

2. **ESS - Policy Management** (4 subfolders)
   - Contains employee endpoints
   - View and acknowledge policies
   - Check access status

### Environment Variables
Already set in collection variables:
```
base_url: http://localhost:3000/api
company_id: 1
employee_id: 1
auth_token: (set after login)
```

---

## Testing Workflow

### Admin Flow
1. ✅ Create policy category
2. ✅ Create policy with force acknowledgment
3. ✅ Set applicability rules
4. ✅ Assign to employees
5. ✅ Check analytics

### ESS Flow
1. ✅ Check access summary
2. ✅ View pending policies
3. ✅ View policy details
4. ✅ Acknowledge policy
5. ✅ Verify unblocked

---

## Migration from Old Structure

### Old Files (Removed)
```
❌ src/services/policy.service.js
❌ src/controllers/policy.controller.js
❌ src/routes/policy.routes.js
❌ postman/Policy_Management_Folder.json
```

### New Files (Created)
```
✅ src/services/policy/admin.policy.service.js
✅ src/services/policy/ess.policy.service.js
✅ src/controllers/policy/admin.policy.controller.js
✅ src/controllers/policy/ess.policy.controller.js
✅ src/routes/policy/admin.policy.routes.js
✅ src/routes/policy/ess.policy.routes.js
✅ postman/Admin_Policy_Management.json
✅ postman/ESS_Policy_Management.json
```

### Routes Registration
Updated in `src/routes/index.js`:
```javascript
// OLD (removed)
const policyRoutes = require('./policy.routes');
router.use('/policy', policyRoutes);

// NEW (added)
const adminPolicyRoutes = require('./policy/admin.policy.routes');
const essPolicyRoutes = require('./policy/ess.policy.routes');
router.use('/admin/policy', adminPolicyRoutes);
router.use('/ess/policy', essPolicyRoutes);
```

---

## Benefits of Separation

1. **Security**: Clear separation of admin and employee access
2. **Maintainability**: Easier to manage and update specific modules
3. **Scalability**: Can add middleware and features independently
4. **Clarity**: Clear API structure for frontend teams
5. **Testing**: Easier to test admin and ESS flows separately
6. **Documentation**: Self-documenting with clear URL prefixes

---

## Next Steps

1. ✅ Add authentication middleware
2. ✅ Add role-based access control
3. ✅ Implement employee matching logic in `assignPolicyToEmployees`
4. ✅ Add notification worker for sending emails/SMS
5. ✅ Create ESS middleware to check policy blocks before module access
6. ✅ Add file upload functionality for policy attachments
7. ✅ Implement policy preview before publishing

---

## Support

- **Admin APIs**: See `postman/Admin_Policy_Management.json`
- **ESS APIs**: See `postman/ESS_Policy_Management.json`
- **Models**: See `src/models/policy/`
- **Database**: See `database/migrations/policy/001_create_policy_tables.sql`
