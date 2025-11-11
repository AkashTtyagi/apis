# Super Admin Implementation Guide

## Overview
This document explains how the Super Admin feature works in the HRMS Role & Permission system.

**Super Admin Definition:**
- **Full access** to ALL applications (Admin, ESS, etc.) with a single role assignment
- **Full permissions** (VIEW, CREATE, UPDATE, DELETE, etc.) on all menus
- **Package-aware** - Access limited to modules included in company's subscription package

**What Super Admin is NOT:**
- Not a package bypass (still respects company's purchased modules)
- Not unlimited system access (limited by package modules)

---

## Key Concepts

### 1. Super Admin Role Master
- **application_id = NULL** in `hrms_role_master` table
- Indicates this role provides access to ALL applications
- When creating company roles from this master, **ONE role** is created with `application_id = NULL`

### 2. Super Admin Company Role
- **is_super_admin = TRUE** AND **application_id = NULL** in `hrms_roles` table
- Single role record covers ALL applications (present and future)
- Links back to the super admin role master
- **Key Benefit:** When new application is added, super admin automatically has access (no manual updates needed)

### 3. Super Admin User Assignment
- When assigning a super admin role to a user:
  - Creates **ONE** `hrms_user_roles` record with `application_id = NULL`
  - This single record grants access to ALL active applications
  - Grants **full permissions** on all menus within **company's package modules**
  - **Future-proof:** New applications are automatically accessible

### 4. Super Admin Scope (IMPORTANT)
Super Admin provides:
- ✅ **All APPLICATIONS access** (Admin, ESS, etc.)
- ✅ **All PERMISSIONS** (VIEW, CREATE, UPDATE, DELETE, etc.) on accessible menus
- ✅ **Full control** within company's subscribed modules

Super Admin does **NOT** bypass:
- ❌ **Package restrictions** - Still limited to company's purchased modules
- ❌ **Module access** - Cannot access modules not in company's package

**Example:**
- Company has BASIC package with only "Employee" and "Attendance" modules
- Super Admin user can:
  - Access ALL applications (Admin + ESS)
  - Have ALL permissions on Employee and Attendance menus
- Super Admin user CANNOT:
  - Access "Payroll" module (not in package)
  - Access "Leave Management" module (not in package)

---

## Database Changes

### Schema Modifications

**File:** `database/migrations/role_permission/002_add_super_admin_support.sql`

#### 1. hrms_role_master
```sql
-- application_id is now NULLABLE
ALTER TABLE `hrms_role_master`
  MODIFY COLUMN `application_id` INT UNSIGNED NULL
  COMMENT 'NULL = Super Admin (access to all applications)';

-- Super admin role master
INSERT INTO `hrms_role_master`
  (application_id, role_code, role_name, role_description, display_order)
VALUES
  (NULL, 'SUPER_ADMIN', 'Super Administrator', 'Full system access', 0);
```

#### 2. hrms_roles
```sql
-- New flag to identify super admin roles
ALTER TABLE `hrms_roles`
  ADD COLUMN `is_super_admin` BOOLEAN NOT NULL DEFAULT FALSE
  COMMENT 'TRUE if role is created from super admin role master';

-- Make application_id nullable for super admin roles
ALTER TABLE `hrms_roles`
  MODIFY COLUMN `application_id` INT UNSIGNED NULL
  COMMENT 'NULL = Super Admin (access to all applications), INT = specific application';

-- Drop unique index (MySQL treats NULL != NULL, so unique allows duplicates)
ALTER TABLE `hrms_roles` DROP INDEX `unique_company_app_role`;

-- Add regular index instead (code-level validation prevents duplicate super admin)
ALTER TABLE `hrms_roles`
  ADD INDEX `idx_company_app_role` (`company_id`, `application_id`, `role_code`);
```

#### 3. hrms_user_roles
```sql
-- Make application_id nullable for super admin user assignments
ALTER TABLE `hrms_user_roles`
  MODIFY COLUMN `application_id` INT UNSIGNED NULL
  COMMENT 'NULL = Super Admin user (access to all applications), INT = specific application';
```

**Important Note on Indexes:**
- MySQL treats `NULL != NULL` in unique indexes
- This means unique index `(company_id, NULL, 'SUPER_ADMIN')` allows multiple duplicates
- Solution: Use regular index + code-level validation in `createRoleFromMaster`

---

## API Usage

### 1. Create Super Admin Role for Company

**Endpoint:** `POST /api/role-permission/roles/create-from-master`

```json
{
  "company_id": 100,
  "role_master_id": 1  // ID of super admin role master
}
```

**Response:**
```json
{
  "success": true,
  "message": "Super admin role created successfully. This role provides access to ALL applications.",
  "data": {
    "is_super_admin": true,
    "role": {
      "id": 10,
      "company_id": 100,
      "application_id": null,
      "role_code": "SUPER_ADMIN",
      "role_name": "Super Administrator",
      "is_super_admin": true
    }
  }
}
```

**What Happens:**
- System checks if super admin role already exists for company (prevents duplicates)
- Creates **ONE** company role with `application_id = NULL`
- This single role provides access to ALL applications (present and future)
- Role is marked with `is_super_admin = TRUE`
- Role is linked to the super admin role master

**Database Result:**
```sql
-- hrms_roles table
id | company_id | application_id | role_code   | is_super_admin
10 | 100        | NULL          | SUPER_ADMIN | TRUE
```

---

### 2. Assign Super Admin Role to User

**Endpoint:** `POST /api/role-permission/permissions/users/assign-role`

```json
{
  "user_id": 500,
  "company_id": 100,
  "role_id": 10  // Super admin role ID
}
```

**Response:**
```json
{
  "success": true,
  "message": "Super admin role assigned successfully. User now has access to ALL applications.",
  "data": {
    "is_super_admin": true,
    "userRole": {
      "id": 1,
      "user_id": 500,
      "role_id": 10,
      "company_id": 100,
      "application_id": null,
      "is_active": true,
      "assigned_at": "2025-01-15T10:30:00Z"
    }
  }
}
```

**What Happens:**
- System detects the role has `is_super_admin = TRUE` AND `application_id = NULL`
- Checks if user already has super admin role assigned (prevents duplicates)
- Creates **ONE** `hrms_user_roles` record with `application_id = NULL`
- User now has super admin access to ALL applications (present and future)

**Database Result:**
```sql
-- hrms_user_roles table
id | user_id | role_id | company_id | application_id | is_active
1  | 500     | 10      | 100        | NULL          | TRUE
```

---

### 3. Check if User is Super Admin

**Endpoint:** Use in backend service

```javascript
const { isUserSuperAdmin } = require('./services/role_permission/role.service');

const isSuperAdmin = await isUserSuperAdmin(userId, companyId);

if (isSuperAdmin) {
  // Grant full access
}
```

---

### 4. Get User Menus (Super Admin)

**Endpoint:** `POST /api/role-permission/menus/get-user-menus`

```json
{
  "user_id": 500,
  "company_id": 100,
  "application_id": 1
}
```

**For Super Admin Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "menu_code": "DASHBOARD",
      "menu_name": "Dashboard",
      "menu_type": "screen",
      "permissions": ["VIEW", "CREATE", "UPDATE", "DELETE", "EXPORT", "APPROVE", "REJECT", "PRINT"],
      "has_access": true,
      "children": [...]
    }
  ]
}
```

**Key Points:**
- Super admin gets ALL menus, regardless of package restrictions
- Super admin gets ALL permissions on every screen
- `has_access = true` for all menus

---

## Service Implementation

### role.service.js

#### 1. Get Role Masters with Super Admin Filter
```javascript
const getAllRoleMasters = async (filters = {}) => {
  const where = {};

  if (filters.application_id === 'super_admin') {
    // Get only super admin roles
    where.application_id = null;
  } else if (filters.application_id) {
    // Get specific app + super admin roles
    where[Op.or] = [
      { application_id: null },
      { application_id: filters.application_id }
    ];
  }

  return await HrmsRoleMaster.findAll({ where });
};
```

#### 2. Create Role from Super Admin Master (UPDATED)
```javascript
const createRoleFromMaster = async (roleData, userId) => {
  const roleMaster = await HrmsRoleMaster.findByPk(role_master_id);

  if (roleMaster.application_id === null) {
    // Super Admin - Create ONE role with application_id = NULL
    // This single role covers ALL applications (present and future)

    // Check if super admin role already exists for this company
    const existingSuperAdmin = await HrmsRole.findOne({
      where: {
        company_id,
        application_id: null,
        is_super_admin: true,
        is_active: true
      }
    });

    if (existingSuperAdmin) {
      throw new Error('Super admin role already exists for this company');
    }

    // Create ONE super admin role with NULL application_id
    const role = await HrmsRole.create({
      company_id,
      application_id: null,  // NULL = covers ALL applications
      role_master_id,
      role_code: roleMaster.role_code,
      role_name: roleMaster.role_name,
      is_super_admin: true,
      is_active: true,
      created_by: userId
    });

    return {
      message: 'Super admin role created successfully. This role provides access to ALL applications.',
      role,
      is_super_admin: true
    };
  } else {
    // Normal role - create for specific application
    // ...
  }
};
```

#### 3. Check Super Admin Status
```javascript
const isUserSuperAdmin = async (userId, companyId) => {
  const superAdminRole = await HrmsUserRole.findOne({
    where: { user_id: userId, is_active: true },
    include: [{
      model: HrmsRole,
      as: 'role',
      where: {
        company_id: companyId,
        is_super_admin: true,
        is_active: true
      }
    }]
  });

  return !!superAdminRole;
};
```

---

### menu.service.js

#### 1. Get User Menus with Super Admin Support (UPDATED)
```javascript
const getUserMenus = async (userId, companyId, applicationId) => {
  const isSuperAdmin = await isUserSuperAdmin(userId, companyId);

  // Get company's package modules
  // NOTE: Super admin RESPECTS package restrictions
  const companyModules = await getCompanyModules(companyId);
  const moduleIds = companyModules.map(m => m.id);

  // CRITICAL FIX: Get user's roles INCLUDING super admin (application_id = NULL)
  const userRoles = await HrmsUserRole.findAll({
    where: {
      user_id: userId,
      [Op.or]: [
        { application_id: applicationId },
        { application_id: null }  // ✅ Include super admin roles
      ],
      is_active: true
    },
    include: [/* ... role and permissions ... */]
  });

  // Get user permission overrides INCLUDING super admin
  const userPermissions = await HrmsUserMenuPermission.findAll({
    where: {
      user_id: userId,
      [Op.or]: [
        { application_id: applicationId },
        { application_id: null }  // ✅ Include super admin overrides
      ],
      is_active: true
    },
    include: [/* ... permission details ... */]
  });

  // Build permission map and attach to menus
  const menusWithPermissions = allMenus.map(menu => {
    let permissions = menuPermissionMap[menu.id] || [];

    // Super admin gets ALL permissions
    if (isSuperAdmin && menu.menu_type === 'screen') {
      permissions = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'APPROVE', 'REJECT', 'PRINT'];
    }

    return {
      ...menu,
      permissions,
      has_access: isSuperAdmin || permissions.length > 0
    };
  });

  return menusWithPermissions;
};
```

**Key Fix:** Query must use `Op.or` to include both specific `application_id` AND `NULL` for super admin.

---

### userPermission.service.js

#### 1. Assign Super Admin Role to User (UPDATED)
```javascript
const assignRoleToUser = async (assignmentData, assignedBy) => {
  const role = await HrmsRole.findByPk(role_id);

  // Check if assigning super admin role (application_id = NULL)
  if (role.is_super_admin && role.application_id === null) {
    // Super admin assignment - single role covers ALL applications

    // Check if user already has super admin role
    const existing = await HrmsUserRole.findOne({
      where: {
        user_id,
        role_id,
        is_active: true
      }
    });

    if (existing) {
      throw new Error('User already has super admin role assigned');
    }

    // Create ONE user role with application_id = NULL
    const userRole = await HrmsUserRole.create({
      user_id,
      role_id,
      company_id,
      application_id: null,  // NULL = covers all applications
      is_active: true,
      assigned_at: new Date(),
      assigned_by: assignedBy
    });

    return {
      message: 'Super admin role assigned successfully. User now has access to ALL applications.',
      userRole,
      is_super_admin: true
    };
  } else {
    // Normal role assignment for specific application
    // ...
  }
};
```

---

## Frontend Integration

### 1. Check if Current User is Super Admin
```javascript
// In React context or global state
const [isSuperAdmin, setIsSuperAdmin] = useState(false);

