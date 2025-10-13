# Workflow Applicability Priority Guide

## 📋 Overview

This document explains how the workflow system determines which workflow configuration is applicable to an employee when multiple workflows exist for the same workflow type (e.g., Leave, On Duty, etc.).

---

## 🎯 Priority Hierarchy

When an employee submits a workflow request, the system selects the workflow based on this **built-in priority hierarchy**:

### **Priority Order (Highest to Lowest)**

| Priority | Applicability Type | Description | Example |
|----------|-------------------|-------------|---------|
| **1** | `custom_employee` | Employee-specific rule | John Doe has custom leave workflow |
| **2** | `department` | Department-specific rule | IT Department has special workflow |
| **3** | `designation` | Designation-specific rule | Managers have different workflow |
| **4** | `level` | Level-specific rule | L3 employees have auto-approval |
| **5** | `entity` | Entity-specific rule | Mumbai office has specific workflow |
| **6** | `company` | Company-wide rule | All company employees |
| **7** | `default` | Default workflow | Fallback if no rules match |

**Additional types (lower priority):**
- `sub_department` (Priority 7)
- `grade` (Priority 8)
- `location` (Priority 9)

---

## 🔍 How Priority Resolution Works

### Example Scenario

Let's say you have a Leave workflow with these configurations:

**Workflow A:** For IT Department (2-stage approval)
**Workflow B:** For John Doe (custom_employee - 1-stage approval)
**Workflow C:** Default for entire company (3-stage approval)

**When John Doe (IT Department employee) submits a leave request:**

1. ✅ **Check Priority 1 (custom_employee):** Match found! → **Workflow B selected**
2. ~~Check Priority 2 (department):~~ Skipped (higher priority already matched)
3. ~~Check default workflow:~~ Skipped

**Result:** John Doe gets **Workflow B** (1-stage approval) instead of IT Department workflow or company default.

---

## 📊 Real-World Examples

### Example 1: Department vs Designation

**Setup:**
- Workflow A: Applicable to Finance Department (2-stage)
- Workflow B: Applicable to Managers designation (1-stage)
- Default Workflow: Company-wide (3-stage)

**Employee: Sarah (Manager in Finance Department)**

**Resolution:**
1. Check custom_employee: No match
2. ✅ Check department: **Match found (Finance Department)** → Workflow A selected
3. Designation check skipped (lower priority)

**Result:** Sarah gets **Workflow A (2-stage)** because department priority (2) beats designation priority (3).

---

### Example 2: Multiple Rules for Same Employee

**Setup:**
- Rule 1: Created on Jan 1, 2024 - John Doe → Workflow A
- Rule 2: Created on Feb 1, 2024 - John Doe → Workflow B
- Rule 3: Created on Mar 1, 2024 - John Doe → Workflow C

**What Happens:**
When Rule 3 is created (Mar 1), the system automatically:
1. Deactivates Rule 1 and Rule 2
2. Makes Rule 3 active

**Result:** John Doe gets **Workflow C** (newest rule)

---

### Example 3: Complex Multi-Level Matching

**Company Structure:**
- **Entity:** Mumbai Office
- **Department:** IT Department
- **Employee:** Raj (Level L3, Designation: Senior Developer)

**Workflows Configured:**
1. Workflow A: For Mumbai Entity (2-stage)
2. Workflow B: For IT Department (3-stage)
3. Workflow C: For Level L3 (auto-approve)
4. Default Workflow: Company-wide (4-stage)

**Priority Resolution:**
1. Check custom_employee: No match
2. ✅ **Check department: Match found!** → **Workflow B (IT Department)**
3. Designation: Skipped (lower priority)
4. Level: Skipped (lower priority)
5. Entity: Skipped (lower priority)

**Result:** Raj gets **Workflow B (3-stage)** for IT Department.

---

### Example 4: Changing Employee's Workflow

**Initial State:**
- Employee: Alice
- Active Rule: Alice → Workflow A (created Jan 1)

**Requirement:** Change Alice to Workflow B

**Process:**
```javascript
POST /api/workflow/admin/configs/2/applicability
{
  "applicability_type": "custom_employee",
  "employee_id": 123,  // Alice's employee ID
  "created_by": 1
}
```

**What Happens Automatically:**
1. Old rule (Alice → Workflow A) is deactivated
2. New rule (Alice → Workflow B) is created and activated
3. Next time Alice submits a request, Workflow B is used

**Result:** Alice now gets **Workflow B** without needing to manually deactivate old rules.

---

## 🛠️ Implementation Details

### How It Works Internally

When an employee submits a workflow request:

