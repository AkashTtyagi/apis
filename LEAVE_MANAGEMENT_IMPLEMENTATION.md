# Leave Management System - Implementation Summary

## ✅ Completed Implementation

### 📦 Database Models Created

1. **HrmsLeaveMaster** (`src/models/HrmsLeaveMaster.js`)
   - Leave type configurations with all rules
   - Status-based credit amounts (active, probation, intern, contractor, separated)
   - Support for default (company_id=0) and custom leave types
   - Eligibility, credit rules, request configuration, carry forward settings

2. **HrmsLeaveLedger** (`src/models/HrmsLeaveLedger.js`)
   - Ledger-based approach (single source of truth)
   - All transaction types: credit, debit, carry_forward, adjustment, encashment, lapse, reversal, penalty
   - Tracks balance after each transaction
   - Reference linking to generic request system
   - Reversal support: `reverses_transaction_id` field

3. **HrmsEmployeeLeaveBalance** (`src/models/HrmsEmployeeLeaveBalance.js`)
   - Cached balance table for quick queries
   - Month-wise and year-wise tracking
   - Opening balance, total credited, total debited, encashed, lapsed
   - **No pending_approval** (calculated real-time from requests)

4. **HrmsLeavePolicyMaster** (`src/models/HrmsLeavePolicyMaster.js`)
   - Leave policy configurations
   - No `is_default` concept (created during company onboarding)

5. **HrmsLeavePolicyMapping** (`src/models/HrmsLeavePolicyMapping.js`)
   - Maps leave types to policies
   - **Soft delete support** (`deleted_at`, `is_active`)
   - Maintains history when leave types are removed from policy
   - Display order for UI rendering

6. **HrmsLeaveTypeAuditLog** (`src/models/HrmsLeaveTypeAuditLog.js`)
   - Dedicated audit log for leave type changes
   - Field-level change tracking
   - Records: field_name, old_value, new_value, changed_by
   - IP address and user agent tracking

7. **HrmsEmployee** (Updated)
   - Added `leave_policy_id` field
   - Direct reference to leave policy (no separate mapping table)

---

## 🔌 API Endpoints

### Leave Type APIs

#### 1. Create Leave Type
```http
POST /api/leave-types
Authorization: Bearer <token>
Content-Type: application/json

{
  "leave_code": "CL",
  "leave_name": "Casual Leave",
  "leave_cycle_start_month": 1,
  "leave_cycle_end_month": 12,
  "leave_type": "paid",
  "is_encashment_allowed": false,
  "applicable_to_esi": "both",
  "applicable_to_status": "active,probation",
  "applicable_to_gender": "all",
  "credit_frequency": "monthly",
  "credit_day_of_month": 1,
  "number_of_leaves_to_credit": 12,
  "active_leaves_to_credit": 12,
  "probation_leaves_to_credit": 6,
  "can_request_half_day": true,
  "can_employee_request": true,
  "max_requests_per_month": 4,
  "max_continuous_leave": 3,
  "backdated_leave_allowed": true,
  "days_allowed_for_backdated_leave": 7
}
```

#### 2. Update Leave Type
```http
PUT /api/leave-types/:id
Authorization: Bearer <token>

{
  "leave_name": "Updated Leave Name",
  "max_continuous_leave": 5
}
```
**Note:** Changes are automatically logged in `hrms_leave_type_audit_logs`

#### 3. Get All Leave Types
```http
GET /api/leave-types?is_active=true
Authorization: Bearer <token>
```

#### 4. Get Leave Type by ID
```http
GET /api/leave-types/:id
Authorization: Bearer <token>
```

#### 5. Delete Leave Type (Soft Delete)
```http
DELETE /api/leave-types/:id
Authorization: Bearer <token>
```

#### 6. Get Audit Logs for Leave Type
```http
GET /api/leave-types/:id/audit-logs
Authorization: Bearer <token>
```

---

### Leave Policy APIs

#### 1. Create Leave Policy
```http
POST /api/leave-policies
Authorization: Bearer <token>

{
  "policy_name": "Permanent Employee Policy",
  "policy_description": "Leave policy for permanent employees",
  "leave_type_ids": [1, 2, 3, 5]
}
```

#### 2. Update Leave Policy
```http
PUT /api/leave-policies/:id
Authorization: Bearer <token>

{
  "policy_name": "Updated Policy Name",
  "leave_type_ids": [1, 2, 3, 4, 5]
}
```
**Note:** Mappings are managed with soft delete - history is maintained

#### 3. Toggle Leave Type in Policy (Activate/Deactivate)
```http
PATCH /api/leave-policies/:policyId/leave-types/:leaveTypeId/toggle
Authorization: Bearer <token>

{
  "is_active": false
}
```
**Use Case:** Temporarily disable a leave type without deleting it

#### 4. Get All Leave Policies
```http
GET /api/leave-policies?is_active=true&include_inactive_leave_types=false
Authorization: Bearer <token>
```

