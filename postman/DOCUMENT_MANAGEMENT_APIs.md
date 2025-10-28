# Document Management APIs

## Base URL
```
http://localhost:3000/api
```

## Authentication
All APIs require Bearer token in Authorization header:
```
Authorization: Bearer {{auth_token}}
```

---

## 1. Folder Management

### 1.1 Create Folder
**POST** `/documents/folders`

```json
{
    "folder_name": "Custom Folder",
    "folder_description": "My custom folder description",
    "display_order": 10,
    "is_system_folder": false
}
```

### 1.2 Get All Folders
**GET** `/documents/folders`

Returns all folders for the authenticated user's company.

### 1.3 Get Folder by ID
**GET** `/documents/folders/:folder_id`

### 1.4 Update Folder
**PUT** `/documents/folders/:folder_id`

```json
{
    "folder_name": "Updated Folder Name",
    "folder_description": "Updated description",
    "display_order": 5
}
```

### 1.5 Delete Folder
**DELETE** `/documents/folders/:folder_id`

Note: Cannot delete system folders (`is_system_folder = true`)

---

## 2. Document Types

### 2.1 Create Document Type
**POST** `/documents/types`

```json
{
    "folder_id": 1,
    "document_type_code": "CUSTOM_DOC",
    "document_type_name": "Custom Document",
    "document_description": "Custom document type description",
    "allow_single_document": true,
    "allow_multiple_documents": false,
    "is_mandatory": false,
    "allow_not_applicable": true,
    "require_expiry_date": false,
    "allowed_file_types": "pdf,jpg,jpeg,png",
    "max_file_size_mb": 5.00,
    "display_order": 10
}
```

### 2.2 Get Document Types by Folder
**GET** `/documents/types/folder/:folder_id`

### 2.3 Get Document Type by ID
**GET** `/documents/types/:type_id`

### 2.4 Update Document Type
**PUT** `/documents/types/:type_id`

```json
{
    "document_type_name": "Updated Document Type",
    "document_description": "Updated description",
    "is_mandatory": true,
    "max_file_size_mb": 10.00
}
```

### 2.5 Delete Document Type
**DELETE** `/documents/types/:type_id`

Note: Cannot delete system document types (`is_system_type = true`)

---

## 3. Employee Documents

### 3.1 Upload Document
**POST** `/documents/upload`

**Content-Type:** `multipart/form-data`

Form data fields:
- `file` (file) - The document file to upload
- `employee_id` (number) - Employee ID
- `folder_id` (number) - Folder ID
- `document_type_id` (number) - Document Type ID
- `document_title` (string) - Document title
- `document_description` (string, optional) - Document description
- `issue_date` (date, optional) - Issue date (YYYY-MM-DD)
- `expiry_date` (date, optional) - Expiry date (YYYY-MM-DD)
- `letter_id` (number, optional) - Reference to generated letter if applicable

**Response:**
```json
{
    "success": true,
    "message": "Document uploaded successfully",
    "data": {
        "id": 1,
        "employee_id": 1,
        "folder_id": 1,
        "document_type_id": 1,
        "file_name": "aadhaar_card.pdf",
        "file_path": "s3://bucket/path/to/file.pdf",
        "file_size_kb": 245.67,
        "letter_id": null,
        "created_at": "2025-10-28T18:10:05.000Z"
    }
}
```

### 3.2 Get Employee Documents
**GET** `/documents/employee/:employee_id`

Query parameters (optional):
- `folder_id` - Filter by folder
- `document_type_id` - Filter by document type

### 3.3 Get Document by ID
**GET** `/documents/:document_id`

### 3.4 Update Document
**PUT** `/documents/:document_id`

```json
{
    "document_title": "Updated Title",
    "document_description": "Updated description",
    "issue_date": "2021-01-15",
    "expiry_date": "2031-01-15"
}
```

Note: This only updates document metadata, not the file itself.

### 3.5 Delete Document
**DELETE** `/documents/:document_id`

Performs soft delete (`is_active = false`)

### 3.6 Mark Document as N/A
**POST** `/documents/mark-na`

```json
{
    "employee_id": 1,
    "document_type_id": 3,
    "not_applicable_reason": "Don't have a passport"
}
```

Use this when an employee doesn't have a particular document.

### 3.7 Download Document
**GET** `/documents/:document_id/download`

Returns the document file from S3 with proper content-type headers.

---

## 4. Folder Permissions

### 4.1 Get Folder Permissions
**GET** `/documents/folders/:folder_id/permissions`

