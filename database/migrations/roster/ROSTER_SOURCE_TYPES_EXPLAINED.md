# Roster Source Types - Detailed Explanation

This document explains the four types of roster sources and how data is stored in the database for each case.

---

## 1. TEMPLATE - Roster from Template

### Description
When a roster template is applied to an employee, the system automatically generates roster entries based on the template's pattern (fixed, rotating, or custom).

### Use Case Example
- Company has a "Week On/Week Off" template
- HR applies this template to Employee "John Doe" for January 2025
- System automatically creates 31 roster entries following the 14-day rotation pattern

### How Data is Stored

#### Step 1: Create Roster Template
**Table:** `hrms_roster_templates`

```sql
INSERT INTO hrms_roster_templates (
    company_id, template_code, template_name, template_description,
    pattern_type, rotation_days, default_shift_id,
    is_active, is_default, created_by
) VALUES (
    1, 'WEEK_ON_OFF', 'Week On / Week Off', '7 days work, 7 days off rotation',
    'rotating', 14, NULL,
    1, 0, 101
);
-- Assume this creates template_id = 5
```

#### Step 2: Create Template Details
**Table:** `hrms_roster_template_details`

```sql
-- Days 1-7: Day shift (shift_id = 1)
INSERT INTO hrms_roster_template_details (template_id, day_number, day_label, shift_id, is_weekly_off, display_order)
VALUES
    (5, 1, 'Week 1 - Day 1', 1, 0, 1),
    (5, 2, 'Week 1 - Day 2', 1, 0, 2),
    (5, 3, 'Week 1 - Day 3', 1, 0, 3),
    (5, 4, 'Week 1 - Day 4', 1, 0, 4),
    (5, 5, 'Week 1 - Day 5', 1, 0, 5),
    (5, 6, 'Week 1 - Day 6', 1, 0, 6),
    (5, 7, 'Week 1 - Day 7', 1, 0, 7);

-- Days 8-14: Weekly Off
INSERT INTO hrms_roster_template_details (template_id, day_number, day_label, shift_id, is_weekly_off, off_type, display_order)
VALUES
    (5, 8, 'Week 2 - Day 1 (Off)', NULL, 1, 'full_day', 8),
    (5, 9, 'Week 2 - Day 2 (Off)', NULL, 1, 'full_day', 9),
    (5, 10, 'Week 2 - Day 3 (Off)', NULL, 1, 'full_day', 10),
    (5, 11, 'Week 2 - Day 4 (Off)', NULL, 1, 'full_day', 11),
    (5, 12, 'Week 2 - Day 5 (Off)', NULL, 1, 'full_day', 12),
    (5, 13, 'Week 2 - Day 6 (Off)', NULL, 1, 'full_day', 13),
    (5, 14, 'Week 2 - Day 7 (Off)', NULL, 1, 'full_day', 14);
```

#### Step 3: Apply Template to Employee
**Table:** `hrms_employee_roster`

When HR applies template_id=5 to employee_id=250 for Jan 1-14, 2025:

```sql
-- Jan 1-7: Working days with Day Shift
INSERT INTO hrms_employee_roster (
    company_id, employee_id, roster_date, shift_id,
    is_weekly_off, off_type,
    roster_source, template_id, parent_roster_id,
    roster_status, is_active, created_by
) VALUES
    (1, 250, '2025-01-01', 1, 0, NULL, 'template', 5, NULL, 'published', 1, 101),
    (1, 250, '2025-01-02', 1, 0, NULL, 'template', 5, NULL, 'published', 1, 101),
    (1, 250, '2025-01-03', 1, 0, NULL, 'template', 5, NULL, 'published', 1, 101),
    (1, 250, '2025-01-04', 1, 0, NULL, 'template', 5, NULL, 'published', 1, 101),
    (1, 250, '2025-01-05', 1, 0, NULL, 'template', 5, NULL, 'published', 1, 101),
    (1, 250, '2025-01-06', 1, 0, NULL, 'template', 5, NULL, 'published', 1, 101),
    (1, 250, '2025-01-07', 1, 0, NULL, 'template', 5, NULL, 'published', 1, 101);

-- Jan 8-14: Weekly Off
INSERT INTO hrms_employee_roster (
    company_id, employee_id, roster_date, shift_id,
    is_weekly_off, off_type,
    roster_source, template_id, parent_roster_id,
    roster_status, is_active, created_by
) VALUES
    (1, 250, '2025-01-08', NULL, 1, 'full_day', 'template', 5, NULL, 'published', 1, 101),
    (1, 250, '2025-01-09', NULL, 1, 'full_day', 'template', 5, NULL, 'published', 1, 101),
    (1, 250, '2025-01-10', NULL, 1, 'full_day', 'template', 5, NULL, 'published', 1, 101),
    (1, 250, '2025-01-11', NULL, 1, 'full_day', 'template', 5, NULL, 'published', 1, 101),
    (1, 250, '2025-01-12', NULL, 1, 'full_day', 'template', 5, NULL, 'published', 1, 101),
    (1, 250, '2025-01-13', NULL, 1, 'full_day', 'template', 5, NULL, 'published', 1, 101),
    (1, 250, '2025-01-14', NULL, 1, 'full_day', 'template', 5, NULL, 'published', 1, 101);
```

