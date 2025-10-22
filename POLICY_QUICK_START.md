# Policy Management System - Quick Start Guide

## 🚀 Setup (3 Steps)

### 1. Run Database Migration
```bash
cd /Users/akashtyagi/Documents/HRMS
mysql -u your_user -p your_database < database/migrations/policy/001_create_policy_tables.sql
```

### 2. Import Postman Collection
1. Open Postman
2. Import `postman/HRMS_Complete_Collection.postman_collection.json`
3. Find these two new folders:
   - **Admin - Policy Management** (6 subfolders, 21+ endpoints)
   - **ESS - Policy Management** (4 subfolders, 8 endpoints)

### 3. Server Already Ready ✅
Routes are already registered in `src/routes/index.js`:
- `/api/admin/policy/*` - Admin APIs
- `/api/ess/policy/*` - ESS APIs

---

## 📋 Quick Test Workflow

### Admin Flow (5 minutes)

1. **Create Category**
   ```
   POST /api/admin/policy/categories/create
   {
     "company_id": 1,
     "category_name": "Test Policies",
     "category_slug": "test_policies"
   }
   ```

2. **Create Policy**
   ```
   POST /api/admin/policy/create
   {
     "company_id": 1,
     "category_id": 1,
     "policy_title": "Test Policy",
     "policy_slug": "test_policy",
     "requires_acknowledgment": true,
     "force_acknowledgment": true,
     "grace_period_days": 7
   }
   ```

3. **Set Applicability (Company-Wide)**
   ```
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
   ```

4. **Assign to Employees**
   ```
   POST /api/admin/policy/assign
   {
     "policy_id": 1
   }
   ```

5. **Check Stats**
   ```
   POST /api/admin/policy/analytics/stats
   {
     "policy_id": 1
   }
   ```

### ESS Flow (2 minutes)

1. **Check Access Summary**
   ```
   POST /api/ess/policy/access-summary
   {
     "employee_id": 1
   }
   ```

2. **View Pending Policies**
   ```
   POST /api/ess/policy/pending
   {
     "employee_id": 1
   }
   ```

3. **View Policy Details**
   ```
   POST /api/ess/policy/details
   {
     "employee_id": 1,
     "acknowledgment_id": 1
   }
   ```

4. **Acknowledge Policy**
   ```
   POST /api/ess/policy/acknowledge
   {
     "acknowledgment_id": 1,
     "employee_id": 1,
     "acknowledgment_comments": "I understand"
   }
   ```

---

## 📁 File Structure

```
HRMS/
├── database/migrations/policy/
│   └── 001_create_policy_tables.sql ✅ (8 tables)
│
├── src/
│   ├── models/policy/
│   │   ├── HrmsPolicyCategory.js ✅
│   │   ├── HrmsPolicy.js ✅
│   │   ├── HrmsPolicyVersion.js ✅
│   │   ├── HrmsPolicyAttachment.js ✅
│   │   ├── HrmsPolicyApplicability.js ✅ (workflow pattern)
│   │   ├── HrmsEmployeePolicyAcknowledgment.js ✅
│   │   ├── HrmsPolicyAcknowledgmentAudit.js ✅
│   │   ├── HrmsPolicyNotification.js ✅
│   │   └── index.js ✅
│   │
│   ├── services/policy/
│   │   ├── admin.policy.service.js ✅ (16 functions)
│   │   └── ess.policy.service.js ✅ (8 functions)
│   │
│   ├── controllers/policy/
│   │   ├── admin.policy.controller.js ✅ (21 endpoints)
│   │   └── ess.policy.controller.js ✅ (8 endpoints)
│   │
│   └── routes/
│       ├── policy/
│       │   ├── admin.policy.routes.js ✅
│       │   └── ess.policy.routes.js ✅
│       └── index.js ✅ (updated)
│
└── postman/
    └── HRMS_Complete_Collection.postman_collection.json ✅ (updated)
```

---

## 🎯 Key API Endpoints

### Admin (21 endpoints)
```
Categories (4):
  POST /admin/policy/categories/create
  POST /admin/policy/categories/list
  POST /admin/policy/categories/update
  POST /admin/policy/categories/delete

Policies (5):
  POST /admin/policy/create
  POST /admin/policy/list
  POST /admin/policy/details
  POST /admin/policy/update
  POST /admin/policy/delete

Versions (4):
  POST /admin/policy/version/create
  POST /admin/policy/version/publish
  POST /admin/policy/version/rollback
  POST /admin/policy/version/list

Applicability (2):
  POST /admin/policy/applicability/set
  POST /admin/policy/applicability/get

Assignment (1):
  POST /admin/policy/assign

Analytics (3):
  POST /admin/policy/analytics/stats
  POST /admin/policy/analytics/pending-employees
  POST /admin/policy/send-reminder
```

### ESS (8 endpoints)
```
Policies (4):
  POST /ess/policy/list
  POST /ess/policy/pending
  POST /ess/policy/acknowledged
  POST /ess/policy/details

Acknowledgment (1):
  POST /ess/policy/acknowledge

Access (2):
  POST /ess/policy/check-block
  POST /ess/policy/access-summary

Categories (1):
  POST /ess/policy/categories/list
```

---

## 🔑 Key Features

### ✅ Admin Capabilities
- Full CRUD for policies & categories
- Version control (create, publish, rollback)
- Flexible applicability (company, entity, dept, employee, etc.)
- Policy assignment
- Analytics & reporting
- Manual reminders

### ✅ ESS Capabilities
- View assigned policies
- View pending policies
- View policy details with attachments
- Acknowledge policies
- Check ESS block status
- Access summary

### ✅ Technical Highlights
- Applicability follows **HrmsWorkflowApplicability** pattern exactly
- **Complete ESS blocking** (not module-specific)
- Version control with rollback
- Complete audit trail
- Grace periods before blocking
- Notification queue ready

---

## 📚 Documentation Files

1. **POLICY_QUICK_START.md** ← You are here
2. **ADMIN_ESS_POLICY_STRUCTURE.md** - Detailed structure
3. **POLICY_IMPLEMENTATION_SUMMARY.md** - Complete summary
4. **POLICY_MANAGEMENT_README.md** - Original docs

---

## ✨ You're Ready!

1. ✅ Database migration ready to run
2. ✅ All code files created and routes registered
3. ✅ Postman collection updated with Admin & ESS folders
4. ✅ Documentation complete

Just run the migration and test the APIs! 🚀
