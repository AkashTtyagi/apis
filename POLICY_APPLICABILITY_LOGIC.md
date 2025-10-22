# Policy Applicability & Employee Matching Logic

## Overview
Employee matching is done automatically based on `applicability_type` and `advanced_applicability_type`. Admin just needs to set applicability rules and call assign API.

---

## How It Works

### Step 1: Set Applicability Rules
When creating/updating policy, define applicability rules:

```json
{
  "applicability_rules": [
    {
      "applicability_type": "department",
      "applicability_value": "1,2,3",
      "is_excluded": false,
      "advanced_applicability_type": "location",
      "advanced_applicability_value": "10,11",
      "priority": 1
    }
  ]
}
```

### Step 2: Assign Policy
Call assign API - employees are matched automatically:

```
POST /api/admin/policy/assign
{
  "policy_id": 1
}
```

System automatically:
1. Reads applicability rules
2. Matches employees based on rules
3. Creates acknowledgment records
4. Returns count of assigned employees

---

## Primary Applicability Type

### Supported Types

| Type | Matches Employees By | Example |
|------|---------------------|---------|
| `company` | All employees in company | Entire organization |
| `entity` | Specific entity IDs | Entity 1, Entity 2 |
| `department` | Department IDs | IT, HR, Sales |
| `sub_department` | Sub-department IDs | IT Support, HR Ops |
| `designation` | Designation IDs | Manager, Lead, Executive |
| `level` | Level IDs | L1, L2, L3 |
| `location` | Location IDs | Mumbai, Delhi |
| `grade` | Grade IDs | A, B, C grades |
| `employee` | Specific employee IDs | Employee 10, 11, 12 |

### Examples

**Company-Wide (All Employees):**
```json
{
  "applicability_type": "company",
  "applicability_value": "23",
  "is_excluded": false
}
```
Matches: All active employees in company 23

**Specific Departments:**
```json
{
  "applicability_type": "department",
  "applicability_value": "1,2,3",
  "is_excluded": false
}
```
Matches: Employees in departments 1, 2, or 3

**Specific Employees:**
```json
{
  "applicability_type": "employee",
  "applicability_value": "10,11,12",
  "is_excluded": false
}
```
Matches: Only employees with IDs 10, 11, 12

---

## Advanced Applicability Type (Secondary Filter)

Adds an additional filter on top of primary applicability.

### Supported Advanced Types
- `entity`
- `department`
- `sub_department`
- `designation`
- `level`
- `location`
- `grade`
- `employee_type`
- `branch`
- `region`

### Example: Department + Location Filter

**Scenario**: Policy for IT and HR departments, but only in Mumbai and Delhi locations

```json
{
  "applicability_type": "department",
  "applicability_value": "1,2",
  "advanced_applicability_type": "location",
  "advanced_applicability_value": "10,11",
  "is_excluded": false
}
```

**Matches**:
- Employees in department 1 (IT) OR department 2 (HR)
- AND in location 10 (Mumbai) OR location 11 (Delhi)

**SQL Equivalent**:
```sql
WHERE company_id = 23
  AND is_active = true
  AND department_id IN (1, 2)
  AND location_id IN (10, 11)
```

---

## Exclusion Logic (`is_excluded`)

Use `is_excluded: true` to EXCLUDE specific employees from a broader rule.

### Example: Company-Wide EXCEPT Senior Management

