# HRMS Employee Form - Seed Data

## Overview
This file contains the default employee creation form template for the HRMS system. The form includes 71 fields organized into 8 logical sections, covering all standard employee information required in the industry.

## Installation

### Option 1: Using MySQL Client
```bash
mysql -h 103.160.145.136 -u hrms_user -p'hrms@2024secure' hrms_db < database/seeds/employee_form_seed.sql
```

### Option 2: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open `employee_form_seed.sql`
4. Execute the script

### Option 3: Manual Copy-Paste
Copy the SQL content and run it in your preferred MySQL client.

## Form Structure

### Template
- **Name**: Employee Information Template
- **Slug**: `employee_template`
- **Entity Type**: `employees`
- **Description**: Complete employee information form with personal, employment, and document details

### Sections (8 Total)

| Section | Fields | Collapsible | Description |
|---------|--------|-------------|-------------|
| **1. Personal Information** | 10 | No | Basic personal details (name, DOB, gender, parents, marital status, etc.) |
| **2. Contact Information** | 4 | Yes | Email, phone numbers |
| **3. Address Information** | 11 | Yes | Current and permanent addresses |
| **4. Employment Details** | 12 | No | Job-related information (department, designation, joining date, etc.) |
| **5. Emergency Contact** | 5 | Yes | Emergency contact person details |
| **6. Bank & Payment** | 6 | Yes | Banking and tax information |
| **7. Documents** | 7 | Yes | Identity documents and file uploads |
| **8. Additional Information** | 9 | Yes | Education, experience, skills, etc. |

## Field Types

The form uses various field types:
- **text** - Single line text input
- **email** - Email address with validation
- **phone** - Phone number with regex validation
- **number** - Numeric input
- **date** - Date picker
- **select** - Dropdown with predefined options
- **radio** - Single selection from options
- **checkbox** - Single checkbox (yes/no)
- **textarea** - Multi-line text input
- **file** - File upload with type/size restrictions
- **url** - URL input with validation
- **master_select** - Dropdown populated from master tables (departments, designations, etc.)

## Direct vs Custom Fields

### Direct Fields (16 fields)
**Stored directly in `hrms_employees` table for performance**

| Field | Type | Section | Required |
|-------|------|---------|----------|
| first_name | text | Personal | Yes |
| middle_name | text | Personal | No |
| last_name | text | Personal | No |
| date_of_birth | date | Personal | Yes |
| gender | select | Personal | Yes |
| email | email | Contact | Yes |
| phone | phone | Contact | Yes |
| date_of_joining | date | Employment | Yes |
| employee_code | text | Employment | Yes |
| department_id | master_select | Employment | Yes |
| sub_department_id | master_select | Employment | No |
| designation_id | master_select | Employment | Yes |
| reporting_manager_id | master_select | Employment | No |
| employment_type | select | Employment | Yes |
| status | select | Employment | Yes |
| profile_picture | file | Documents | No |

**Why Direct Fields?**
- Frequently queried fields (for filtering, sorting, reporting)
- Required for system functionality (email, employee_code, department)
- Better performance for joins and complex queries
- Standard across all companies

### Custom Fields (55 fields)
**Stored in `hrms_template_responses` for flexibility**

These fields are stored as JSON in the template_responses table, allowing:
- Company-specific customizations
- Easy addition/removal of fields
- No schema changes required
- Flexible data structure

**Examples**: father_name, mother_name, blood_group, bank details, educational certificates, hobbies, etc.

## Field Details by Section

### 1. Personal Information (10 fields)
```
✓ First Name* (text, 2-50 chars) - Direct Field
✓ Middle Name (text, 1-50 chars) - Direct Field
✓ Last Name (text, 1-50 chars) - Direct Field
✓ Date of Birth* (date, 18+ years) - Direct Field
✓ Gender* (select: Male/Female/Other) - Direct Field
✓ Father's Name (text, 2-100 chars)
✓ Mother's Name (text, 2-100 chars)
✓ Marital Status (select: Single/Married/Divorced/Widowed)
✓ Blood Group (select: A+/A-/B+/B-/O+/O-/AB+/AB-)
✓ Nationality (text, default: Indian)
```

### 2. Contact Information (4 fields)
```
✓ Official Email* (email) - Direct Field
✓ Official Phone* (phone, 10 digits) - Direct Field
✓ Alternate Phone (phone, 10 digits)
✓ Personal Email (email)
```

### 3. Address Information (11 fields)
```
Current Address:
✓ Address Line 1* (text, 5-200 chars)
✓ Address Line 2 (text)
✓ City* (text)
✓ State* (text)
✓ Pincode* (6 digits)

✓ Same as Current Address (checkbox)

Permanent Address:
✓ Address Line 1* (text, 5-200 chars)
✓ Address Line 2 (text)
✓ City* (text)
✓ State* (text)
✓ Pincode* (6 digits)
```