useEffect(() => {
  async function checkSuperAdmin() {
    const response = await api.post('/role-permission/menus/get-user-menus', {
      user_id: user.id,
      company_id: user.company_id,
      application_id: currentApp.id
    });

    const menus = response.data.data;

    // Check if user has all permissions on all menus
    const allMenusHaveAllPermissions = menus.every(menu =>
      menu.menu_type === 'container' ||
      menu.permissions.length === 8 // All 8 permissions
    );

    setIsSuperAdmin(allMenusHaveAllPermissions);
  }

  checkSuperAdmin();
}, [user, currentApp]);
```

### 2. Show Super Admin Badge
```jsx
{isSuperAdmin && (
  <Badge color="gold">
    <CrownOutlined /> Super Admin
  </Badge>
)}
```

### 3. Conditional UI for Super Admin
```jsx
{isSuperAdmin ? (
  // Show admin-only features
  <AdminSettings />
) : (
  // Show regular features
  <RegularUserView />
)}
```

---

## Testing Scenarios

### Test Case 1: Create Super Admin Role
```bash
# 1. Get super admin role master ID
curl -X POST http://localhost:3000/api/role-permission/roles/masters/get-all \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"application_id": "super_admin"}'

# 2. Create role from master
curl -X POST http://localhost:3000/api/role-permission/roles/create-from-master \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "company_id": 100,
    "role_master_id": 1
  }'

