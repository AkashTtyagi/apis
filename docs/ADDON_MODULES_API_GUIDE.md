# Company Addon Modules - API Guide

## Overview
Companies can purchase additional modules (add-ons) beyond their base package. This allows flexible module access without changing the entire package.

---

## Architecture

```
Company → Base Package (COREHR, ATTENDANCE)
       → Addon Modules (PAYROLL, RECRUITMENT) ← Extra purchases
```

### Example Scenario:
```
Company: ABC Corp
├─ Base Package: "Startup Plan"
│  ├─ COREHR
│  ├─ ATTENDANCE
│  └─ LEAVE
│
└─ Addon Modules (purchased separately):
   ├─ PAYROLL (extra ₹5,000/month)
   └─ RECRUITMENT (extra ₹3,000/month)

Total Accessible Modules = Base (3) + Addons (2) = 5 modules
```

---

## Database Structure

### Table: `hrms_company_addon_modules`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT UNSIGNED | Primary key |
| `company_id` | INT | FK to hrms_companies |
| `module_id` | INT UNSIGNED | FK to hrms_modules |
| `is_active` | BOOLEAN | Active status |
| `added_by` | INT | User who added addon |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Update time |

**Key Features:**
- ✅ No start/end dates (active until removed)
- ✅ Unique constraint: one addon per module per company
- ✅ Soft delete via `is_active` flag
- ✅ Cascade delete with company/module

---

## API Endpoints

### Base URL: `/api/package/company-packages`

---

### 1. **Add Addon Module**
**Endpoint:** `POST /api/package/company-packages/add-addon`

**Description:** Add an additional module to a company

**Request Body:**
```json
{
  "company_id": 23,
  "module_id": 5
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Addon module added successfully",
  "data": {
    "id": 1,
    "company_id": 23,
    "module_id": 5,
    "is_active": true,
    "added_by": 1,
    "created_at": "2025-01-12T10:30:00.000Z",
    "updated_at": "2025-01-12T10:30:00.000Z"
  }
}
```

**CURL:**
```bash
curl --location --request POST 'http://api.zuhu.store/api/package/company-packages/add-addon' \
--header 'Authorization: Bearer YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "company_id": 23,
  "module_id": 5
}'
```

---

### 2. **Remove Addon Module**
**Endpoint:** `POST /api/package/company-packages/remove-addon`

**Description:** Remove an addon module from a company (soft delete)

**Request Body:**
```json
{
  "company_id": 23,
  "module_id": 5
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Addon module removed successfully",
  "data": {
    "id": 1,
    "company_id": 23,
    "module_id": 5,
    "is_active": false,
    "added_by": 1,
    "created_at": "2025-01-12T10:30:00.000Z",
    "updated_at": "2025-01-12T11:45:00.000Z"
  }
}
```

**CURL:**
```bash
curl --location --request POST 'http://api.zuhu.store/api/package/company-packages/remove-addon' \
--header 'Authorization: Bearer YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "company_id": 23,
  "module_id": 5
}'
```

---

### 3. **Get All Addons for Company**
**Endpoint:** `POST /api/package/company-packages/get-addons`

**Description:** Get list of all active addon modules for a company

**Request Body:**
```json
{
  "company_id": 23
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Addon modules retrieved successfully",
  "data": [
    {
      "id": 1,
      "company_id": 23,
      "module_id": 5,
      "is_active": true,
      "added_by": 1,
      "created_at": "2025-01-12T10:30:00.000Z",
      "updated_at": "2025-01-12T10:30:00.000Z",
      "module": {
        "id": 5,
        "module_code": "PAYROLL",
        "module_name": "Payroll Management",
        "module_description": "Complete payroll processing",
        "module_icon": "payroll-icon",
        "display_order": 5,
        "is_active": true
      }
    },
    {
      "id": 2,
      "company_id": 23,
      "module_id": 8,
      "is_active": true,
      "added_by": 1,
      "created_at": "2025-01-12T11:00:00.000Z",
      "updated_at": "2025-01-12T11:00:00.000Z",
      "module": {
        "id": 8,
        "module_code": "RECRUITMENT",
        "module_name": "Recruitment Management",
        "module_description": "End-to-end hiring process",
        "module_icon": "recruitment-icon",
        "display_order": 8,
        "is_active": true
      }
    }
  ],
  "count": 2
}
```

**CURL:**
```bash
curl --location --request POST 'http://api.zuhu.store/api/package/company-packages/get-addons' \
--header 'Authorization: Bearer YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "company_id": 23
}'
```

---

### 4. **Get All Accessible Modules (Updated)**
**Endpoint:** `POST /api/package/company-packages/get-modules`

**Description:** Get ALL modules accessible to company (base package + addons combined)