### 4.2 Update Folder Permissions
**PUT** `/documents/folders/:folder_id/permissions`

```json
{
    "permissions": [
        {
            "role_type": "employee",
            "can_view": true,
            "can_add": true,
            "can_update": false,
            "can_delete": false
        },
        {
            "role_type": "reporting_manager",
            "can_view": true,
            "can_add": true,
            "can_update": true,
            "can_delete": false
        },
        {
            "role_type": "hr",
            "can_view": true,
            "can_add": true,
            "can_update": true,
            "can_delete": true
        },
        {
            "role_type": "admin",
            "can_view": true,
            "can_add": true,
            "can_update": true,
            "can_delete": true
        }
    ]
}
```

**Role Types:**
- `employee`
- `reporting_manager`
- `rm_of_rm`
- `department_head`
- `hr`
- `admin`
- `custom_role` (with `custom_role_id`)

---

## 5. Seeder APIs (One-time)

### 5.1 Check if Structure Exists
**GET** `/documents/check-structure/:company_id`

**Response:**
```json
{
    "success": true,
    "company_id": 8,
    "structure_exists": false
}
```

### 5.2 Seed Document Structure (Single Company)
**POST** `/documents/seed-structure`

```json
{
    "company_id": 8
}
```

Creates default document structure:
- 8 Folders
- 29 Document Types
- 32 Permission Rules

### 5.3 Seed Document Structure (Bulk)
**POST** `/documents/seed-structure-bulk`

```json
{
    "company_ids": [8, 9, 10, 11]
}
```

**Response:**
```json
{
    "success": true,
    "message": "Processed 4 companies",
    "summary": {
        "total": 4,
        "successful": 4,
        "failed": 0
    },
    "results": [...],
    "errors": []
}
```

---

## Default Document Structure

When seeder runs, it creates:

### Folders:
1. **Employee Documents** (System)
   - Aadhaar Card (Mandatory)
   - PAN Card (Mandatory)
   - Passport (Optional, Expiry tracking)
   - Driving License (Optional, Expiry tracking)
   - Educational Certificates (Multiple)
   - Experience Letters (Multiple)
   - Bank Details (Mandatory)
   - Address Proof (Mandatory)

2. **Employment Letters** (System)
   - Offer Letter
   - Appointment Letter
   - Confirmation Letter
   - Increment Letter (Multiple)
   - Promotion Letter (Multiple)
   - Transfer Letter (Multiple)

3. **Payroll Documents** (System)
   - Salary Slip (Multiple)
   - Form 16 (Multiple)
   - Investment Declaration (Multiple)
   - Reimbursement Bills (Multiple)

4. **Leave Documents** (System)
   - Leave Application (Multiple)
   - Medical Certificate (Multiple)

5. **Performance Documents** (System)
   - Appraisal Letter (Multiple)
   - Performance Review (Multiple)

6. **Exit Documents** (System)
   - Resignation Letter
   - Relieving Letter
   - Experience Certificate
   - FNF Settlement

7. **Company Policies** (System)
   - Employee Handbook
   - Policy Documents (Multiple)

8. **Miscellaneous** (Regular)
   - Other Documents (Multiple)

---

## Important Notes

1. **letter_id Field**: New optional field in `hrms_employee_documents` table
   - Used when document is generated from a letter template
   - Links document to the letter generation system

2. **System Folders/Types**: Cannot be deleted
   - `is_system_folder = true` → Cannot delete folder
   - `is_system_type = true` → Cannot delete document type

3. **File Storage**: Files are stored in S3
   - Path saved in `file_path` column
   - Use download API to retrieve files

4. **Permissions**: Role-based access control
   - Employee: View + Add only
   - Manager: View + Add + Update
   - HR/Admin: Full access

5. **Document Types**:
   - `allow_single_document`: Only one document allowed per employee
   - `allow_multiple_documents`: Multiple documents allowed
   - `is_mandatory`: Employee must upload this document
   - `allow_not_applicable`: Employee can mark as N/A
   - `require_expiry_date`: System tracks expiry and sends reminders

---

## Testing with cURL

### Upload Document:
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "employee_id=1" \
  -F "folder_id=1" \
  -F "document_type_id=1" \
  -F "document_title=My Aadhaar Card"
```

### Get Employee Documents:
```bash
curl -X GET "http://localhost:3000/api/documents/employee/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Seed Structure:
```bash
curl -X POST http://localhost:3000/api/documents/seed-structure \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_id": 8}'
```