# Verify: Should create roles for ALL applications
```

### Test Case 2: Assign Super Admin to User
```bash
# 1. Assign super admin role
curl -X POST http://localhost:3000/api/role-permission/permissions/users/assign-role \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "user_id": 500,
    "company_id": 100,
    "role_id": 10
  }'

# Verify: Should create user_role records for ALL applications
```

### Test Case 3: Check Super Admin Access
```bash
# 1. Get user menus
curl -X POST http://localhost:3000/api/role-permission/menus/get-user-menus \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "user_id": 500,
    "company_id": 100,
    "application_id": 1
  }'

# Verify: Should return ALL menus with ALL permissions
```

### Test Case 4: Super Admin Across Applications
```bash
# Test Admin application
curl -X POST http://localhost:3000/api/role-permission/menus/get-user-menus \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"user_id": 500, "company_id": 100, "application_id": 1}'

# Test ESS application
curl -X POST http://localhost:3000/api/role-permission/menus/get-user-menus \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"user_id": 500, "company_id": 100, "application_id": 2}'

# Verify: Both should return full access
```

---

## Security Considerations

### 1. Super Admin Creation
- Only system administrators should be able to create super admin roles
- Add middleware to check if requester has permission to create super admin
```javascript
if (roleMaster.application_id === null && !req.user.is_system_admin) {
  throw new Error('Only system administrators can create super admin roles');
}
```

### 2. Super Admin Assignment
- Log all super admin assignments in audit log
- Send email notifications when super admin is assigned
- Require approval for super admin assignments (optional)

### 3. Super Admin Monitoring
```sql
-- Query to monitor super admin users
SELECT
  u.id,
  u.email,
  e.first_name,
  e.last_name,
  c.company_name,
  COUNT(DISTINCT ur.application_id) as app_count,
  MIN(ur.assigned_at) as first_assigned