#### Key Points for TEMPLATE:
- `roster_source = 'template'`
- `template_id = 5` (references the template used)
- `parent_roster_id = NULL` (original entry, not an override)
- System auto-generates entries based on template pattern
- Rotation cycle continues automatically

---

## 2. MANUAL - Manual Roster Entry

### Description
HR/Manager manually assigns a shift to an employee for specific date(s) without using any template.

### Use Case Example
- New employee "Jane Smith" joins on Jan 15, 2025
- HR manually assigns her to "Night Shift" for Jan 15-20, 2025
- No template is used

### How Data is Stored

**Table:** `hrms_employee_roster`

```sql
-- Manual assignment of Night Shift (shift_id=2) to employee_id=251 for Jan 15-20
INSERT INTO hrms_employee_roster (
    company_id, employee_id, roster_date, shift_id,
    is_weekly_off, off_type,
    roster_source, template_id, parent_roster_id,
    roster_status, is_active, notes, created_by
) VALUES
    (1, 251, '2025-01-15', 2, 0, NULL, 'manual', NULL, NULL, 'published', 1, 'New joinee - assigned night shift', 101),
    (1, 251, '2025-01-16', 2, 0, NULL, 'manual', NULL, NULL, 'published', 1, 'New joinee - assigned night shift', 101),
    (1, 251, '2025-01-17', 2, 0, NULL, 'manual', NULL, NULL, 'published', 1, 'New joinee - assigned night shift', 101),
    (1, 251, '2025-01-18', 2, 0, NULL, 'manual', NULL, NULL, 'published', 1, 'New joinee - assigned night shift', 101),
    (1, 251, '2025-01-19', 2, 0, NULL, 'manual', NULL, NULL, 'published', 1, 'New joinee - assigned night shift', 101),
    (1, 251, '2025-01-20', 2, 0, NULL, 'manual', NULL, NULL, 'published', 1, 'New joinee - assigned night shift', 101);
```

#### Another Example: Manual Weekly Off

```sql
-- HR manually marks Jan 21 as weekly off for employee_id=251
INSERT INTO hrms_employee_roster (
    company_id, employee_id, roster_date, shift_id,
    is_weekly_off, off_type,
    roster_source, template_id, parent_roster_id,
    roster_status, is_active, notes, created_by
) VALUES
    (1, 251, '2025-01-21', NULL, 1, 'full_day', 'manual', NULL, NULL, 'published', 1, 'Compensatory off for overtime', 101);
```

#### Key Points for MANUAL:
- `roster_source = 'manual'`
- `template_id = NULL` (no template used)
- `parent_roster_id = NULL` (original entry, not an override)
- `notes` field often used to explain why manual assignment was needed
- Common scenarios: new joiners, special assignments, one-off changes

---

## 3. SWAP - Shift Swap Between Employees

### Description
Two employees exchange their shifts for specific date(s). Requires approval from manager/HR.

### Use Case Example
- Employee "John" (ID=250) has Day Shift on Jan 10
- Employee "Sarah" (ID=252) has Night Shift on Jan 10
- They request to swap shifts
- Manager approves the swap

### How Data is Stored

#### Before Swap:
**Table:** `hrms_employee_roster`