**Request Body:**
```json
{
  "company_id": 23
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "module_code": "COREHR",
      "module_name": "Core HR",
      "module_description": "Employee master data",
      "is_active": true
    },
    {
      "id": 2,
      "module_code": "ATTENDANCE",
      "module_name": "Attendance Management",
      "module_description": "Clock in/out tracking",
      "is_active": true
    },
    {
      "id": 3,
      "module_code": "LEAVE",
      "module_name": "Leave Management",
      "module_description": "Leave requests and approvals",
      "is_active": true
    },
    {
      "id": 5,
      "module_code": "PAYROLL",
      "module_name": "Payroll Management",
      "module_description": "Payroll processing (ADDON)",
      "is_active": true
    },
    {
      "id": 8,
      "module_code": "RECRUITMENT",
      "module_name": "Recruitment Management",
      "module_description": "Hiring process (ADDON)",
      "is_active": true
    }
  ],
  "count": 5
}
```

**CURL:**
```bash
curl --location --request POST 'http://api.zuhu.store/api/package/company-packages/get-modules' \
--header 'Authorization: Bearer YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "company_id": 23
}'
```

---

## How Menus Work with Modules

### Menu → Module Relationship

Each menu in `hrms_menus` has `module_id`:

```sql
SELECT
    m.module_code,
    m.module_name,
    menu.menu_name,
    menu.route_path
FROM hrms_modules m
JOIN hrms_menus menu ON m.id = menu.module_id
WHERE m.id = 5  -- PAYROLL module
  AND menu.is_active = TRUE;
```

**Result:**
```
PAYROLL | Payroll Management | Payroll Dashboard | /payroll/dashboard
PAYROLL | Payroll Management | Payroll Run       | /payroll/run
PAYROLL | Payroll Management | Salary Structure  | /payroll/structure
```

### User Menu Access Flow:

```
User → Company → Accessible Modules (Base + Addons)
                 ↓
            Modules → Menus (via module_id)
                 ↓
            Role Permissions → Filter menus
                 ↓
            Final Menu List (user sees)
```

---

## Business Rules

### Addon Management:
1. ✅ Company can add unlimited addon modules
2. ✅ Cannot add same addon twice (unique constraint)
3. ✅ Reactivating removed addon is allowed
4. ✅ Removing addon = soft delete (is_active = false)
5. ✅ Base package modules cannot be removed (only addons)

### Module Access:
1. ✅ Base package modules always accessible (if package active)
2. ✅ Addon modules accessible independently
3. ✅ Duplicate modules (base + addon) are filtered
4. ✅ Role permissions apply on top of module access

---

## Error Scenarios

### Error 1: Module Not Found
```json
{
  "success": false,
  "message": "Module not found or inactive"
}
```

### Error 2: Addon Already Exists
```json
{
  "success": false,
  "message": "This addon module is already assigned to the company"
}
```

### Error 3: Addon Not Found
```json
{
  "success": false,
  "message": "Addon module not found or already inactive"
}
```

---

## Migration Instructions

### Step 1: Run Migration
```bash
mysql -u root -p hrms_db < database/migrations/package/004_create_company_addon_modules.sql
```

### Step 2: Verify Table
```sql
SHOW CREATE TABLE hrms_company_addon_modules;
```

### Step 3: Test with Sample Data
```sql
-- Add PAYROLL as addon for company 23
INSERT INTO hrms_company_addon_modules
  (company_id, module_id, is_active, added_by)
VALUES
  (23, 5, TRUE, 1);

-- Verify
SELECT * FROM hrms_company_addon_modules WHERE company_id = 23;
```

---

## Testing Checklist

- [ ] Run migration successfully
- [ ] Test add addon API
- [ ] Test duplicate addon (should fail)
- [ ] Test remove addon API
- [ ] Test get addons API
- [ ] Test get-modules API (base + addons combined)
- [ ] Verify role permissions still work
- [ ] Test menu access with addon modules
- [ ] Test reactivating removed addon

---

## Files Modified/Created

### Created:
1. ✅ `database/migrations/package/004_create_company_addon_modules.sql`
2. ✅ `src/models/package/HrmsCompanyAddonModule.js`

### Modified:
1. ✅ `src/models/package/index.js` - Added associations
2. ✅ `src/services/package/companyPackage.service.js` - Added addon functions
3. ✅ `src/controllers/package/companyPackage.controller.js` - Added addon endpoints
4. ✅ `src/routes/package/companyPackage.routes.js` - Added addon routes

---

## Summary

**Add-on System Benefits:**
- ✅ Flexible module purchasing
- ✅ No date restrictions (active until removed)
- ✅ Simple activation/deactivation
- ✅ Works seamlessly with existing package system
- ✅ Automatic module + menu access

**Key Points:**
- `module_id` in `hrms_menus` remains (for UI grouping)
- Addon modules work independently of base package
- Combined module access (base + addon) in `getCompanyModules()`
- Role permissions apply after module access check

---

**Document Version:** 1.0
**Last Updated:** 2025-01-12
**Author:** HRMS Development Team