FROM hrms_user_details u
INNER JOIN hrms_user_roles ur ON u.id = ur.user_id
INNER JOIN hrms_roles r ON ur.role_id = r.id
INNER JOIN hrms_companies c ON u.company_id = c.id
LEFT JOIN hrms_employees e ON u.id = e.user_id
WHERE r.is_super_admin = TRUE
  AND ur.is_active = TRUE
GROUP BY u.id, u.email, e.first_name, e.last_name, c.company_name;
```

---

## Troubleshooting

### Problem: Super admin not getting all permissions
**Solution:**
```sql
-- Check if role is marked as super admin
SELECT * FROM hrms_roles WHERE id = <role_id>;

-- Check if user has active super admin role
SELECT * FROM hrms_user_roles ur
INNER JOIN hrms_roles r ON ur.role_id = r.id
WHERE ur.user_id = <user_id>
  AND r.is_super_admin = TRUE
  AND ur.is_active = TRUE;
```

### Problem: Duplicate super admin roles exist
**Solution:**
```sql
-- Check for duplicate super admin roles (should be only ONE with NULL)
SELECT
  id,
  company_id,
  application_id,
  role_code,
  is_super_admin
FROM hrms_roles
WHERE company_id = <company_id>
  AND is_super_admin = TRUE
  AND is_active = TRUE;