```javascript
// 1. Get all active workflows for the workflow type
const workflows = await HrmsWorkflowConfig.findAll({
    where: {
        company_id: employee.company_id,
        workflow_master_id: workflowMasterId,
        is_active: true
    },
    include: [{
        model: HrmsWorkflowApplicability,
        where: { is_active: true },
        order: [['created_at', 'DESC']]  // Newest rules first
    }]
});

// 2. Check each workflow's applicability rules
for (const workflow of workflows) {
    for (const rule of workflow.applicability) {
        // Check if rule matches employee
        if (matches) {
            // Get built-in priority
            const priority = getBuiltInPriority(rule.applicability_type);

            // If higher priority than current match
            if (priority < currentHighestPriority) {
                selectedWorkflow = workflow;
                currentHighestPriority = priority;
            }
        }
    }
}
```

### Built-In Priority Function

```javascript
const getBuiltInPriority = (applicabilityType) => {
    const priorityMap = {
        'custom_employee': 1,
        'department': 2,
        'designation': 3,
        'level': 4,
        'entity': 5,
        'company': 6,
        'sub_department': 7,
        'grade': 8,
        'location': 9
    };
    return priorityMap[applicabilityType] || 999;
};
```

---

## 📝 Configuration Best Practices

### 1. Always Have a Default Workflow

```javascript
{
  "workflow_name": "Default Leave Workflow",
  "is_default": true,
  "applicability": []  // No rules = applies to everyone
}
```

**Why:** Ensures all employees have a fallback workflow if no specific rules match.

---

### 2. Use Department-Level Rules for Most Cases

```javascript
{
  "workflow_name": "IT Department Leave Workflow",
  "applicability": [{
    "applicability_type": "department",
    "department_id": 5,
    "priority": 2  // Auto-calculated from type
  }]
}
```

**Why:** Easier to manage than individual employee rules, and more specific than company-wide.

---

### 3. Use Employee-Level Rules for Exceptions

```javascript
{
  "workflow_name": "CEO Leave Workflow",
  "applicability": [{
    "applicability_type": "custom_employee",
    "employee_id": 1,  // CEO
    "priority": 1  // Auto-calculated (highest)
  }]
}
```

**Why:** Allows specific exceptions without affecting departmental rules.

---

### 4. Document Your Workflow Strategy

Create a mapping document:
```
Finance Department → 3-stage approval (Manager → Finance Head → CFO)
IT Department → 2-stage approval (Manager → CTO)
HR Department → 2-stage approval (Manager → HR Head)
Senior Leadership → Auto-approve (custom_employee rules)
Default → 2-stage approval (Manager → HR Admin)
```

---

## 🚨 Common Scenarios & Solutions

### Scenario 1: Employee Not Getting Expected Workflow

**Problem:** John is in IT Department but gets the default workflow instead of IT Department workflow.

**Diagnosis:**
```sql
-- Check what workflows are configured
SELECT wc.workflow_name, wa.applicability_type, wa.is_active
FROM hrms_workflow_config wc
LEFT JOIN hrms_workflow_applicability wa ON wc.id = wa.workflow_config_id
WHERE wc.workflow_master_id = 1 AND wc.company_id = 1;
```

**Possible Causes:**
1. ❌ IT Department workflow is not active (`is_active = false`)
2. ❌ Applicability rule is not active
3. ❌ Employee's department_id doesn't match the rule's department_id
4. ❌ Higher priority rule exists that matches the employee

**Solution:**
- Verify workflow and rule are active
- Check employee's department_id matches
- Review all applicability rules for conflicts

---

### Scenario 2: New Rule Not Applied

**Problem:** Created a new rule for Sarah, but she still gets the old workflow.

