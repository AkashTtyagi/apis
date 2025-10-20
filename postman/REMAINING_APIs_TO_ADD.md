# HRMS API Documentation - All APIs Added ✅

## Status: ✅ COMPLETE
✅ **All APIs have been added to the complete Postman collection!**

**File to use**: `HRMS_Complete_Collection.postman_collection.json`

### What's Included:
- ✅ Roster Management (Section 13)
- ✅ Rotating Shift (Section 14)
- ✅ Shift Swap (Section 15)
- ✅ Attendance Requests Employee (Section 16)
- ✅ Attendance Requests Admin (Section 17)
- ✅ Company Management (Section 18)
- ✅ Designation Management (Section 19)
- ✅ Grade Management (Section 20)
- ✅ Level Management (Section 21)
- ✅ Holiday Management (Section 22)
- ✅ Workflow Management (Section 23)

---

## Quick Import Instructions
1. Open Postman
2. Click **Import** button
3. Select `HRMS_Complete_Collection.postman_collection.json`
4. Click **Import**
5. ✅ Done! All 23 sections with 100+ endpoints are ready to use

**Note**: You no longer need to manually add sections - everything is in one file!

---

## 17. Company Management

### Update Company Details
```
POST {{base_url}}/company/update-company-details
Authorization: Bearer {{auth_token}}
Body:
{
  "registered_address": "123 Main Street",
  "pin_code": "110001",
  "state_id": 12,
  "city_id": 345,
  "phone_number": "+91-11-12345678",
  "contact_person_id": 5,
  "timezone_id": 15,
  "currency_id": 4
}
```

### Get Company Details
```
POST {{base_url}}/company/details
Authorization: Bearer {{auth_token}}
Body: {}
```

---

## 18. Designation Management

### Create Designation
```
POST {{base_url}}/designations/create
Authorization: Bearer {{auth_token}}
Body:
{
  "designation_name": "Senior Software Engineer",
  "description": "Senior development role"
}
```

### Update Designation
```
POST {{base_url}}/designations/update
Authorization: Bearer {{auth_token}}
Body:
{
  "designation_id": 1,
  "designation_name": "Lead Software Engineer",
  "description": "Updated description"
}
```

### List Designations
```
POST {{base_url}}/designations/list
Authorization: Bearer {{auth_token}}
Body: {}
```

---

## 19. Grade Management

### Create Grade
```
POST {{base_url}}/grades/create
Authorization: Bearer {{auth_token}}
Body:
{
  "grade_name": "Grade A",
  "description": "Top grade for senior employees"
}
```

### Update Grade
```
POST {{base_url}}/grades/update
Authorization: Bearer {{auth_token}}
Body:
{
  "grade_id": 1,
  "grade_name": "Grade A+",
  "description": "Updated description"
}
```

### List Grades
```
POST {{base_url}}/grades/list
Authorization: Bearer {{auth_token}}
Body: {}
```

---

## 20. Level Management

### Create Level
```
POST {{base_url}}/levels/create
Authorization: Bearer {{auth_token}}
Body:
{
  "level_name": "L1",
  "description": "Entry level"
}
```

### Update Level
```
POST {{base_url}}/levels/update
Authorization: Bearer {{auth_token}}
Body:
{
  "level_id": 1,
  "level_name": "L1A",
  "description": "Updated entry level"
}
```

### List Levels
```
POST {{base_url}}/levels/list
Authorization: Bearer {{auth_token}}
Body: {}
```

---

## 21. Holiday Management - Bank

### Get All Holidays
```
GET {{base_url}}/holiday/bank?year=2024&is_national_holiday=true
Authorization: Bearer {{auth_token}}
```

### Get Holiday by ID
```
GET {{base_url}}/holiday/bank/1
Authorization: Bearer {{auth_token}}
```

### Create Holiday
```
POST {{base_url}}/holiday/bank
Authorization: Bearer {{auth_token}}
Body:
{
  "holiday_name": "Republic Day",
  "holiday_date": "2024-01-26",
  "is_national_holiday": true,
  "description": "National holiday"
}
```

### Bulk Create Holidays
```
POST {{base_url}}/holiday/bank/bulk
Authorization: Bearer {{auth_token}}
Body:
{
  "holidays": [
    {
      "holiday_name": "Holi",
      "holiday_date": "2024-03-25",
      "is_national_holiday": true,
      "description": "Festival of colors"
    },
    {
      "holiday_name": "Diwali",
      "holiday_date": "2024-11-01",
      "is_national_holiday": true,
      "description": "Festival of lights"
    }
  ]
}
```

