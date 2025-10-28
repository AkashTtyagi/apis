# Letter Template Management APIs

## Base URL
```
http://localhost:3000/api/letters
```

## Authentication
All APIs require Bearer token in Authorization header:
```
Authorization: Bearer {{auth_token}}
```

---

## 1. Letter Template Management

### 1.1 Create Letter Template
**POST** `/templates`

```json
{
    "letter_name": "Appointment Letter",
    "letter_code": "APPOINT_001",
    "letter_description": "Standard appointment letter template",
    "category_id": 1,

    // Page Setup
    "page_size": "A4",
    "orientation": "portrait",

    // Margins
    "has_page_margin": true,
    "margin_top": 2.5,
    "margin_left": 2.0,
    "margin_right": 2.0,
    "margin_bottom": 2.5,

    // Border
    "has_border": true,
    "border_size": "1px",
    "border_margin_top": 0.5,
    "border_margin_left": 0.5,

    // Page Number
    "has_page_number": true,
    "page_number_position": "footer",
    "page_number_alignment": "center",
    "page_number_format": "Page {current} of {total}",

    // Header & Footer
    "has_header": true,
    "header_content": "<div>Company Logo and Address</div>",
    "header_height": 3.0,

    "has_footer": true,
    "footer_content": "<div>Company Footer</div>",
    "footer_height": 2.0,

    // Main Content (with slugs)
    "main_content": "<p>Dear {{FIRST_NAME}} {{LAST_NAME}},</p><p>Your employee code is {{EMPLOYEE_CODE}}.</p><p>Reference Number: {{REFERENCE_NUMBER}}</p>",

    // Letter Numbering
    "auto_generate_letter_number": true,
    "letter_number_prefix": "APT",
    "letter_number_format": "{PREFIX}/{YEAR}/{MONTH}/{SEQ}",

    // Watermark
    "has_watermark": true,
    "watermark_text": "CONFIDENTIAL",
    "watermark_opacity": 0.10,

    // Digital Signature
    "requires_signature": true,
    "signature_position": "right",
    "signatory_name": "John Doe",
    "signatory_designation": "HR Manager",
    "signature_image_path": "s3://bucket/signatures/hr_manager.png",

    // Approval Workflow
    "requires_approval": true,
    "approval_workflow_id": 21,

    // Custom Fields
    "custom_fields": [
        {
            "field_name": "Reference Number",
            "field_slug": "REFERENCE_NUMBER",
            "field_type": "text",
            "is_required": true,
            "placeholder": "Enter reference number",
            "display_order": 1
        },
        {
            "field_name": "Department",
            "field_slug": "DEPARTMENT",
            "field_type": "select",
            "field_options": "[\"IT\", \"HR\", \"Finance\"]",
            "is_required": true,
            "display_order": 2
        }
    ]
}
```

### 1.2 Update Letter Template
**PUT** `/templates/:template_id`

Same structure as create, all fields optional.

### 1.3 Get All Letter Templates
**GET** `/templates`

Query parameters:
- `category_id` - Filter by category
- `is_active` - Filter by active status
- `is_draft` - Filter by draft status
- `search` - Search by name/code

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "letter_name": "Appointment Letter",
            "letter_code": "APPOINT_001",
            "category": {
                "id": 1,
                "category_name": "Appointment Letters"
            },
            "custom_fields": [...],
            "is_active": true,
            "is_draft": false,
            "created_at": "2025-10-28T10:00:00.000Z"
        }
    ]
}
```

### 1.4 Get Letter Template by ID
**GET** `/templates/:template_id`

### 1.5 Delete Letter Template
**DELETE** `/templates/:template_id`

---

## 2. Letter Generation

### 2.1 Generate Letter for Employee
**POST** `/generate`

```json
{
    "letter_template_id": 1,
    "employee_id": 123,
    "folder_id": 2,
    "document_type_id": 5,
    "document_title": "Appointment Letter - John Doe",

    // Custom field values
    "custom_field_values": [
        {
            "custom_field_id": 1,
            "field_value": "REF-2025-001"
        },
        {
            "custom_field_id": 2,
            "field_value": "IT"
        }
    ],

    // Optional fields
    "issue_date": "2025-10-28",
    "expiry_date": null
}
```

**Response:**
```json
{
    "success": true,
    "message": "Letter generated successfully",
    "data": {
        "employee_document_id": 456,
        "letter_template_id": 1,
        "employee_id": 123,
        "folder_id": 2,
        "document_type_id": 5,
        "status": "pending_approval",  // or "approved" if no workflow
        "workflow_request_id": 789,  // if approval required
        "letter_id": 1,
        "custom_field_values": [...]
    },
    "approval_required": true,
    "workflow_details": {
        "workflow_id": 21,
        "workflow_name": "Letter Sending Approval"
    }
}
```

**Logic:**
1. Check if `template.requires_approval` is true
2. If yes, check if workflow config exists for this company
3. Create `hrms_employee_documents` record with `status = 'pending_approval'`
4. Create `HrmsWorkflowRequest` record
5. Store custom field values in `hrms_letter_custom_field_values`
6. If no approval required, set `status = 'approved'` and `workflow_request_id = NULL`

### 2.2 Preview Letter Before Generation
**POST** `/preview`

```json
{
    "letter_template_id": 1,
    "employee_id": 123,
    "custom_field_values": [
        {
            "custom_field_id": 1,
            "field_value": "REF-2025-001"
        }
    ]
}
```

**Response:**
Returns HTML with all slugs replaced.

---

## 3. Employee Letters

### 3.1 Get Letters Sent to Employee
**GET** `/employee/:employee_id/letters`

Query parameters:
- `folder_id` - Filter by folder
- `document_type_id` - Filter by document type
- `status` - Filter by status (draft, pending_approval, approved, rejected)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 456,
            "document_title": "Appointment Letter - John Doe",
            "letter_template": {
                "id": 1,
                "letter_name": "Appointment Letter",
                "category": {...}
            },
            "folder": {...},
            "document_type": {...},
            "status": "approved",
            "workflow_request": {
                "id": 789,
                "current_status": "approved",
                "approved_by": "Jane Smith",
                "approved_at": "2025-10-28T11:00:00.000Z"
            },
            "custom_field_values": [...],
            "created_at": "2025-10-28T10:00:00.000Z"
        }
    ]
}
```

