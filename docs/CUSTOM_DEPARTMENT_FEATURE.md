# Custom Department Feature

## Overview
Admin can now create **custom departments** in addition to selecting from industry master departments.

---

## Database Changes

### Migration File
**Location**: `database/migrations/departments/001_add_company_department_name.sql`

### Changes Made:
1. **Added Column**: `company_department_name VARCHAR(100) NULL`
   - Stores custom department name
   - NULL if using master department

2. **Modified Column**: `department_id` → Now `NULLABLE`
   - NULL for custom departments
   - Has value for master departments

3. **Added Index**: `idx_company_department_name`

4. **Modified Unique Constraint**:
   - Removed: `unique_company_department` (company_id + department_id)
   - Added: `unique_company_dept_name` (company_id + company_department_name)

---

## How It Works

### Flow 1: Master Department (From Industry Master)
```
Admin selects department from industry master
  ↓
department_id = 5 (e.g., HR)
company_department_name = NULL
  ↓
Display: Use hrms_department_master.department_name
```

### Flow 2: Custom Department
```
Admin creates custom department
  ↓
department_id = NULL
company_department_name = "Digital Marketing"
  ↓
Display: Use company_department_name directly
```

---

## API Usage

### 1. Create Custom Department
**Endpoint**: `POST /api/departments/create`

**Request Body**:
```json
{
  "company_department_name": "Digital Marketing",
  "department_head_id": null
}
```

**Response**:
```json
{
  "success": true,
  "message": "Custom department created successfully",
  "data": {
    "orgDepartment": {
      "id": 10,
      "company_id": 1,
      "department_id": null,
      "company_department_name": "Digital Marketing",
      "department_head_id": null,
      "is_active": true
    }
  }
}
```

### 2. Create Department from Master
**Endpoint**: `POST /api/departments/create`

**Request Body**:
```json
{
  "department_id": 5,
  "department_head_id": null
}
```

**Response**:
```json
{
  "success": true,
  "message": "Department assigned to organization successfully",
  "data": {
    "orgDepartment": {
      "id": 11,
      "company_id": 1,
      "department_id": 5,
      "company_department_name": null,
      "department_head_id": null,
      "is_active": true
    }
  }
}
```

### 3. List Departments
**Endpoint**: `POST /api/departments/list`

**Request Body**:
```json
{
  "activeOnly": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Organization departments retrieved successfully",
  "data": {
    "departments": [
      {
        "id": 10,
        "company_id": 1,
        "department_id": null,
        "department_name": "Digital Marketing",
        "department_code": null,
        "description": null,
        "is_custom": true,
        "department_head_id": null,
        "is_active": true
      },
      {
        "id": 11,
        "company_id": 1,
        "department_id": 5,
        "department_name": "Human Resources",
        "department_code": "HR",
        "description": "HR Department",
        "is_custom": false,
        "department_head_id": null,
        "is_active": true
      }
    ]
  }
}
```

**Note**: The `is_custom` flag indicates whether it's a custom department or master department.

---

## Code Changes

### 1. Model Updated
**File**: `src/models/HrmsCompanyDepartments.js`

**Changes**:
- Added `company_department_name` field
- Made `department_id` nullable
- Updated indexes

### 2. Service Updated
**File**: `src/services/orgDepartment.service.js`

**Changes**:
- `createOrgDepartment()`: Now accepts `company_department_name`
- Validates that either `department_id` OR `company_department_name` is provided
- `getOrgDepartments()`: Returns formatted response with `department_name` prioritizing `company_department_name` over master name

### 3. Controller Updated
**File**: `src/controllers/orgDepartment.controller.js`

**Changes**:
- `createOrgDepartment()`: Now accepts `company_department_name` from request body
- Returns different success message for custom vs master department

---

## Validation Rules

1. **One or the Other** (XOR logic):
   - Either `department_id` OR `company_department_name` must be provided
   - Cannot provide both

2. **Unique Names**:
   - Custom department names must be unique within a company
   - Checked via database unique constraint

3. **Required Fields**:
   - If custom: `company_department_name` is required
   - If master: `department_id` is required

---

## Frontend Implementation Guide

### Department Creation Form

```javascript
// UI: Radio buttons or toggle
const departmentType = 'custom'; // or 'master'

if (departmentType === 'custom') {
  // Show text input for department name
  const payload = {
    company_department_name: "Digital Marketing",
    department_head_id: selectedHeadId
  };
} else {
  // Show dropdown with master departments
  const payload = {
    department_id: selectedMasterId,
    department_head_id: selectedHeadId
  };
}

// POST to /api/departments/create
```

### Display Logic