-- Should show only ONE record with application_id = NULL
-- If multiple records exist, delete duplicates and keep only NULL one
```

### Problem: User assigned super admin but not working
**Solution:**
```sql
-- Verify user has super admin role with application_id = NULL
SELECT
  ur.id,
  ur.user_id,
  ur.role_id,
  ur.application_id,
  r.role_name,
  r.is_super_admin
FROM hrms_user_roles ur
INNER JOIN hrms_roles r ON ur.role_id = r.id
WHERE ur.user_id = <user_id>
  AND ur.is_active = TRUE
  AND r.is_super_admin = TRUE;

-- Should show ONE record with application_id = NULL
-- If application_id is not NULL, user assignment was done incorrectly
```

---

## Migration Steps

### Step 1: Run Migration
```bash
mysql -u root -p hrms_db < database/migrations/role_permission/002_add_super_admin_support.sql
```

### Step 2: Run Seed
```bash
mysql -u root -p hrms_db < database/seeds/super_admin_role_seed.sql
```

### Step 3: Restart Application
```bash
npm restart
```

### Step 4: Test
```bash
# Test getting role masters
curl -X POST http://localhost:3000/api/role-permission/roles/masters/get-all \
  -H "Authorization: Bearer $TOKEN"

# Should include super admin role master with application_id = null
```

---

## Best Practices

1. **Limit Super Admin Count:** Only assign super admin to highly trusted personnel
2. **Audit Regularly:** Monitor super admin actions via audit logs
3. **Separate Concerns:** Use regular roles for day-to-day operations
4. **Document Assignments:** Keep records of why super admin was assigned
5. **Review Periodically:** Quarterly review of all super admin users
6. **Emergency Protocol:** Have process to quickly revoke super admin access

---

## Auto-Assignment on Employee Creation

When a new employee is created via `POST /api/employees`, the system automatically assigns the EMPLOYEE role:

```javascript
// employee.service.js - autoAssignDefaultRoles()

// Assign EMPLOYEE role for ESS application
const employeeRole = await HrmsRole.findOne({
  where: {
    company_id,
    application_id: essApplication.id,
    role_code: 'EMPLOYEE',
    is_active: true
  }
});