### 3.2 Get Letter Details by Document ID
**GET** `/letters/:employee_document_id`

Returns complete letter details with:
- Template information
- Custom field values
- Workflow status
- Employee details

---

## 4. Email Sending

### 4.1 Send Letter via Email
**POST** `/send-email`

```json
{
    "employee_document_id": 456,
    "email_template_id": 10,
    "recipients": [
        {
            "employee_id": 123,
            "recipient_type": "to"
        }
    ],
    "email_cc": ["hr@company.com"],
    "email_bcc": ["admin@company.com"],
    "email_subject": "Your Appointment Letter",
    "preview": false  // Set true to preview without sending
}
```

**Response (Preview = true):**
```json
{
    "success": true,
    "preview": true,
    "email_html": "<html>...</html>",
    "email_subject": "Your Appointment Letter",
    "recipients": ["john.doe@company.com"],
    "cc": ["hr@company.com"],
    "bcc": ["admin@company.com"],
    "attachments": [
        {
            "filename": "appointment_letter.pdf",
            "size_kb": 245.67
        }
    ]
}
```

**Response (Preview = false):**
```json
{
    "success": true,
    "message": "Email sent successfully",
    "data": {
        "email_sent": true,
        "email_sent_at": "2025-10-28T12:00:00.000Z",
        "recipients_count": 1,
        "recipients": [
            {
                "employee_id": 123,
                "email": "john.doe@company.com",
                "status": "sent"
            }
        ]
    }
}
```

**Logic:**
1. Fetch letter template and employee document
2. Generate PDF from template with replaced slugs
3. Fetch email template
4. Replace email template slugs
5. If preview=true, return HTML without sending
6. If preview=false, send email with PDF attachment
7. Update `hrms_employee_documents` with email details
8. Create records in `hrms_letter_recipients`

---

## 5. Approval Workflow Check

### 5.1 Check if Approval Required
**GET** `/check-approval/:letter_template_id/:employee_id`

**Response:**
```json
{
    "success": true,
    "approval_required": true,
    "workflow_details": {
        "workflow_id": 21,
        "workflow_code": "LETTER_SENDING",
        "workflow_name": "Letter Sending Approval",
        "workflow_config_id": 156,
        "steps": [
            {
                "step_number": 1,
                "approver_type": "reporting_manager",
                "approver_name": "Jane Smith"
            },
            {
                "step_number": 2,
                "approver_type": "hr",
                "approver_name": "HR Department"
            }
        ]
    }
}
```

**Logic:**
1. Get `letter_template.requires_approval`
2. If false, return `approval_required: false`
3. If true, get `letter_template.approval_workflow_id`
4. Find active workflow config for this company and workflow_master_id
5. Return workflow details with steps

---

## 6. Letter Categories

### 6.1 Get All Categories
**GET** `/categories`

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "category_name": "Appointment Letters",
            "category_code": "APPOINTMENT",
            "category_description": "Employee appointment and offer letters",
            "display_order": 1,
            "templates_count": 5
        }
    ]
}
```

---

## 7. Download Letter PDF

### 7.1 Download Generated Letter
**GET** `/download/:employee_document_id`

Returns PDF file with proper headers.

**Logic:**
1. Fetch employee document with letter_id
2. Fetch letter template
3. Fetch custom field values
4. Replace all slugs (system + custom fields)
5. Generate PDF using puppeteer/wkhtmltopdf
6. Return PDF stream

---

## Important Notes

1. **Approval Workflow Integration:**
   - If `requires_approval = true`, letter goes through workflow
   - Document status: `draft` → `pending_approval` → `approved`/`rejected`
   - `workflow_request_id` links to workflow system

2. **System Slugs (Auto-replaced from employee data):**
   - `{{FIRST_NAME}}`, `{{LAST_NAME}}`, `{{EMPLOYEE_CODE}}`
   - `{{EMAIL}}`, `{{PHONE}}`, `{{DEPARTMENT}}`
   - `{{DESIGNATION}}`, `{{DATE_OF_JOINING}}`
   - And all other employee form fields

3. **Custom Field Slugs:**
   - Admin defines custom fields in template
   - Admin fills values during letter generation
   - Stored in `hrms_letter_custom_field_values`

4. **PDF Generation:**
   - Generated on-the-fly when downloading
   - Not stored permanently (saves storage)
   - Uses template + employee data + custom field values

5. **Email Sending:**
   - Requires email template selection
   - Supports preview before sending
   - PDF attached automatically
   - Tracks sent status in `hrms_letter_recipients`