**Cause:** Old rule is still active (not auto-deactivated because it's not `custom_employee` type).

**Solution:**
```sql
-- Manually deactivate old rule
UPDATE hrms_workflow_applicability
SET is_active = false
WHERE employee_id = 123 AND id != [new_rule_id];
```

**Note:** Auto-deactivation only works for `custom_employee` type rules.

---

### Scenario 3: Multiple Departments for Employee

**Problem:** Employee belongs to multiple departments (primary and secondary). Which workflow applies?

**Answer:** The workflow checks `employee.department_id` (primary department only). Secondary department is not considered.

**Workaround:** Create a `custom_employee` rule if the employee needs a different workflow.

---

## 📊 Testing Priority Resolution

### Test Case 1: Basic Priority

```javascript
// Setup
await createWorkflow('IT Dept Workflow', { department_id: 5 });
await createWorkflow('Default Workflow', { is_default: true });

// Test
const workflow = await findApplicableWorkflow(employeeId=101, workflowMasterId=1);

// Expected: IT Dept Workflow (department priority > default)
assert(workflow.workflow_name === 'IT Dept Workflow');
```

---

### Test Case 2: Employee Override

```javascript
// Setup
await createWorkflow('IT Dept Workflow', { department_id: 5 });
await createWorkflow('John Doe Custom', { employee_id: 101 });

// Test
const workflow = await findApplicableWorkflow(employeeId=101, workflowMasterId=1);

// Expected: John Doe Custom (employee priority > department)
assert(workflow.workflow_name === 'John Doe Custom');
```

---

### Test Case 3: Newest Rule Wins

```javascript
// Setup
await createWorkflow('Workflow A', { employee_id: 101 }); // Created Jan 1
await sleep(1000);
await createWorkflow('Workflow B', { employee_id: 101 }); // Created Jan 2 (newest)

// Test
const workflow = await findApplicableWorkflow(employeeId=101, workflowMasterId=1);

// Expected: Workflow B (newest rule auto-activated, old one deactivated)
assert(workflow.workflow_name === 'Workflow B');
```

---

## 🔧 API Examples

### Create Department-Level Applicability

```bash
POST /api/workflow/admin/configs/1/applicability
Content-Type: application/json

{
  "applicability_type": "department",
  "department_id": 5,
  "created_by": 1
}

# Response:
{
  "success": true,
  "data": {
    "id": 10,
    "applicability_type": "department",
    "department_id": 5,
    "priority": 2,  # Auto-calculated
    "is_active": true
  }
}
```

---

### Create Employee-Level Applicability (Auto-Deactivates Old Rules)

```bash
POST /api/workflow/admin/configs/2/applicability
Content-Type: application/json

{
  "applicability_type": "custom_employee",
  "employee_id": 123,
  "created_by": 1
}

# Response:
{
  "success": true,
  "message": "✓ Deactivated 1 older rule(s) for employee 123",
  "data": {
    "id": 11,
    "applicability_type": "custom_employee",
    "employee_id": 123,
    "priority": 1,  # Auto-calculated (highest)
    "is_active": true
  }
}
```

---

### Get All Applicability Rules (Sorted by Priority)

```bash
GET /api/workflow/admin/configs/1/applicability

# Response:
{
  "success": true,
  "data": [
    {
      "id": 5,
      "applicability_type": "custom_employee",
      "employee_id": 101,
      "priority": 1,  # Highest
      "is_active": true
    },
    {
      "id": 6,
      "applicability_type": "department",
      "department_id": 5,
      "priority": 2,
      "is_active": true
    },
    {
      "id": 7,
      "applicability_type": "company",
      "company_id": 1,
      "priority": 6,  # Lowest
      "is_active": true
    }
  ]
}
```

---

## 📈 Database Queries for Analysis

### Find All Active Rules for an Employee

```sql
SELECT
    wc.workflow_name,
    wa.applicability_type,
    wa.priority,
    wa.is_active,
    wa.created_at,
    CASE wa.applicability_type
        WHEN 'custom_employee' THEN 'Highest'
        WHEN 'department' THEN 'High'
        WHEN 'designation' THEN 'Medium'
        WHEN 'level' THEN 'Medium-Low'
        WHEN 'entity' THEN 'Low'
        WHEN 'company' THEN 'Lowest'
    END as priority_level
FROM hrms_workflow_config wc
JOIN hrms_workflow_applicability wa ON wc.id = wa.workflow_config_id
WHERE wc.company_id = 1
  AND wc.workflow_master_id = 1  -- Leave workflow
  AND wa.is_active = true
  AND (
    (wa.applicability_type = 'custom_employee' AND wa.employee_id = 123)
    OR (wa.applicability_type = 'department' AND wa.department_id = 5)
    OR (wa.applicability_type = 'company' AND wa.company_id = 1)
  )
ORDER BY wa.priority ASC, wa.created_at DESC;
```

---

### Check for Conflicting Rules

```sql
-- Find employees with multiple active custom_employee rules (should not happen)
SELECT
    employee_id,
    COUNT(*) as rule_count,
    GROUP_CONCAT(workflow_config_id) as workflows
FROM hrms_workflow_applicability
WHERE applicability_type = 'custom_employee'
  AND is_active = true
GROUP BY employee_id
HAVING COUNT(*) > 1;
```

---

## ✅ Summary

### Key Takeaways

1. **Priority Order:** Employee > Department > Designation > Level > Entity > Company
2. **Automatic Deactivation:** When creating new `custom_employee` rule, old rules for same employee are auto-deactivated
3. **Newest Wins:** If multiple rules of same type exist, newest (by `created_at`) is used
4. **Always Have Default:** Configure a default workflow to catch all employees
5. **Use Department Rules:** Most efficient for managing groups of employees
6. **Employee Rules for Exceptions:** Reserve `custom_employee` for special cases

### Priority Principles

✅ **More specific always wins** (employee-level beats department-level)
✅ **Newest rule wins** (for same specificity level)
✅ **Auto-cleanup** (old employee-specific rules are deactivated automatically)
✅ **Fallback to default** (if no specific rules match)

---

**For implementation details, see:** `src/services/workflow/applicability.service.js`

**Generated with Claude Code** 🤖
**Last Updated:** October 12, 2025