### 4. Employment Details (12 fields)
```
✓ Employee Code* (text, unique) - Direct Field
✓ Date of Joining* (date) - Direct Field
✓ Department* (master_select: hrms_company_departments) - Direct Field
✓ Sub Department (master_select: hrms_company_departments) - Direct Field
✓ Designation* (master_select: hrms_designations) - Direct Field
✓ Reporting Manager (master_select: hrms_employees) - Direct Field
✓ Employment Type* (select: Full-Time/Part-Time/Contract/Intern) - Direct Field
✓ Status* (select: Active/Inactive/On Leave/Terminated) - Direct Field
✓ Work Location (text)
✓ Probation Period (number, in months)
✓ Notice Period (number, in days)
✓ Confirmation Date (date)
```

### 5. Emergency Contact (5 fields)
```
✓ Contact Name* (text, 2-100 chars)
✓ Relationship* (text)
✓ Contact Phone* (phone, 10 digits)
✓ Alternate Phone (phone, 10 digits)
✓ Address (textarea)
```

### 6. Bank & Payment Information (6 fields)
```
✓ Bank Name* (text)
✓ Account Number* (text, 9-18 digits)
✓ IFSC Code* (text, 11 chars, format: ABCD0123456)
✓ Account Holder Name* (text)
✓ Branch Name (text)
✓ PAN Number* (text, format: ABCDE1234F)
```

### 7. Documents (7 fields)
```
✓ Aadhaar Number (text, 12 digits)
✓ Passport Number (text)
✓ Passport Expiry Date (date)
✓ Profile Picture (file: jpg/jpeg/png, max 5MB) - Direct Field
✓ Resume/CV (file: pdf/doc/docx, max 5MB)
✓ Educational Certificates (file: pdf/jpg/jpeg/png, max 10MB)
✓ Experience Letters (file: pdf/doc/docx, max 10MB)
```

### 8. Additional Information (9 fields)
```
✓ Highest Education (text)
✓ Specialization (text)
✓ Total Experience (number, in years)
✓ Previous Company (text)
✓ Skills (textarea, comma-separated)
✓ Languages Known (textarea, comma-separated)
✓ Hobbies (textarea)
✓ LinkedIn Profile (url)
✓ Notes (textarea, for internal use)
```

## Validation Rules

### Regex Patterns Used
```javascript
// Phone: Indian format (10 digits)
^[6-9][0-9]{9}$

// PAN: Format ABCDE1234F
^[A-Z]{5}[0-9]{4}[A-Z]{1}$

// IFSC: Format ABCD0123456
^[A-Z]{4}0[A-Z0-9]{6}$

// Aadhaar: 12 digits
^[0-9]{12}$

// Account Number: 9-18 digits
^[0-9]{9,18}$

// Pincode: 6 digits
^[0-9]{6}$
```

### Field Width Options
- **full** - 100% width (full row)
- **half** - 50% width (2 per row)
- **third** - 33.33% width (3 per row)
- **quarter** - 25% width (4 per row)

## Usage in Code

### Fetching Form Structure
```javascript
const { HrmsFormMaster, HrmsTemplateSection, HrmsTemplateField } = require('../models');

// Get complete form structure
const formTemplate = await HrmsFormMaster.findOne({
    where: {
        slug: 'employee_template',
        is_active: 1
    },
    include: [
        {
            model: HrmsTemplateSection,
            as: 'sections',
            where: { is_active: 1 },
            required: false,
            include: [
                {
                    model: HrmsTemplateField,
                    as: 'fields',
                    where: { is_active: 1 },
                    required: false
                }
            ]
        }
    ],
    order: [
        ['sections', 'display_order', 'ASC'],
        ['sections', 'fields', 'display_order', 'ASC']
    ]
});
```