await HrmsUserRole.create({
  user_id: new_user_id,
  role_id: employeeRole.id,
  company_id,
  application_id: essApplication.id,  // Specific to ESS
  is_active: true,
  assigned_at: new Date(),
  assigned_by: created_by
});
```

**Result:** New employee gets:
- ✅ EMPLOYEE role in ESS application (basic self-service access)

**Note:** SUPER_ADMIN role must be assigned manually via the role assignment API for security purposes. Not all employees should be super admins!

---

## Latest Improvements (v2.0)

### What Changed:

**Old Approach:**
- Created separate super admin role for EACH application (ESS, ADMIN, PAYROLL, TRAVEL)
- User assignment created multiple `hrms_user_roles` records (one per app)
- Adding new application required manual role creation and user re-assignment

**New Approach (Current):**
- ✅ Creates **ONE** super admin role with `application_id = NULL`
- ✅ User assignment creates **ONE** `hrms_user_roles` record with `application_id = NULL`
- ✅ New applications automatically accessible (no manual updates needed)
- ✅ Fixed queries to include `Op.or` for NULL application_id
- ✅ Changed unique index to regular index (prevents duplicate super admin via code)

### Database Comparison:

```sql
-- OLD: Multiple super admin roles per company
id | company_id | application_id | role_code   | is_super_admin
10 | 100        | 1 (ESS)       | SUPER_ADMIN | TRUE
11 | 100        | 2 (ADMIN)     | SUPER_ADMIN | TRUE
12 | 100        | 3 (PAYROLL)   | SUPER_ADMIN | TRUE
13 | 100        | 4 (TRAVEL)    | SUPER_ADMIN | TRUE

-- NEW: Single super admin role covers all apps
id | company_id | application_id | role_code   | is_super_admin
10 | 100        | NULL          | SUPER_ADMIN | TRUE  ✅
```

### Files Modified:
1. `database/migrations/role_permission/002_add_super_admin_support.sql`
   - Made `application_id` NULL in `hrms_roles` and `hrms_user_roles`
   - Changed unique index to regular index
2. `src/models/role_permission/HrmsRole.js` - Updated model
3. `src/models/role_permission/HrmsUserRole.js` - Updated model
4. `src/services/role_permission/role.service.js` - Updated role creation logic
5. `src/services/role_permission/userPermission.service.js` - Updated user assignment logic
6. `src/services/role_permission/menu.service.js` - Fixed queries with Op.or
7. `src/services/employee.service.js` - Added auto-assignment logic

---

## Summary

- **Super Admin Role Master:** `application_id = NULL` in `hrms_role_master`
- **Super Admin Company Role:** `is_super_admin = TRUE` AND `application_id = NULL` in `hrms_roles`
- **Single Role:** ONE role covers ALL applications (present and future)
- **Single Assignment:** ONE `hrms_user_roles` record with `application_id = NULL`
- **Full Permissions:** Super admin gets ALL permissions (VIEW, CREATE, UPDATE, DELETE, etc.)
- **Package Aware:** Super admin RESPECTS package module restrictions
- **Application Access:** Super admin can access ALL applications
- **Module Access:** Super admin limited to company's purchased modules only
- **Future-Proof:** New applications automatically accessible
- **Auto-Assignment:** New employees automatically get EMPLOYEE role (SUPER_ADMIN assigned manually)
- **Query Fix:** All queries use `Op.or` to include NULL application_id
- **Security:** SUPER_ADMIN must be manually assigned for security

**Key Difference from Regular Admin:**
- Regular Admin: Specific application + specific permissions
- Super Admin: ALL applications (via NULL) + ALL permissions + SAME package modules

**Key Benefit:**
When new application (e.g., RECRUITMENT) is added in future:
- ✅ Existing super admin users automatically have access
- ✅ No migration needed
- ✅ No manual role creation needed
- ✅ No manual user re-assignment needed

---

**Implementation Complete!** 🎉
