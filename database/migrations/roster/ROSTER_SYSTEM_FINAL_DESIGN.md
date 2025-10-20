# HRMS Roster Management System - Final Design Document

## Core Concept

### What is Roster?
Roster is a **shift scheduling system** that determines which shift an employee should work on any given date.

### What Roster is NOT:
- ❌ NOT for leave management
- ❌ NOT for compensatory off
- ❌ NOT for attendance marking
- ❌ NOT for holiday management

These are separate modules.

---

## System Architecture

### Priority Hierarchy (Highest to Lowest)

```
1. Shift Swap (Approved)              ← HIGHEST (temporary, specific date)
   └─ Employee requests, both parties consent, workflow approves

2. Roster Assignment                  ← MEDIUM (template-based, date range)
   └─ Admin assigns department/designation/individual to shift template

3. Primary Shift (employee.shift_id)  ← LOWEST (default fallback)
   └─ Employee's base shift from employee table
```

---

## Database Schema

### Table 1: Employee's Primary Shift (Already Exists)

**Location:** `hrms_employees.shift_id`

This is the **default shift** for the employee. When no roster assignment exists, this shift applies.

```sql
-- Employee table already has these fields
hrms_employees
  ├── shift_id INT          -- Primary/default shift (from shift migration)
  ├── department_id INT     -- Already exists
  ├── designation_id INT    -- Already exists
  ├── branch_id INT         -- ✅ Added in migration 005_add_organizational_fields_to_employees.sql
  └── location_id INT       -- ✅ Added in migration 005_add_organizational_fields_to_employees.sql
```

**Note:** `branch_id` and `location_id` have been added via migration file `005_add_organizational_fields_to_employees.sql`

---

### Table 2: Roster Templates

**Purpose:** Define shift patterns (fixed shift, weekly rotation, custom rotation)