```javascript
// When displaying departments list
departments.forEach(dept => {
  const displayName = dept.department_name; // Already handled by backend
  const isCustom = dept.is_custom;
  
  // Show custom badge if needed
  if (isCustom) {
    console.log(`${displayName} (Custom)`);
  } else {
    console.log(`${displayName} (Master)`);
  }
});
```

---

## Postman Collection

**Section**: 5. Departments

**New Requests**:
1. **Create Department (From Master)** - Select from industry master
2. **Create Custom Department** - Create company-specific department
3. **List Departments** - Shows both types with `is_custom` flag

---

## Migration Steps

1. **Run Migration**:
   ```bash
   mysql -u root -p hrms_db < database/migrations/departments/001_add_company_department_name.sql
   ```

2. **Restart Server**: 
   ```bash
   npm start
   ```

3. **Test via Postman**:
   - Import updated collection
   - Test creating custom department
   - Test creating master department
   - Verify list shows both correctly

---

## Benefits

✅ **Flexibility**: Companies can create departments specific to their structure
✅ **No Master Bloat**: Don't need to add every possible department to master
✅ **Easy Migration**: Existing master departments continue to work
✅ **Clear Identification**: `is_custom` flag distinguishes the type
✅ **Validation**: Prevents duplicates and invalid combinations

---

## Example Use Cases

1. **Startup with Unique Structure**:
   - Creates "Growth Hacking" department (not in master)
   - Creates "Customer Success" department (not in master)

2. **Traditional Company**:
   - Uses "Human Resources" from master
   - Uses "Finance" from master
   - Creates "Digital Transformation" as custom

3. **Hybrid Approach**:
   - Mix of master and custom departments
   - All tracked in same table

---

**Created**: October 20, 2025
**Version**: 1.0

---

## Master API Integration

The `/api/master/data` API has been updated to handle custom departments properly.

### Master API Request
**Endpoint**: `POST /api/master/data`

**Request Body**:
```json
{
  "master_type": "department"
}
```

### Master API Response
```json
{
  "success": true,
  "message": "department data retrieved successfully",
  "data": [
    {
      "id": 10,
      "code": null,
      "name": "Digital Marketing",
      "is_custom": true,
      "department_id": null
    },
    {
      "id": 11,
      "code": "HR",
      "name": "Human Resources",
      "is_custom": false,
      "department_id": 5
    }
  ]
}
```

### Key Points:
- **Smart Name Resolution**: Prioritizes `company_department_name` over `master.department_name`
- **Custom Flag**: `is_custom` indicates whether it's a custom department
- **Code Field**: NULL for custom departments, populated from master for standard departments
- **LEFT JOIN**: Uses LEFT JOIN with `hrms_department_master` so custom departments (without master reference) are still included

### Frontend Dropdown Integration
```javascript
// Fetch departments for dropdown
const response = await fetch('/api/master/data', {
  method: 'POST',
  body: JSON.stringify({ master_type: 'department' })
});

const { data: departments } = await response.json();

// Render in dropdown
departments.forEach(dept => {
  const badge = dept.is_custom ? '(Custom)' : '';
  // Display: dept.name + badge
  // Value: dept.id
});
```

---

## Files Modified for Master API Support

### 1. `src/services/master.service.js`

**Changes**:
- Added `HrmsDepartmentMaster` import
- Updated `department` configuration in `MASTER_CONFIG`:
  - Added `requiresJoin: true` flag
  - Added `joinModel` and `joinAs` properties
- Added special handling in `getMasterDataBySlug()`:
  - Checks if `masterSlug === 'department'`
  - Performs LEFT JOIN with `hrms_department_master`
  - Returns formatted response with `company_department_name` OR `master.department_name`
  - Includes `is_custom` flag in response

**Code Snippet**:
```javascript
// Special handling for department (requires JOIN with department_master)
if (masterSlug === 'department') {
    const departments = await config.model.findAll({
        where: whereClause,
        include: [
            {
                model: config.joinModel,
                as: config.joinAs,
                attributes: ['department_name', 'department_code', 'description'],
                required: false  // LEFT JOIN
            }
        ],
        raw: false,
        nest: true
    });

    // Format response
    return departments.map(dept => {
        const deptObj = dept.toJSON();
        return {
            id: deptObj.id,
            code: deptObj.department?.department_code || null,
            name: deptObj.company_department_name || deptObj.department?.department_name || null,
            is_custom: deptObj.company_department_name ? true : false,
            department_id: deptObj.department_id
        };
    });
}
```

---

**Updated**: October 20, 2025
**Version**: 1.1 - Added Master API Integration