```sql
-- John's original roster (Day Shift on Jan 10)
-- roster_id = 1001
INSERT INTO hrms_employee_roster (
    company_id, employee_id, roster_date, shift_id,
    is_weekly_off, roster_source, template_id,
    roster_status, is_active, created_by
) VALUES
    (1, 250, '2025-01-10', 1, 0, 'template', 5, 'published', 1, 101);

-- Sarah's original roster (Night Shift on Jan 10)
-- roster_id = 1002
INSERT INTO hrms_employee_roster (
    company_id, employee_id, roster_date, shift_id,
    is_weekly_off, roster_source, template_id,
    roster_status, is_active, created_by
) VALUES
    (1, 252, '2025-01-10', 2, 0, 'template', 6, 'published', 1, 101);
```

#### After Swap (Manager ID=105 approves):

**Step 1:** Deactivate original entries

```sql
-- Deactivate John's original entry
UPDATE hrms_employee_roster
SET is_active = 0, updated_by = 105
WHERE id = 1001;

-- Deactivate Sarah's original entry
UPDATE hrms_employee_roster
SET is_active = 0, updated_by = 105
WHERE id = 1002;
```

**Step 2:** Create swapped entries

```sql
-- John now gets Night Shift (swapped with Sarah)
-- roster_id = 1003
INSERT INTO hrms_employee_roster (
    company_id, employee_id, roster_date, shift_id,
    is_weekly_off, off_type,
    roster_source, template_id, parent_roster_id,
    swapped_with_employee_id, swap_reason, swap_approved_by, swap_approved_at,
    roster_status, is_active, notes, created_by
) VALUES (
    1, 250, '2025-01-10', 2, 0, NULL,
    'swap', 5, 1001,
    252, 'Personal emergency - need to attend family event in evening', 105, '2025-01-08 10:30:00',
    'published', 1, 'Shift swapped with Sarah (ID:252)', 250
);

-- Sarah now gets Day Shift (swapped with John)
-- roster_id = 1004
INSERT INTO hrms_employee_roster (
    company_id, employee_id, roster_date, shift_id,
    is_weekly_off, off_type,
    roster_source, template_id, parent_roster_id,
    swapped_with_employee_id, swap_reason, swap_approved_by, swap_approved_at,
    roster_status, is_active, notes, created_by
) VALUES (
    1, 252, '2025-01-10', 1, 0, NULL,
    'swap', 6, 1002,
    250, 'Agreed to swap with John due to his emergency', 105, '2025-01-08 10:30:00',
    'published', 1, 'Shift swapped with John (ID:250)', 252
);
```

#### Change Log Entries:

**Table:** `hrms_roster_change_log`

```sql
-- Log for John's swap
INSERT INTO hrms_roster_change_log (
    company_id, employee_id, roster_id,
    change_type, change_date,
    old_shift_id, new_shift_id,
    old_roster_status, new_roster_status,
    change_reason, changed_by, changed_at,
    old_values, new_values, affected_records_count
) VALUES (
    1, 250, 1003,
    'swap', '2025-01-10',
    1, 2,
    'published', 'published',
    'Shift swapped with Sarah (ID:252) - Personal emergency', 105, '2025-01-08 10:30:00',
    '{"shift_id": 1, "shift_name": "Day Shift"}',
    '{"shift_id": 2, "shift_name": "Night Shift", "swapped_with": 252}',
    1
);

-- Log for Sarah's swap
INSERT INTO hrms_roster_change_log (
    company_id, employee_id, roster_id,
    change_type, change_date,
    old_shift_id, new_shift_id,
    old_roster_status, new_roster_status,
    change_reason, changed_by, changed_at,
    old_values, new_values, affected_records_count
) VALUES (
    1, 252, 1004,
    'swap', '2025-01-10',
    2, 1,
    'published', 'published',
    'Shift swapped with John (ID:250) - Agreement to help colleague', 105, '2025-01-08 10:30:00',
    '{"shift_id": 2, "shift_name": "Night Shift"}',
    '{"shift_id": 1, "shift_name": "Day Shift", "swapped_with": 250}',
    1
);
```