### Saving Employee Data
```javascript
const { HrmsEmployee, HrmsTemplateResponse } = require('../models');
const { sequelize } = require('../utils/database');

const createEmployee = async (formData, companyId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        // 1. Save direct fields to hrms_employees
        const employee = await HrmsEmployee.create({
            company_id: companyId,
            user_id: userId,
            first_name: formData.first_name,
            middle_name: formData.middle_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            date_of_joining: formData.date_of_joining,
            employee_code: formData.employee_code,
            department_id: formData.department_id,
            sub_department_id: formData.sub_department_id,
            designation_id: formData.designation_id,
            reporting_manager_id: formData.reporting_manager_id,
            employment_type: formData.employment_type,
            status: formData.status,
            profile_picture: formData.profile_picture,
            created_by: userId
        }, { transaction });

        // 2. Save custom fields to hrms_template_responses
        const customFields = {
            father_name: formData.father_name,
            mother_name: formData.mother_name,
            marital_status: formData.marital_status,
            blood_group: formData.blood_group,
            nationality: formData.nationality,
            alternate_phone: formData.alternate_phone,
            personal_email: formData.personal_email,
            // ... all other custom fields
            bank_name: formData.bank_name,
            account_number: formData.account_number,
            ifsc_code: formData.ifsc_code,
            // ... etc
        };

        // Get template ID
        const template = await HrmsFormMaster.findOne({
            where: { slug: 'employee_template' }
        });

        // Save as single JSON response
        await HrmsTemplateResponse.create({
            template_id: template.id,
            entity_type: 'employees',
            entity_id: employee.id,
            company_id: companyId,
            response_data: customFields,
            created_by: userId
        }, { transaction });

        await transaction.commit();
        return employee;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
```

### Retrieving Complete Employee Data
```javascript
const getEmployeeWithCustomFields = async (employeeId) => {
    const employee = await HrmsEmployee.findByPk(employeeId, {
        include: [
            {
                model: HrmsTemplateResponse,
                as: 'templateResponses',
                include: [
                    {
                        model: HrmsFormMaster,
                        as: 'template',
                        where: { slug: 'employee_template' }
                    }
                ]
            }
        ]
    });

    if (!employee) {
        throw new Error('Employee not found');
    }

    // Merge direct fields with custom fields
    const completeData = {
        ...employee.toJSON(),
        ...employee.templateResponses[0]?.response_data
    };

    return completeData;
};
```

## Customization

### Adding Company-Specific Fields

To add custom fields for a specific company:

```sql
-- 1. Get the template and section IDs
SELECT id FROM hrms_form_masters WHERE slug = 'employee_template';
SELECT id FROM hrms_template_sections WHERE template_id = [template_id] AND section_name = 'Additional Information';

-- 2. Insert new field
INSERT INTO hrms_template_fields (
    template_id,
    section_id,
    field_name,
    field_label,
    field_type,
    data_type,
    is_required,
    is_direct_field,
    display_order,
    field_width,
    placeholder,
    help_text,
    is_active,
    created_at,
    updated_at
) VALUES (
    [template_id],
    [section_id],
    'custom_field_name',
    'Custom Field Label',
    'text',
    'string',
    0,
    0,  -- Custom field (stored in template_responses)
    100,  -- Display at end
    'half',
    'Enter value...',
    'Optional field for company-specific data',
    1,
    NOW(),
    NOW()
);
```

### Making Fields Optional/Required

```sql
-- Make a field optional
UPDATE hrms_template_fields
SET is_required = 0
WHERE field_name = 'middle_name'
AND template_id = (SELECT id FROM hrms_form_masters WHERE slug = 'employee_template');

-- Make a field required
UPDATE hrms_template_fields
SET is_required = 1
WHERE field_name = 'blood_group'
AND template_id = (SELECT id FROM hrms_form_masters WHERE slug = 'employee_template');
```

### Changing Field Order

```sql
-- Reorder fields in a section
UPDATE hrms_template_fields
SET display_order = 5
WHERE field_name = 'gender'
AND template_id = (SELECT id FROM hrms_form_masters WHERE slug = 'employee_template');
```

### Hiding Fields

```sql
-- Deactivate a field (won't show in form)
UPDATE hrms_template_fields
SET is_active = 0
WHERE field_name = 'hobbies'
AND template_id = (SELECT id FROM hrms_form_masters WHERE slug = 'employee_template');
```

## File Upload Handling

### Allowed File Types and Sizes
```javascript
const fileFieldConfig = {
    profile_picture: {
        allowed: ['jpg', 'jpeg', 'png'],
        maxSize: 5 * 1024 * 1024  // 5MB
    },
    resume_cv: {
        allowed: ['pdf', 'doc', 'docx'],
        maxSize: 5 * 1024 * 1024  // 5MB
    },
    educational_certificates: {
        allowed: ['pdf', 'jpg', 'jpeg', 'png'],
        maxSize: 10 * 1024 * 1024  // 10MB
    },
    experience_letters: {
        allowed: ['pdf', 'doc', 'docx'],
        maxSize: 10 * 1024 * 1024  // 10MB
    }
};
```

### File Storage Recommendations
```javascript
// Example using multer for file uploads
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/employees');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },  // 10MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});
```

## Master Data Dependencies

The form references the following master tables:

```sql
-- Departments (hrms_company_departments)
SELECT department_id, department_name
FROM hrms_company_departments
WHERE company_id = ? AND is_active = 1;

-- Designations (hrms_designations)
SELECT id, designation_name
FROM hrms_designations
WHERE company_id = ? AND is_active = 1;

-- Reporting Managers (hrms_employees)
SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) as name
FROM hrms_employees e
WHERE e.company_id = ? AND e.status = 'Active'
AND e.id != ?  -- Exclude current employee
ORDER BY e.first_name;
```

## Frontend Integration Example

### Dynamic Form Rendering (React/Angular)
```javascript
// Fetch form structure
const formStructure = await api.get('/api/forms/employee_template');

// Render dynamically
formStructure.sections.map(section => (
    <div key={section.id} className="form-section">
        <h3>{section.section_name}</h3>
        <div className="form-fields">
            {section.fields.map(field => (
                <FormField
                    key={field.id}
                    type={field.field_type}
                    name={field.field_name}
                    label={field.field_label}
                    required={field.is_required}
                    width={field.field_width}
                    placeholder={field.placeholder}
                    helpText={field.help_text}
                    validation={field.validation_rules}
                    options={field.field_options}
                />
            ))}
        </div>
    </div>
));
```

## Testing

### Verify Seeder Installation
```sql
-- Check template
SELECT * FROM hrms_form_masters WHERE slug = 'employee_template';

-- Check sections
SELECT s.id, s.section_name, COUNT(f.id) as field_count
FROM hrms_template_sections s
LEFT JOIN hrms_template_fields f ON s.id = f.section_id
WHERE s.template_id = (SELECT id FROM hrms_form_masters WHERE slug = 'employee_template')
GROUP BY s.id, s.section_name
ORDER BY s.display_order;

-- Check total fields
SELECT COUNT(*) as total_fields
FROM hrms_template_fields
WHERE template_id = (SELECT id FROM hrms_form_masters WHERE slug = 'employee_template');

-- Check direct vs custom fields
SELECT
    is_direct_field,
    COUNT(*) as count
FROM hrms_template_fields
WHERE template_id = (SELECT id FROM hrms_form_masters WHERE slug = 'employee_template')
GROUP BY is_direct_field;
```

### Expected Results
```
✓ 1 template (employee_template)
✓ 8 sections (Personal, Contact, Address, Employment, Emergency, Bank, Documents, Additional)
✓ 71 total fields
✓ 16 direct fields (is_direct_field = 1)
✓ 55 custom fields (is_direct_field = 0)
```

## Performance Considerations

1. **Direct Fields**: Frequently used fields are stored directly in `hrms_employees` for optimal query performance
2. **Indexed Fields**: `employee_code`, `email`, `phone`, `department_id`, `designation_id` are indexed
3. **Custom Fields**: Less frequently accessed fields stored as JSON in `hrms_template_responses`
4. **Lazy Loading**: Load custom fields only when needed for individual employee view

## Security Best Practices

1. **File Uploads**: Always validate file types and sizes server-side
2. **PAN/Aadhaar**: Encrypt sensitive fields before storage
3. **Access Control**: Restrict access to salary, bank details to authorized roles only
4. **Audit Trail**: Use `created_by`, `updated_by`, `created_at`, `updated_at` for tracking
5. **Soft Deletes**: Use `deleted_at` instead of hard deletes

## Notes

1. **Required Fields**: 26 fields marked as required (*)
2. **File Uploads**: 4 file upload fields with size/type restrictions
3. **Master Selects**: 4 fields pull data from master tables
4. **Validation**: Comprehensive regex patterns for phone, PAN, IFSC, Aadhaar, pincode
5. **Flexibility**: Easy to add/remove fields without schema changes
6. **Localization**: Field labels can be translated for multi-language support

## Troubleshooting

### Form Not Loading
```
Error: Template not found
```
**Solution**: Run the employee_form_seed.sql script

### Fields Not Showing
```sql
-- Check if fields are active
SELECT field_name, is_active
FROM hrms_template_fields
WHERE template_id = (SELECT id FROM hrms_form_masters WHERE slug = 'employee_template');
```

### Validation Errors
```
Error: Invalid phone number
```
**Solution**: Ensure phone number matches regex pattern `^[6-9][0-9]{9}$`

## Support

For issues or questions:
1. Check the form models: `HrmsFormMaster.js`, `HrmsTemplateSection.js`, `HrmsTemplateField.js`, `HrmsTemplateResponse.js`
2. Verify employee model: `HrmsEmployee.js`
3. Check database indexes and constraints
4. Review validation rules in the fields table

---

**Created**: 2025-01-11
**Version**: 1.0
**Total Fields**: 71 (16 direct + 55 custom)
**Total Sections**: 8