```sql
CREATE TABLE IF NOT EXISTS hrms_roster_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    template_code VARCHAR(50) NOT NULL,
    template_name VARCHAR(200) NOT NULL,
    template_description TEXT,
    template_colour VARCHAR(20) DEFAULT '#3498db',

    pattern_type ENUM('fixed', 'rotating', 'custom') NOT NULL DEFAULT 'fixed',
    rotation_days INT DEFAULT NULL COMMENT 'Number of days in rotation cycle (e.g., 7 for weekly, 14 for bi-weekly)',
    default_shift_id INT DEFAULT NULL COMMENT 'For fixed pattern - same shift every day',

    is_active TINYINT(1) NOT NULL DEFAULT 1,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_by INT DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    INDEX idx_company_id (company_id),
    INDEX idx_template_code (template_code),
    INDEX idx_pattern_type (pattern_type),
    INDEX idx_is_active (is_active),
    UNIQUE KEY unique_company_template (company_id, template_code, deleted_at),

    CONSTRAINT fk_roster_template_company FOREIGN KEY (company_id)
        REFERENCES hrms_companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_roster_template_shift FOREIGN KEY (default_shift_id)
        REFERENCES hrms_shift_master(id) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 3: Roster Template Details

**Purpose:** Define when ROSTER shift applies (rest of the time = PRIMARY shift from employee table)

**IMPORTANT CONCEPT:**
- Employee's **PRIMARY shift** stored in `hrms_employees.shift_id`
- This table stores **ONLY the dates/patterns when ROSTER shift applies**
- If no entry for a date → Use employee's primary shift
- If entry exists → Use roster shift

```sql
CREATE TABLE IF NOT EXISTS hrms_roster_template_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,

    -- Simple Date Range (ONLY way to define roster period)
    start_date DATE NOT NULL COMMENT 'Start date for roster shift',
    end_date DATE NOT NULL COMMENT 'End date for roster shift',

    -- Roster Shift (MANDATORY)
    shift_id INT NOT NULL COMMENT 'Roster shift to apply (primary shift comes from employee.shift_id)',

    -- Label for admin reference
    period_label VARCHAR(100) DEFAULT NULL COMMENT 'E.g., "Week 2 - Night Shift", "February - Night Shift"',

    -- Display
    display_order INT NOT NULL DEFAULT 0,

    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_template_id (template_id),
    INDEX idx_shift_id (shift_id),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_date_range (template_id, start_date, end_date),

    -- Foreign Keys
    CONSTRAINT fk_roster_detail_template FOREIGN KEY (template_id)
        REFERENCES hrms_roster_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_roster_detail_shift FOREIGN KEY (shift_id)
        REFERENCES hrms_shift_master(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Date-wise roster shift periods. If date not in any range, use employee primary shift.';

/**
 * SIMPLIFIED DESIGN:
 *
 * 1. ONLY DATE RANGES - No complex patterns
 *    - Store actual start and end dates
 *    - Admin specifies exact date ranges when creating roster
 *
 * 2. Three Common Patterns (handled by multiple date range entries):
 *    a) Weekly: Week 2, 4, 6, 8... get roster shift
 *    b) Bi-weekly: Weeks 3-4, 7-8, 11-12... get roster shift
 *    c) Monthly: Feb, Apr, Jun... get roster shift
 *
 * 3. Logic:
 *    - If current_date BETWEEN start_date AND end_date → Use roster shift
 *    - Else → Use employee's primary shift
 *
 * 4. Example - Weekly Rotation (Year 2025):
 *    Week 2: start_date='2025-01-08', end_date='2025-01-14', shift_id=4
 *    Week 4: start_date='2025-01-22', end_date='2025-01-28', shift_id=4
 *    Week 6: start_date='2025-02-05', end_date='2025-02-11', shift_id=4
 *    ... and so on for entire year
 *
 * 5. Storage:
 *    - Weekly: ~26 records per year (every alternate week)
 *    - Bi-weekly: ~13 records per year
 *    - Monthly: ~6 records per year (alternate months)
 */
```

---

## Simplified Pattern Examples

### **Case 1: Monthly Alternating Pattern**
*Jan primary, Feb roster, Mar primary, Apr roster... till Dec 2025*

**Admin Action:** Select "Monthly Alternating" pattern for 2025

**System generates these date ranges:**
```sql
-- Template: Monthly Alternating (ID = 10)

INSERT INTO hrms_roster_template_details (template_id, start_date, end_date, shift_id, period_label, display_order) VALUES
(10, '2025-02-01', '2025-02-28', 4, 'February - Night Shift', 1),
(10, '2025-04-01', '2025-04-30', 4, 'April - Night Shift', 2),
(10, '2025-06-01', '2025-06-30', 4, 'June - Night Shift', 3),
(10, '2025-08-01', '2025-08-31', 4, 'August - Night Shift', 4),
(10, '2025-10-01', '2025-10-31', 4, 'October - Night Shift', 5),
(10, '2025-12-01', '2025-12-31', 4, 'December - Night Shift', 6);

-- Result:
-- Jan: Primary shift (no entry)
-- Feb: Night shift (roster)
-- Mar: Primary shift (no entry)
-- Apr: Night shift (roster)
-- ... and so on

-- Total: 6 records for entire year
```

---

### **Case 2: Weekly Alternating Pattern**
*Week 1 primary, Week 2 roster, Week 3 primary, Week 4 roster... for entire year*

**Admin Action:** Select "Weekly Alternating" pattern for 2025

**System generates these date ranges:**
```sql
-- Template: Weekly Alternating (ID = 11)

INSERT INTO hrms_roster_template_details (template_id, start_date, end_date, shift_id, period_label, display_order) VALUES
-- January
(11, '2025-01-06', '2025-01-12', 4, 'Week 2 Jan - Night Shift', 1),
(11, '2025-01-20', '2025-01-26', 4, 'Week 4 Jan - Night Shift', 2),

-- February
(11, '2025-02-03', '2025-02-09', 4, 'Week 2 Feb - Night Shift', 3),
(11, '2025-02-17', '2025-02-23', 4, 'Week 4 Feb - Night Shift', 4),

-- March
(11, '2025-03-03', '2025-03-09', 4, 'Week 2 Mar - Night Shift', 5),
(11, '2025-03-17', '2025-03-23', 4, 'Week 4 Mar - Night Shift', 6);

-- ... continue for all months (total ~26 records for year)

-- Result:
-- Week 1: Primary shift
-- Week 2: Night shift (roster)
-- Week 3: Primary shift
-- Week 4: Night shift (roster)
```

---

### **Case 3: Bi-Weekly Pattern**
*Weeks 1-2 primary, Weeks 3-4 roster, repeat...*

**Admin Action:** Select "Bi-Weekly Alternating" pattern for 2025

**System generates these date ranges:**
```sql
-- Template: Bi-Weekly Alternating (ID = 12)

INSERT INTO hrms_roster_template_details (template_id, start_date, end_date, shift_id, period_label, display_order) VALUES
-- January
(12, '2025-01-13', '2025-01-26', 4, 'Weeks 3-4 Jan - Night Shift', 1),

-- February
(12, '2025-02-10', '2025-02-23', 4, 'Weeks 3-4 Feb - Night Shift', 2),

-- March
(12, '2025-03-10', '2025-03-23', 4, 'Weeks 3-4 Mar - Night Shift', 3);

-- ... continue for all months (total ~12 records for year)

-- Result:
-- Weeks 1-2: Primary shift
-- Weeks 3-4: Night shift (roster)
-- Repeat each month
```

---

## IMPORTANT NOTES:

### 1. **Primary vs Roster Shift**
- **Primary Shift**: Stored in `hrms_employees.shift_id` (employee's default)
- **Roster Shift**: Stored in this table (when pattern matches)
- **Logic**: If date matches pattern → Use roster shift, else → Use primary shift

### 2. **Weekly Off Handling**
- Weekly off comes from `hrms_shift_weekly_off` table
- Each shift has its own weekly off configuration
- Roster does NOT store weekly off

### 3. **Calculation Logic**

```javascript
function getEmployeeShift(employeeId, date) {
    // 1. Get employee's primary shift
    const employee = getEmployee(employeeId);
    let finalShift = employee.shift_id;  // Default = primary

    // 2. Check if roster assignment exists
    const assignment = getRosterAssignment(employeeId, date);
    if (!assignment) {
        return finalShift;  // No roster = use primary
    }

    // 3. Check if date matches any roster pattern
    const rosterPattern = checkRosterPattern(assignment.template_id, date);
    if (rosterPattern) {
        finalShift = rosterPattern.shift_id;  // Use roster shift
    }

    // 4. Return final shift (primary or roster)
    return finalShift;
}
```

### 4. **Storage Efficiency**

Instead of storing every single date:
- ✅ **Pattern-based**: Store pattern rules (e.g., "every Thursday")
- ✅ **Date ranges**: Store start/end dates
- ❌ **Individual dates**: Avoid 365 records per employee

```

---

### Table 4: Roster Assignments ⭐ MAIN TABLE

**Purpose:** Assign roster templates to employees/departments/designations for specific date ranges

```sql
CREATE TABLE IF NOT EXISTS hrms_employee_roster_assignment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,

    -- Assignment Type
    assignment_type ENUM('individual', 'bulk', 'department', 'designation', 'branch', 'location', 'mixed') NOT NULL DEFAULT 'individual',
    assignment_name VARCHAR(200) DEFAULT NULL COMMENT 'Description of this assignment',

    -- Target Entities (JSON arrays to support multiple selections)
    employee_ids JSON DEFAULT NULL COMMENT 'Array of employee IDs [1, 2, 3]',
    department_ids JSON DEFAULT NULL COMMENT 'Array of department IDs [1, 2, 3]',
    designation_ids JSON DEFAULT NULL COMMENT 'Array of designation IDs [1, 2, 3]',
    branch_ids JSON DEFAULT NULL COMMENT 'Array of branch IDs [1, 2, 3]',
    location_ids JSON DEFAULT NULL COMMENT 'Array of location IDs [1, 2, 3]',

    -- Template and Date Range
    template_id INT NOT NULL COMMENT 'Which roster template to apply',
    start_date DATE NOT NULL COMMENT 'Assignment starts from this date',
    end_date DATE DEFAULT NULL COMMENT 'Assignment ends on this date (NULL = ongoing indefinitely)',

    -- Rotation Settings
    rotation_start_day INT NOT NULL DEFAULT 1 COMMENT 'Start from which day of template rotation (1-N)',

    -- Priority (for handling overlapping assignments)
    priority INT NOT NULL DEFAULT 0 COMMENT 'Higher priority wins when multiple assignments overlap',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by INT DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    -- Indexes
    INDEX idx_company_id (company_id),
    INDEX idx_assignment_type (assignment_type),
    INDEX idx_template_id (template_id),
    INDEX idx_date_range (start_date, end_date),
    INDEX idx_priority (priority),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at),

    -- Foreign Keys
    CONSTRAINT fk_roster_assignment_company FOREIGN KEY (company_id)
        REFERENCES hrms_companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_roster_assignment_template FOREIGN KEY (template_id)
        REFERENCES hrms_roster_templates(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Template-based roster assignments with date ranges';
```

---

### Table 5: Shift Swap Requests ⭐ SWAP TABLE

**Purpose:** Handle shift swap requests between employees with approval workflow

```sql
CREATE TABLE IF NOT EXISTS hrms_shift_swap_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,

    -- Swap Participants
    requester_employee_id INT NOT NULL COMMENT 'Employee who requested the swap',
    target_employee_id INT NOT NULL COMMENT 'Employee with whom swap is requested',

    -- Swap Details
    swap_date DATE NOT NULL COMMENT 'Date for which shift is being swapped',

    requester_original_shift_id INT NOT NULL COMMENT 'Requester current shift on swap_date',
    target_original_shift_id INT NOT NULL COMMENT 'Target employee current shift on swap_date',

    swap_reason TEXT DEFAULT NULL COMMENT 'Reason for swap request',

    -- Consent
    requester_consent TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Always 1 (requester initiated)',
    target_consent TINYINT(1) DEFAULT NULL COMMENT 'NULL=Pending, 1=Accepted, 0=Rejected',
    target_consent_at TIMESTAMP NULL DEFAULT NULL,

    -- Workflow Approval
    workflow_id INT DEFAULT NULL COMMENT 'Which workflow applies for approval',
    approval_status ENUM('pending_consent', 'pending_approval', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending_consent',
    approved_by INT DEFAULT NULL COMMENT 'User ID who approved',
    approved_at TIMESTAMP NULL DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by INT DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    -- Indexes
    INDEX idx_company_id (company_id),
    INDEX idx_requester (requester_employee_id),
    INDEX idx_target (target_employee_id),
    INDEX idx_swap_date (swap_date),
    INDEX idx_approval_status (approval_status),
    INDEX idx_workflow_id (workflow_id),
    INDEX idx_is_active (is_active),

    -- Foreign Keys
    CONSTRAINT fk_swap_company FOREIGN KEY (company_id)
        REFERENCES hrms_companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_swap_requester FOREIGN KEY (requester_employee_id)
        REFERENCES hrms_employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_swap_target FOREIGN KEY (target_employee_id)
        REFERENCES hrms_employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_swap_requester_shift FOREIGN KEY (requester_original_shift_id)
        REFERENCES hrms_shift_master(id) ON DELETE CASCADE,
    CONSTRAINT fk_swap_target_shift FOREIGN KEY (target_original_shift_id)
        REFERENCES hrms_shift_master(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Shift swap requests with consent and approval workflow';
```

---

### Table 6: Roster Change Log (Audit Trail)

```sql
CREATE TABLE IF NOT EXISTS hrms_roster_change_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    employee_id INT DEFAULT NULL,
    roster_assignment_id INT DEFAULT NULL,
    swap_request_id INT DEFAULT NULL,

    change_type ENUM('assignment_created', 'assignment_updated', 'assignment_deleted',
                     'swap_requested', 'swap_consented', 'swap_approved', 'swap_rejected',
                     'bulk_operation') NOT NULL,
    change_date DATE DEFAULT NULL,
    date_range_from DATE DEFAULT NULL,
    date_range_to DATE DEFAULT NULL,

    old_values JSON DEFAULT NULL,
    new_values JSON DEFAULT NULL,
    change_reason TEXT DEFAULT NULL,
    affected_records_count INT DEFAULT 1,

    changed_by INT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) DEFAULT NULL,

    INDEX idx_company_id (company_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_change_type (change_type),
    INDEX idx_changed_at (changed_at),

    CONSTRAINT fk_change_log_company FOREIGN KEY (company_id)
        REFERENCES hrms_companies(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Complete Use Cases with Examples

### Use Case 1: Employee with Primary Shift Only

**Scenario:** Rahul joins as Software Engineer with Day Shift as primary

```sql
-- Employee record
INSERT INTO hrms_employees (
    company_id, user_id, employee_code,
    first_name, last_name, email,
    department_id, designation_id,
    shift_id,  -- ⭐ Primary shift = Day Shift (shift_id = 3)
    is_active, created_by
) VALUES (
    1, 101, 'EMP-101',
    'Rahul', 'Kumar', 'rahul@company.com',
    5, 8,      -- IT Department, Software Engineer
    3,         -- Day Shift (9 AM - 6 PM)
    1, 1
);
```

**Result:**
- Every day: Rahul works **Day Shift** (from `employee.shift_id`)
- No roster assignment needed
- Simple and straightforward

---

### Use Case 2: Weekly Rotation (1 Week Day Shift, 1 Week Night Shift)

**Scenario:** IT Department needs weekly rotation between Day and Night shifts till Dec 2025

#### Step 1: Create Rotation Template

```sql
-- Create template for bi-weekly rotation
INSERT INTO hrms_roster_templates (
    company_id, template_code, template_name, template_description,
    pattern_type, rotation_days, is_active, created_by
) VALUES (
    1, 'WEEK_DAY_NIGHT', 'Weekly Day-Night Rotation',
    '1 week Day Shift, then 1 week Night Shift, repeating',
    'rotating', 14, 1, 1
);
-- Let's say this creates template_id = 10

-- Define pattern: Days 1-7 = Day Shift (shift_id = 3)
INSERT INTO hrms_roster_template_details (template_id, day_number, day_label, shift_id, display_order)
VALUES
    (10, 1, 'Week 1 - Monday (Day)', 3, 1),
    (10, 2, 'Week 1 - Tuesday (Day)', 3, 2),
    (10, 3, 'Week 1 - Wednesday (Day)', 3, 3),
    (10, 4, 'Week 1 - Thursday (Day)', 3, 4),
    (10, 5, 'Week 1 - Friday (Day)', 3, 5),
    (10, 6, 'Week 1 - Saturday (Day)', 3, 6),
    (10, 7, 'Week 1 - Sunday (Day)', 3, 7);

-- Define pattern: Days 8-14 = Night Shift (shift_id = 4)
INSERT INTO hrms_roster_template_details (template_id, day_number, day_label, shift_id, display_order)
VALUES
    (10, 8, 'Week 2 - Monday (Night)', 4, 8),
    (10, 9, 'Week 2 - Tuesday (Night)', 4, 9),
    (10, 10, 'Week 2 - Wednesday (Night)', 4, 10),
    (10, 11, 'Week 2 - Thursday (Night)', 4, 11),
    (10, 12, 'Week 2 - Friday (Night)', 4, 12),
    (10, 13, 'Week 2 - Saturday (Night)', 4, 13),
    (10, 14, 'Week 2 - Sunday (Night)', 4, 14);
```

#### Step 2: Assign to IT Department

```sql
-- Assign rotation to IT Department (department_id = 5)
INSERT INTO hrms_employee_roster_assignment (
    company_id, assignment_type, assignment_name,
    department_ids, template_id,
    start_date, end_date,
    rotation_start_day, priority, is_active, created_by
) VALUES (
    1, 'department', 'IT Department - Weekly Rotation 2025',
    JSON_ARRAY(5),  -- IT Department
    10,             -- Template ID
    '2025-01-01', '2025-12-31',
    1,              -- Start from day 1 of rotation
    0,              -- Normal priority
    1, 1
);
```

#### Result:

**Rahul (IT Department, Employee ID 101):**

| Date | Calculation | Shift | Source |
|------|-------------|-------|--------|
| Jan 1, 2025 | Day 1 of rotation | Day Shift | Roster Template |
| Jan 7, 2025 | Day 7 of rotation | Day Shift | Roster Template |
| Jan 8, 2025 | Day 8 of rotation | **Night Shift** | Roster Template |
| Jan 14, 2025 | Day 14 of rotation | Night Shift | Roster Template |
| Jan 15, 2025 | Day 1 of rotation (cycle repeats) | Day Shift | Roster Template |

**Note:** Rahul's `shift_id = 3` (Day Shift) is **ignored** because roster assignment has higher priority.

---

### Use Case 3: Individual Roster Override

**Scenario:**
- IT Department has weekly rotation
- But new trainee "Priya" should work **ONLY Night Shift** during training (Feb-Apr 2025)

```sql
-- Step 1: Priya's employee record with Day Shift as primary
INSERT INTO hrms_employees (
    ..., shift_id, ...
) VALUES (
    ..., 3, ...  -- Day Shift as primary
);

-- Step 2: Create individual assignment with HIGHER priority
INSERT INTO hrms_employee_roster_assignment (
    company_id, assignment_type, assignment_name,
    employee_ids, template_id,
    start_date, end_date,
    rotation_start_day, priority, is_active, created_by
) VALUES (
    1, 'individual', 'Priya Training - Night Shift Only',
    JSON_ARRAY(102),  -- Priya's employee_id
    15,               -- Fixed Night Shift template
    '2025-02-01', '2025-04-30',  -- Training period
    1, 100,           -- ⭐ High priority (100) overrides department roster (0)
    1, 1
);
```

**Result:**

| Date | Shift | Source | Reason |
|------|-------|--------|--------|
| Jan 1-31 | Day Shift | Primary Shift | No roster assigned yet |
| Feb 1 - Apr 30 | Night Shift | Individual Roster (Priority 100) | Training period assignment |
| May 1 onwards | Weekly Rotation | Department Roster (Priority 0) | Training over |

---

### Use Case 4: Shift Swap Between Employees

**Scenario:**
- Date: March 15, 2025
- Rahul has **Day Shift** (from roster)
- Amit has **Night Shift** (from roster)
- Rahul has family emergency, wants to swap with Amit

#### Step 1: Rahul Creates Swap Request

```sql
INSERT INTO hrms_shift_swap_requests (
    company_id,
    requester_employee_id, target_employee_id,
    swap_date,
    requester_original_shift_id, target_original_shift_id,
    swap_reason,
    requester_consent, target_consent,
    approval_status, is_active, created_by
) VALUES (
    1,
    101, 103,  -- Rahul → Amit
    '2025-03-15',
    3, 4,      -- Rahul: Day Shift, Amit: Night Shift
    'Family emergency - need to travel',
    1, NULL,   -- Rahul consents, Amit pending
    'pending_consent', 1, 101
);
```

#### Step 2: Amit Accepts

```sql
UPDATE hrms_shift_swap_requests
SET target_consent = 1,
    target_consent_at = NOW(),
    approval_status = 'pending_approval',
    updated_by = 103
WHERE id = 1;
```

#### Step 3: Workflow Approval (Manager/HR Approves)

```sql
UPDATE hrms_shift_swap_requests
SET approval_status = 'approved',
    approved_by = 200,  -- Manager ID
    approved_at = NOW()
WHERE id = 1;
```

#### Result on March 15, 2025:

| Employee | Original Shift | After Swap | Source |
|----------|---------------|------------|--------|
| Rahul | Day Shift | **Night Shift** | Shift Swap (Approved) |
| Amit | Night Shift | **Day Shift** | Shift Swap (Approved) |

**Priority:** Swap has **HIGHEST** priority, so it overrides roster assignment for that specific date.

---

### Use Case 5: Multiple Departments + Designations

**Scenario:** Assign Night Shift to:
- Production Department (all employees)
- Security Department (all employees)
- All Managers (any department)

```sql
INSERT INTO hrms_employee_roster_assignment (
    company_id, assignment_type, assignment_name,
    department_ids, designation_ids,
    template_id, start_date, end_date,
    rotation_start_day, priority, is_active, created_by
) VALUES (
    1, 'mixed', 'Night Shift - Production/Security + All Managers',
    JSON_ARRAY(3, 7),  -- Production + Security departments
    JSON_ARRAY(10),    -- Manager designation
    20,                -- Fixed Night Shift template
    '2025-01-01', '2025-12-31',
    1, 0, 1, 1
);
```

**Who Gets Assigned?**

Employee gets this roster if they match **ANY** condition:
- `employee.department_id IN [3, 7]` (Production OR Security)
- `employee.designation_id = 10` (Manager)

**Examples:**

| Employee | Dept | Designation | Assigned? | Why? |
|----------|------|-------------|-----------|------|
| John | Production | Operator | ✅ Yes | department_id = 3 |
| Sarah | Security | Guard | ✅ Yes | department_id = 7 |
| Mike | IT | Manager | ✅ Yes | designation_id = 10 |
| Lisa | Production | Manager | ✅ Yes | Both conditions match! |
| Tom | HR | Executive | ❌ No | No match |

---

## Shift Calculation Logic (SQL Function)

```sql
DELIMITER $$

CREATE FUNCTION get_employee_shift(
    p_employee_id INT,
    p_date DATE
) RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_shift_id INT;
    DECLARE v_primary_shift_id INT;
    DECLARE v_department_id INT;
    DECLARE v_designation_id INT;
    DECLARE v_branch_id INT;
    DECLARE v_location_id INT;
    DECLARE v_template_id INT;
    DECLARE v_pattern_type VARCHAR(20);
    DECLARE v_rotation_days INT;
    DECLARE v_default_shift_id INT;
    DECLARE v_start_date DATE;
    DECLARE v_rotation_start_day INT;
    DECLARE v_days_since_start INT;
    DECLARE v_current_rotation_day INT;

    -- Step 1: Check for approved shift swap (HIGHEST PRIORITY)
    SELECT
        CASE
            WHEN requester_employee_id = p_employee_id THEN target_original_shift_id
            WHEN target_employee_id = p_employee_id THEN requester_original_shift_id
        END INTO v_shift_id
    FROM hrms_shift_swap_requests
    WHERE (requester_employee_id = p_employee_id OR target_employee_id = p_employee_id)
      AND swap_date = p_date
      AND approval_status = 'approved'
      AND is_active = 1
      AND deleted_at IS NULL
    LIMIT 1;

    IF v_shift_id IS NOT NULL THEN
        RETURN v_shift_id;  -- Return swapped shift
    END IF;

    -- Step 2: Get employee details
    SELECT
        shift_id, department_id, designation_id, branch_id, location_id
    INTO
        v_primary_shift_id, v_department_id, v_designation_id, v_branch_id, v_location_id
    FROM hrms_employees
    WHERE id = p_employee_id
      AND is_active = 1
      AND deleted_at IS NULL;

    IF v_primary_shift_id IS NULL THEN
        RETURN NULL;  -- Employee not found or inactive
    END IF;

    -- Step 3: Check for roster assignment (MEDIUM PRIORITY)
    SELECT
        ra.template_id,
        ra.start_date,
        ra.rotation_start_day,
        rt.pattern_type,
        rt.rotation_days,
        rt.default_shift_id
    INTO
        v_template_id,
        v_start_date,
        v_rotation_start_day,
        v_pattern_type,
        v_rotation_days,
        v_default_shift_id
    FROM hrms_employee_roster_assignment ra
    INNER JOIN hrms_roster_templates rt ON ra.template_id = rt.id
    WHERE (
        -- Employee-based assignment
        JSON_CONTAINS(ra.employee_ids, CAST(p_employee_id AS JSON))
        OR
        -- Department assignment
        (ra.department_ids IS NOT NULL
         AND v_department_id IS NOT NULL
         AND JSON_CONTAINS(ra.department_ids, CAST(v_department_id AS JSON)))
        OR
        -- Designation assignment
        (ra.designation_ids IS NOT NULL
         AND v_designation_id IS NOT NULL
         AND JSON_CONTAINS(ra.designation_ids, CAST(v_designation_id AS JSON)))
        OR
        -- Branch assignment
        (ra.branch_ids IS NOT NULL
         AND v_branch_id IS NOT NULL
         AND JSON_CONTAINS(ra.branch_ids, CAST(v_branch_id AS JSON)))
        OR
        -- Location assignment
        (ra.location_ids IS NOT NULL
         AND v_location_id IS NOT NULL
         AND JSON_CONTAINS(ra.location_ids, CAST(v_location_id AS JSON)))
    )
    AND ra.start_date <= p_date
    AND (ra.end_date IS NULL OR ra.end_date >= p_date)
    AND ra.is_active = 1
    AND ra.deleted_at IS NULL
    ORDER BY ra.priority DESC, ra.created_at DESC
    LIMIT 1;

    IF v_template_id IS NOT NULL THEN
        -- Roster assignment found
        IF v_pattern_type = 'fixed' THEN
            RETURN v_default_shift_id;
        ELSE
            -- Rotating pattern - calculate rotation day
            SET v_days_since_start = DATEDIFF(p_date, v_start_date);
            SET v_current_rotation_day = MOD(v_days_since_start + v_rotation_start_day - 1, v_rotation_days) + 1;

            -- Get shift for this rotation day
            SELECT shift_id INTO v_shift_id
            FROM hrms_roster_template_details
            WHERE template_id = v_template_id
              AND day_number = v_current_rotation_day
            LIMIT 1;

            RETURN v_shift_id;
        END IF;
    END IF;

    -- Step 4: No roster assignment, return primary shift (LOWEST PRIORITY)
    RETURN v_primary_shift_id;

END$$

DELIMITER ;
```

**Usage:**
```sql
-- Get Rahul's shift for March 15, 2025
SELECT get_employee_shift(101, '2025-03-15') as shift_id;
```

---

## API Endpoints Required

### 1. Roster Template Management

```javascript
POST   /api/roster/templates              // Create template
GET    /api/roster/templates              // List templates
GET    /api/roster/templates/:id          // Get template details
PUT    /api/roster/templates/:id          // Update template
DELETE /api/roster/templates/:id          // Delete template
```

### 2. Roster Assignment

```javascript
POST   /api/roster/assignments            // Create assignment
GET    /api/roster/assignments            // List assignments
GET    /api/roster/assignments/:id        // Get assignment details
PUT    /api/roster/assignments/:id        // Update assignment
DELETE /api/roster/assignments/:id        // Delete assignment

// Special endpoints
GET    /api/roster/employee/:id/schedule?start_date=2025-01-01&end_date=2025-01-31
       // Get employee's roster for date range

GET    /api/roster/department/:id/schedule?date=2025-01-15
       // Get all employees' roster for a department on specific date
```

### 3. Shift Swap Management

```javascript
POST   /api/roster/swap/request           // Create swap request
GET    /api/roster/swap/requests          // List swap requests
GET    /api/roster/swap/requests/:id      // Get swap request details
PUT    /api/roster/swap/:id/consent       // Target employee consent
PUT    /api/roster/swap/:id/approve       // Workflow approval
PUT    /api/roster/swap/:id/reject        // Workflow rejection
DELETE /api/roster/swap/:id               // Cancel swap request
```

---

## Migration Steps

### Step 1: Verify Employee Table Has Required Fields

**Required fields in `hrms_employees` table:**
- ✅ `shift_id` - Added in `001_create_shift_management_tables.sql`
- ✅ `branch_id` - Added in `005_add_organizational_fields_to_employees.sql`
- ✅ `location_id` - Added in `005_add_organizational_fields_to_employees.sql`
- ✅ `department_id` - Already exists
- ✅ `designation_id` - Already exists

**Verification Query:**
```sql
-- Check if all required fields exist
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'hrms_db'
  AND TABLE_NAME = 'hrms_employees'
  AND COLUMN_NAME IN ('shift_id', 'branch_id', 'location_id', 'department_id', 'designation_id');
```

**If any field is missing, run the organizational fields migration first:**
```bash
# Run this migration first if fields are missing
mysql -u root -p hrms_db < database/migrations/employee/005_add_organizational_fields_to_employees.sql
```

---

### Step 2: Create Roster Tables

Execute all CREATE TABLE statements from this document in order:
1. hrms_roster_templates
2. hrms_roster_template_details
3. hrms_employee_roster_assignment
4. hrms_shift_swap_requests
5. hrms_roster_change_log

### Step 3: Create SQL Function

Execute the `get_employee_shift()` function creation statement.

---

## Summary

### Data Storage Model:

**1. Primary Shift (Employee Level)**
```
hrms_employees.shift_id → Default shift for employee
```

**2. Roster Assignment (Template-Based, Date Range)**
```
hrms_employee_roster_assignment
  → References: hrms_roster_templates
  → References: hrms_roster_template_details (for rotation pattern)
```

**3. Shift Swap (Temporary, Single Date)**
```
hrms_shift_swap_requests
  → Requires: Both employee consent + Workflow approval
  → Highest priority when approved
```

### Priority Flow:

```
For date = 2025-03-15, employee_id = 101:

1. Check shift swap → Found & Approved? → Return swapped shift ✅
2. Check roster assignment → Found? → Calculate from template ✅
3. Return primary shift (employee.shift_id) ✅
```

### Key Benefits:

- ✅ **Efficient Storage:** 1 record for entire year instead of 365 records
- ✅ **Flexible Rotation:** Weekly, bi-weekly, monthly, custom patterns
- ✅ **Multiple Entities:** Assign to departments, designations, branches simultaneously
- ✅ **Priority-Based:** Clear hierarchy (Swap > Roster > Primary)
- ✅ **Approval Workflow:** Shift swaps require consent + approval
- ✅ **Audit Trail:** Complete change history
- ✅ **No Redundancy:** Employee won't have duplicate/conflicting rosters

---

## End of Document