#### Key Points for SWAP:
- `roster_source = 'swap'`
- `template_id` = Original template ID (preserved for reference)
- `parent_roster_id` = Points to the original deactivated roster entry
- `swapped_with_employee_id` = The other employee in the swap
- `swap_reason` = Why swap was requested
- `swap_approved_by` = Manager/HR who approved
- `swap_approved_at` = Timestamp of approval
- Original entries are deactivated (`is_active = 0`), not deleted
- Complete audit trail maintained

---

## 4. OVERRIDE - Temporary Roster Override

### Description
Temporarily change an employee's roster for specific date(s) without affecting the template-based schedule. Original entry remains for reference.

### Use Case Example
- Employee "John" (ID=250) is scheduled for Day Shift on Jan 15 (from template)
- Due to urgent project, manager assigns him to Night Shift for Jan 15 only
- Template-based schedule resumes from Jan 16

### How Data is Stored

#### Original Entry (from template):
**Table:** `hrms_employee_roster`

```sql
-- John's original roster (Day Shift on Jan 15 from template)
-- roster_id = 2001
INSERT INTO hrms_employee_roster (
    company_id, employee_id, roster_date, shift_id,
    is_weekly_off, roster_source, template_id,
    roster_status, is_active, created_by
) VALUES
    (1, 250, '2025-01-15', 1, 0, 'template', 5, 'published', 1, 101);
```

#### After Override:

**Step 1:** Deactivate original entry

```sql
UPDATE hrms_employee_roster
SET is_active = 0, updated_by = 105
WHERE id = 2001;
```

**Step 2:** Create override entry

```sql
-- Override to Night Shift for Jan 15
-- roster_id = 2002
INSERT INTO hrms_employee_roster (
    company_id, employee_id, roster_date, shift_id,
    is_weekly_off, off_type,
    roster_source, template_id, parent_roster_id,
    swapped_with_employee_id, swap_reason,
    roster_status, is_active, notes, created_by
) VALUES (
    1, 250, '2025-01-15', 2, 0, NULL,
    'override', 5, 2001,
    NULL, NULL,
    'published', 1, 'Urgent project deployment - need night shift coverage', 105
);
```

#### Change Log Entry:

**Table:** `hrms_roster_change_log`

```sql
INSERT INTO hrms_roster_change_log (
    company_id, employee_id, roster_id,
    change_type, change_date,
    old_shift_id, new_shift_id,
    old_roster_status, new_roster_status,
    change_reason, changed_by, changed_at,
    old_values, new_values, affected_records_count
) VALUES (
    1, 250, 2002,
    'override', '2025-01-15',
    1, 2,
    'published', 'published',
    'Urgent project deployment requires night shift coverage', 105, '2025-01-14 16:00:00',
    '{"shift_id": 1, "shift_name": "Day Shift", "source": "template"}',
    '{"shift_id": 2, "shift_name": "Night Shift", "source": "override"}',
    1
);
```

#### Another Override Example: Weekly Off Override

```sql
-- Original: John scheduled to work on Jan 20 (Day Shift)
-- roster_id = 2003
INSERT INTO hrms_employee_roster (
    company_id, employee_id, roster_date, shift_id,
    is_weekly_off, roster_source, template_id,
    roster_status, is_active, created_by
) VALUES
    (1, 250, '2025-01-20', 1, 0, 'template', 5, 'published', 1, 101);

-- Deactivate
UPDATE hrms_employee_roster SET is_active = 0, updated_by = 105 WHERE id = 2003;

-- Override: Grant compensatory off
-- roster_id = 2004
INSERT INTO hrms_employee_roster (
    company_id, employee_id, roster_date, shift_id,
    is_weekly_off, off_type,
    roster_source, template_id, parent_roster_id,
    roster_status, is_active, notes, created_by
) VALUES (
    1, 250, '2025-01-20', NULL, 1, 'full_day',
    'override', 5, 2003,
    'published', 1, 'Compensatory off for working on public holiday Jan 14', 105
);
```

#### Key Points for OVERRIDE:
- `roster_source = 'override'`
- `template_id` = Original template ID (preserved for reference)
- `parent_roster_id` = Points to the original deactivated roster entry
- `swapped_with_employee_id = NULL` (not a swap)
- Original entry is deactivated but kept for audit trail
- Override is temporary - template resumes for subsequent dates
- Common scenarios: urgent needs, compensatory offs, special projects

---

## Summary Table