### Update Holiday
```
PUT {{base_url}}/holiday/bank/1
Authorization: Bearer {{auth_token}}
Body:
{
  "holiday_name": "Republic Day",
  "holiday_date": "2024-01-26",
  "is_national_holiday": true,
  "description": "Updated description"
}
```

### Delete Holiday
```
DELETE {{base_url}}/holiday/bank/1
Authorization: Bearer {{auth_token}}
```

---

## 22. Holiday Management - Policy

### Get All Policies
```
GET {{base_url}}/holiday/policy?year=2024
Authorization: Bearer {{auth_token}}
```

### Get Policy by ID
```
GET {{base_url}}/holiday/policy/1
Authorization: Bearer {{auth_token}}
```

### Create Holiday Policy
```
POST {{base_url}}/holiday/policy
Authorization: Bearer {{auth_token}}
Body:
{
  "company_id": 1,
  "calendar_name": "2024 Corporate Calendar",
  "year": 2024,
  "is_restricted_holiday_applicable": true,
  "restricted_holiday_count": 3,
  "notes": "Standard corporate calendar",
  "holiday_ids": [1, 2, 3],
  "applicability": [
    {
      "applicability_type": "department",
      "applicability_value": 1,
      "is_excluded": false,
      "priority": 1
    }
  ]
}
```

### Update Holiday Policy
```
PUT {{base_url}}/holiday/policy/1
Authorization: Bearer {{auth_token}}
Body:
{
  "calendar_name": "Updated 2024 Calendar",
  "is_restricted_holiday_applicable": false,
  "notes": "Updated notes"
}
```

### Delete Holiday Policy
```
DELETE {{base_url}}/holiday/policy/1
Authorization: Bearer {{auth_token}}
```

### Add Holidays to Policy
```
POST {{base_url}}/holiday/policy/1/holidays
Authorization: Bearer {{auth_token}}
Body:
{
  "holiday_ids": [4, 5, 6]
}
```

### Remove Holiday from Policy
```
DELETE {{base_url}}/holiday/policy/1/holidays/4
Authorization: Bearer {{auth_token}}
```

---

## 23. Workflow Management - User Requests

### Submit Workflow Request
```
POST {{base_url}}/workflows/requests/submit
Authorization: Bearer {{auth_token}}
Body:
{
  "workflow_master_id": 1,
  "request_data": {
    "amount": 5000,
    "purpose": "Travel"
  },
  "employee_id": 123
}
```

### Get My Requests
```
GET {{base_url}}/workflows/requests/my-requests?status=pending&page=1&limit=20
Authorization: Bearer {{auth_token}}
```

### Get Pending Approvals
```
GET {{base_url}}/workflows/requests/pending-approvals?page=1&limit=20
Authorization: Bearer {{auth_token}}
```

### Get Dashboard
```
GET {{base_url}}/workflows/requests/dashboard
Authorization: Bearer {{auth_token}}
```

### Get Request Details
```
GET {{base_url}}/workflows/requests/1
Authorization: Bearer {{auth_token}}
```

### Approve Request
```
POST {{base_url}}/workflows/requests/1/approve
Authorization: Bearer {{auth_token}}
Body:
{
  "remarks": "Approved",
  "attachments": []
}
```

### Reject Request
```
POST {{base_url}}/workflows/requests/1/reject
Authorization: Bearer {{auth_token}}
Body:
{
  "remarks": "Budget exceeded",
  "attachments": []
}
```

### Withdraw Request
```
POST {{base_url}}/workflows/requests/1/withdraw
Authorization: Bearer {{auth_token}}
Body:
{
  "reason": "No longer needed"
}
```

### Get Request History
```
GET {{base_url}}/workflows/requests/1/history
Authorization: Bearer {{auth_token}}
```

---

## 24. Workflow Management - Admin Configuration

### Get Workflow Masters
```
GET {{base_url}}/workflows/admin/masters?is_active=true
Authorization: Bearer {{auth_token}}
```

### Create Workflow Config
```
POST {{base_url}}/workflows/admin/configs
Authorization: Bearer {{auth_token}}
Body:
{
  "company_id": 1,
  "workflow_master_id": 1,
  "workflow_name": "Travel Approval",
  "description": "Multi-stage travel approval",
  "stages": [],
  "conditions": [],
  "applicability": [],
  "is_active": true
}
```

### Get All Configs
```
GET {{base_url}}/workflows/admin/configs?company_id=1&is_active=true
Authorization: Bearer {{auth_token}}
```

### Get Config by ID
```
GET {{base_url}}/workflows/admin/configs/1
Authorization: Bearer {{auth_token}}
```

### Update Config
```
PUT {{base_url}}/workflows/admin/configs/1
Authorization: Bearer {{auth_token}}
Body:
{
  "workflow_name": "Updated Travel Approval",
  "description": "Updated description",
  "is_active": true
}
```