**Rules**:
```json
{
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

**Logic**:
1. Rule 1: Include all employees in company 23
2. Rule 2: Exclude employees with designation 5 or 6
3. **Result**: All employees EXCEPT senior managers

---

## Multiple Rules (Union & Exclusion)

### How Multiple Rules Work

1. **Inclusion Rules** (`is_excluded: false`):
   - Matched employees are **ADDED** to the set
   - Works like **OR** logic

2. **Exclusion Rules** (`is_excluded: true`):
   - Matched employees are **REMOVED** from the set

3. **Final Set**:
   - All included employees MINUS excluded employees

### Example: Multiple Departments with Exclusions

**Scenario**: IT, HR, Sales departments EXCEPT employees at Bangalore location

```json
{
  "applicability_rules": [
    {
      "applicability_type": "department",
      "applicability_value": "1,2,3",
      "is_excluded": false,
      "priority": 1
    },
    {
      "applicability_type": "location",
      "applicability_value": "15",
      "is_excluded": true,
      "priority": 2
    }
  ]
}
```

**Matches**:
- ✅ IT dept employees in Mumbai → Included
- ✅ HR dept employees in Delhi → Included
- ✅ Sales dept employees in Pune → Included
- ❌ IT dept employees in Bangalore → Excluded
- ❌ HR dept employees in Bangalore → Excluded

---

## Priority

`priority` field determines the order of rule evaluation.

- Lower priority number = Higher priority
- Priority 1 is evaluated first, then Priority 2, etc.

**Best Practice**: Set inclusion rules at priority 1, exclusion rules at priority 2+

---

## Complete Examples

### Example 1: Sales Policy - Multiple Departments with Location Filter

**Requirement**: Sales commission policy for Sales and Marketing departments, only in Mumbai and Delhi

```json
{
  "company_id": 23,
  "policy_title": "Sales Commission Policy",
  "policy_slug": "sales_commission_policy",
  "applicability_rules": [
    {
      "applicability_type": "department",
      "applicability_value": "3,4",
      "advanced_applicability_type": "location",
      "advanced_applicability_value": "10,11",
      "is_excluded": false,
      "priority": 1
    }
  ]
}
```

**Matches**:
- Sales dept (3) employees in Mumbai (10) ✅
- Sales dept (3) employees in Delhi (11) ✅
- Marketing dept (4) employees in Mumbai (10) ✅
- Marketing dept (4) employees in Delhi (11) ✅
- Sales dept (3) employees in Bangalore (15) ❌
- IT dept (1) employees in Mumbai (10) ❌

---

### Example 2: Security Policy - Company-Wide with Exclusions

**Requirement**: Data security policy for entire company EXCEPT interns and contractors

```json
{
  "company_id": 23,
  "policy_title": "Data Security Policy",
  "policy_slug": "data_security_policy",
  "applicability_rules": [
    {
      "applicability_type": "company",
      "applicability_value": "23",
      "is_excluded": false,
      "priority": 1
    },
    {
      "applicability_type": "level",
      "applicability_value": "1",
      "is_excluded": true,
      "priority": 2
    },
    {
      "applicability_type": "employee_type",
      "applicability_value": "contractor",
      "advanced_applicability_type": "none",
      "is_excluded": true,
      "priority": 3
    }
  ]
}
```

**Matches**:
- All permanent employees ✅
- Exclude Level 1 (interns) ❌
- Exclude contractors ❌

---

### Example 3: Manager Policy - Specific Designations with Grade Filter

**Requirement**: Leadership policy for Managers and Senior Managers with Grade A or B

```json
{
  "company_id": 23,
  "policy_title": "Leadership Training Policy",
  "policy_slug": "leadership_training_policy",
  "applicability_rules": [
    {
      "applicability_type": "designation",
      "applicability_value": "5,6",
      "advanced_applicability_type": "grade",
      "advanced_applicability_value": "1,2",
      "is_excluded": false,
      "priority": 1
    }
  ]
}
```

**Matches**:
- Managers (5) with Grade A (1) ✅
- Managers (5) with Grade B (2) ✅
- Senior Managers (6) with Grade A (1) ✅
- Senior Managers (6) with Grade B (2) ✅
- Managers (5) with Grade C (3) ❌

---

## Assignment Flow

```
1. Admin creates policy with applicability rules
   ↓
2. Applicability rules saved in hrms_policy_applicability
   ↓
3. Admin calls POST /api/admin/policy/assign
   ↓
4. System reads applicability rules
   ↓
5. For each rule:
   - Query hrms_employees with primary filter
   - Apply advanced filter if exists
   - Add to inclusion or exclusion set
   ↓
6. Final employee list = Included - Excluded
   ↓
7. Create records in hrms_employee_policy_acknowledgments
   ↓
8. Return count of assigned employees
```

---

## Database Query Logic

### Primary Filter Example (Department)
```sql
SELECT id FROM hrms_employees
WHERE company_id = 23
  AND is_active = 1
  AND department_id IN (1, 2, 3)
```

### With Advanced Filter (Department + Location)
```sql
SELECT id FROM hrms_employees
WHERE company_id = 23
  AND is_active = 1
  AND department_id IN (1, 2, 3)
  AND location_id IN (10, 11)
```

### Multiple Rules (Union)
```sql
-- Rule 1: Department 1, 2
SELECT id FROM hrms_employees WHERE department_id IN (1, 2)

UNION

-- Rule 2: Designation 5, 6
SELECT id FROM hrms_employees WHERE designation_id IN (5, 6)

EXCEPT

-- Rule 3: Location 15 (excluded)
SELECT id FROM hrms_employees WHERE location_id = 15
```

---

## Testing Applicability

### Test Case 1: Company-Wide
```json
POST /api/admin/policy/create
{
  "company_id": 23,
  "category_id": 1,
  "policy_title": "Test Policy",
  "policy_slug": "test_policy",
  "applicability_rules": [
    {
      "applicability_type": "company",
      "applicability_value": "23",
      "is_excluded": false
    }
  ]
}

POST /api/admin/policy/assign
{
  "policy_id": 1
}

Expected: All active employees in company 23 assigned
```

### Test Case 2: Specific Department with Location
```json
POST /api/admin/policy/create
{
  "applicability_rules": [
    {
      "applicability_type": "department",
      "applicability_value": "1",
      "advanced_applicability_type": "location",
      "advanced_applicability_value": "10",
      "is_excluded": false
    }
  ]
}

POST /api/admin/policy/assign
{
  "policy_id": 2
}

Expected: Only IT dept employees in Mumbai assigned
```

---

## Key Benefits

1. ✅ **Flexible**: Support for 9 applicability types
2. ✅ **Powerful**: Advanced filters for precise targeting
3. ✅ **Exclusions**: Easy to exclude specific groups
4. ✅ **Automatic**: No manual employee selection needed
5. ✅ **Dynamic**: New employees auto-included on next assign
6. ✅ **Auditable**: All rules stored in database

---

## Notes

- Only **active employees** (`is_active = true`) are matched
- Rules are evaluated per company (`company_id` filter always applied)
- Comma-separated values in `applicability_value` work as OR logic
- Advanced filters work as AND with primary filter
- Duplicate assignments are handled with `ignoreDuplicates` flag