| Source Type | Template ID | Parent Roster ID | Swapped With | Use Case |
|-------------|-------------|------------------|--------------|----------|
| **template** | ✓ (Used) | NULL | NULL | Auto-generated from roster template |
| **manual** | NULL | NULL | NULL | HR/Manager manually assigns shift |
| **swap** | ✓ (Original) | ✓ (Original entry) | ✓ (Other employee) | Two employees exchange shifts |
| **override** | ✓ (Original) | ✓ (Original entry) | NULL | Temporary change to template-based roster |

---

## Data Integrity Rules

1. **Unique Active Roster per Date**
   - Only ONE active roster entry per employee per date
   - `UNIQUE KEY unique_employee_date_active (employee_id, roster_date, is_active, deleted_at)`

2. **Deactivation, Not Deletion**
   - Original entries are deactivated (`is_active = 0`), not deleted
   - Maintains complete audit trail
   - Allows rollback if needed

3. **Parent-Child Relationship**
   - Override and Swap entries link to original via `parent_roster_id`
   - Can trace history: Template → Override → Swap

4. **Approval Workflow**
   - Swaps require approval (`swap_approved_by`, `swap_approved_at`)
   - Can implement draft → approval → published workflow

5. **Status Management**
   - `draft` = Being edited, not active yet
   - `published` = Active roster, employees can see
   - `locked` = Attendance marked, cannot modify

---

## Query Examples

### Get Active Roster for Employee on Specific Date

```sql
SELECT
    er.id,
    er.roster_date,
    er.shift_id,
    sm.shift_name,
    er.is_weekly_off,
    er.off_type,
    er.roster_source,
    CASE
        WHEN er.roster_source = 'swap' THEN CONCAT('Swapped with Employee #', er.swapped_with_employee_id)
        WHEN er.roster_source = 'override' THEN 'Temporary Override'
        WHEN er.roster_source = 'manual' THEN 'Manual Assignment'
        WHEN er.roster_source = 'template' THEN CONCAT('From Template: ', rt.template_name)
    END as source_description
FROM hrms_employee_roster er
LEFT JOIN hrms_shift_master sm ON er.shift_id = sm.id
LEFT JOIN hrms_roster_templates rt ON er.template_id = rt.id
WHERE er.employee_id = 250
  AND er.roster_date = '2025-01-10'
  AND er.is_active = 1
  AND er.deleted_at IS NULL;
```

### Get Roster History for a Date (including overrides)

```sql
SELECT
    er.id,
    er.roster_date,
    sm.shift_name,
    er.roster_source,
    er.is_active,
    er.created_at,
    er.notes,
    parent_sm.shift_name as original_shift
FROM hrms_employee_roster er
LEFT JOIN hrms_shift_master sm ON er.shift_id = sm.id
LEFT JOIN hrms_employee_roster parent_er ON er.parent_roster_id = parent_er.id
LEFT JOIN hrms_shift_master parent_sm ON parent_er.shift_id = parent_sm.id
WHERE er.employee_id = 250
  AND er.roster_date = '2025-01-15'
  AND er.deleted_at IS NULL
ORDER BY er.created_at DESC;
```

### Get All Pending Swap Requests

```sql
SELECT
    er.id,
    er.employee_id,
    CONCAT(e1.first_name, ' ', e1.last_name) as employee_name,
    er.roster_date,
    sm1.shift_name as requested_shift,
    er.swapped_with_employee_id,
    CONCAT(e2.first_name, ' ', e2.last_name) as swap_with_employee,
    sm2.shift_name as current_shift,
    er.swap_reason,
    er.created_at as requested_at
FROM hrms_employee_roster er
INNER JOIN hrms_employees e1 ON er.employee_id = e1.id
INNER JOIN hrms_employees e2 ON er.swapped_with_employee_id = e2.id
INNER JOIN hrms_shift_master sm1 ON er.shift_id = sm1.id
LEFT JOIN hrms_employee_roster original ON er.parent_roster_id = original.id
LEFT JOIN hrms_shift_master sm2 ON original.shift_id = sm2.id
WHERE er.roster_source = 'swap'
  AND er.swap_approved_by IS NULL
  AND er.roster_status = 'draft'
  AND er.deleted_at IS NULL
ORDER BY er.created_at ASC;
```

---

## End of Documentation