### Delete Config
```
DELETE {{base_url}}/workflows/admin/configs/1
Authorization: Bearer {{auth_token}}
```

### Clone Config
```
POST {{base_url}}/workflows/admin/configs/1/clone
Authorization: Bearer {{auth_token}}
Body:
{
  "company_id": 1,
  "workflow_name": "Cloned Travel Approval",
  "cloneApplicability": true
}
```

---

## 25. Workflow Management - Stage Management

### Create Stage
```
POST {{base_url}}/workflows/admin/configs/1/stages
Authorization: Bearer {{auth_token}}
Body:
{
  "stage_name": "Manager Approval",
  "stage_order": 1,
  "stage_type": "approval",
  "approver_logic": "any",
  "approvers": [],
  "sla_days": 2
}
```

### Update Stage
```
PUT {{base_url}}/workflows/admin/stages/1
Authorization: Bearer {{auth_token}}
Body:
{
  "stage_name": "Updated Manager Approval",
  "stage_order": 1,
  "sla_days": 3
}
```

### Delete Stage
```
DELETE {{base_url}}/workflows/admin/stages/1
Authorization: Bearer {{auth_token}}
```

---

## 26. Workflow Management - Approver Management

### Create Stage Approver
```
POST {{base_url}}/workflows/admin/stages/1/approvers
Authorization: Bearer {{auth_token}}
Body:
{
  "approver_type": "reporting_manager",
  "custom_user_id": null,
  "approver_order": 1,
  "has_condition": false,
  "condition_id": null
}
```

### Update Approver
```
PUT {{base_url}}/workflows/admin/approvers/1
Authorization: Bearer {{auth_token}}
Body:
{
  "approver_type": "custom_user",
  "custom_user_id": 456,
  "approver_order": 2
}
```

### Delete Approver
```
DELETE {{base_url}}/workflows/admin/approvers/1
Authorization: Bearer {{auth_token}}
```

---

## 27. Workflow Management - Condition Management

### Create Condition
```
POST {{base_url}}/workflows/admin/configs/1/conditions
Authorization: Bearer {{auth_token}}
Body:
{
  "condition_name": "High Value Check",
  "condition_type": "pre_approval",
  "logic_operator": "AND",
  "action_type": "add_stage",
  "rules": []
}
```

### Update Condition
```
PUT {{base_url}}/workflows/admin/conditions/1
Authorization: Bearer {{auth_token}}
Body:
{
  "condition_name": "Updated High Value Check",
  "logic_operator": "OR",
  "action_type": "skip_stage"
}
```

### Delete Condition
```
DELETE {{base_url}}/workflows/admin/conditions/1
Authorization: Bearer {{auth_token}}
```

### Create Condition Rule
```
POST {{base_url}}/workflows/admin/conditions/1/rules
Authorization: Bearer {{auth_token}}
Body:
{
  "field_source": "request_data",
  "field_name": "amount",
  "operator": ">",
  "compare_value": "10000",
  "compare_value_type": "static"
}
```

### Delete Rule
```
DELETE {{base_url}}/workflows/admin/rules/1
Authorization: Bearer {{auth_token}}
```

---

## 28. Workflow Management - Applicability

### Create Applicability Rule
```
POST {{base_url}}/workflows/admin/configs/1/applicability
Authorization: Bearer {{auth_token}}
Body:
{
  "applicability_type": "department",
  "company_id": 1,
  "entity_id": null,
  "department_id": 5,
  "designation_id": null,
  "is_excluded": false,
  "priority": 1
}
```

### Delete Applicability Rule
```
DELETE {{base_url}}/workflows/admin/applicability/1
Authorization: Bearer {{auth_token}}
```

---

## 29. Workflow Management - Version Control

### Get Version History
```
GET {{base_url}}/workflows/admin/configs/1/versions
Authorization: Bearer {{auth_token}}
```

### Restore from Version
```
POST {{base_url}}/workflows/admin/versions/1/restore
Authorization: Bearer {{auth_token}}
Body: {}
```

---

## Summary

**Total APIs Added to Documentation:**
- Company Management: 2
- Designation Management: 3
- Grade Management: 3
- Level Management: 3
- Holiday Bank: 6
- Holiday Policy: 8
- Workflow User Requests: 9
- Workflow Admin Config: 7
- Workflow Stage Management: 3
- Workflow Approver Management: 3
- Workflow Condition Management: 5
- Workflow Applicability: 2
- Workflow Version Control: 2

**Grand Total New APIs: 56+**

---

## Import Note
These APIs follow REST conventions. Most use:
- Bearer token authentication
- JSON request/response format
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Query parameters for filtering on GET requests