#### 5. Get Leave Policy by ID
```http
GET /api/leave-policies/:id?include_inactive_leave_types=true
Authorization: Bearer <token>
```

#### 6. Delete Leave Policy (Soft Delete)
```http
DELETE /api/leave-policies/:id
Authorization: Bearer <token>
```

---

## 🏗️ Database Architecture

### Ledger-Based Approach

```
hrms_leave_ledger (Source of Truth)
    ↓ Updates
hrms_employee_leave_balance (Cached for Performance)
```

**Benefits:**
- Complete audit trail
- Easy reconciliation
- Historical accuracy
- Handles complex scenarios (reversals, adjustments)

### Leave Type Flow

```
Default Leave Types (company_id = 0)
    ↓ Clone/Customize
Company-Specific Leave Types (master_id references default)
    ↓ Add to
Leave Policy
    ↓ Assign to
Employees (leave_policy_id)
```

---

## 📝 Key Design Decisions

### 1. ✅ Ledger vs Balance Table
- **Decision:** Both (Ledger = source of truth, Balance = cache)
- **Reason:** Performance + Complete audit trail

### 2. ✅ Reversal Tracking
- **Decision:** Only `reverses_transaction_id` (no `reversed_by_transaction_id`)
- **Reason:** Simpler, sufficient for tracking

### 3. ✅ Pending Approval
- **Decision:** NOT stored in balance table
- **Reason:** Calculated real-time from request system

### 4. ✅ Policy Mapping Soft Delete
- **Decision:** `is_active` + `deleted_at` in mapping table
- **Reason:** Maintains history when leave types are removed

### 5. ✅ No `is_default` in Policy
- **Decision:** Create default policy during company onboarding
- **Reason:** Simpler, no need to manage default flag

### 6. ✅ Dedicated Audit Log for Leave Types
- **Decision:** Separate table per entity type
- **Reason:** Better performance, no table_name filtering needed

### 7. ✅ Status-Based Leave Credits
- **Decision:** Fields like `active_leaves_to_credit`, `probation_leaves_to_credit`
- **Reason:** Different credits for different employee statuses

---

## 📂 Files Created

### Models
- `src/models/HrmsLeaveMaster.js`
- `src/models/HrmsLeaveLedger.js`
- `src/models/HrmsEmployeeLeaveBalance.js`
- `src/models/HrmsLeavePolicyMaster.js`
- `src/models/HrmsLeavePolicyMapping.js`
- `src/models/HrmsLeaveTypeAuditLog.js`
- `src/models/HrmsEmployee.js` (updated)

### Services
- `src/services/leaveType.service.js`
- `src/services/leavePolicy.service.js`

### Controllers
- `src/controllers/leaveType.controller.js`
- `src/controllers/leavePolicy.controller.js`

### Routes
- `src/routes/leaveType.routes.js`
- `src/routes/leavePolicy.routes.js`
- `src/routes/index.js` (updated)

### Seeds
- `database/seeds/default_leave_types.sql`

---

## 🚀 Next Steps

### 1. Database Setup
```bash
# Start your Node.js server
npm run dev

# Sequelize will auto-create tables from models
# Then run seed data:
```

```sql
-- Execute in MySQL
source database/seeds/default_leave_types.sql;
```

### 2. Company Onboarding Hook
When a new company is created, automatically create a default leave policy:

```javascript
// In your company onboarding service
const leavePolicyService = require('./services/leavePolicy.service');

// After company creation
await leavePolicyService.createLeavePolicy({
  company_id: newCompany.id,
  policy_name: 'General Leave Policy',
  policy_description: 'Default leave policy for all employees',
  leave_type_ids: [1, 5, 6, 7], // CL, SL, PL, LOP
  user_id: admin_user_id
});
```

### 3. Test APIs
Use Postman or similar to test all endpoints

---

## 📊 Example Usage Scenarios

### Scenario 1: Create Custom Leave Type
1. Admin creates custom "Work From Home" leave type
2. System logs creation in audit table
3. Admin adds it to existing policy
4. Employees can now request WFH leaves

### Scenario 2: Employee Takes Leave
1. Employee applies for 2 days CL (via generic request system)
2. Manager approves
3. System creates debit entry in ledger: `-2 days`
4. Balance table updated automatically
5. If cancelled: Reversal entry created: `+2 days` (with `reverses_transaction_id`)

### Scenario 3: Temporarily Disable Leave Type
1. Admin wants to stop Comp Off temporarily
2. Uses toggle API to set `is_active = false`
3. Leave type hidden from employees
4. History maintained (not deleted)
5. Can be re-enabled anytime

---

## ✨ Features

- ✅ Comprehensive leave type configuration
- ✅ Ledger-based transaction tracking
- ✅ Field-level audit logging
- ✅ Soft delete everywhere (no data loss)
- ✅ Status-based leave credits
- ✅ Policy management with history
- ✅ Monthly/yearly balance tracking
- ✅ Reversal support for cancellations
- ✅ Penalty support
- ✅ Carry forward, encashment, lapse handling

---

**Implementation Complete! 🎉**
