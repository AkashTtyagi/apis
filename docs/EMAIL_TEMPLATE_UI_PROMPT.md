# 📧 Email Template Library - UI Development Guide

> **Goal:** Create a world-class email template management system with modern UI/UX

---

## 📚 Table of Contents
1. [Module Overview](#module-overview)
2. [Phase-wise Implementation](#phase-wise-implementation)
3. [API Integration Guide](#api-integration-guide)
4. [UI/UX Design System](#uiux-design-system)
5. [Testing Checklist](#testing-checklist)

---

## Module Overview

### Purpose
Build an intuitive email template library where admins can:
- ✉️ Create and manage email templates
- 🔗 Link templates to workflows (Leave, WFH, etc.)
- 📋 Clone default templates for customization
- 🎨 Design emails with rich text editor
- 👁️ Preview templates with live data

### User Journey
```
Admin Dashboard → Email Templates → Browse/Search → Create/Edit → Preview → Activate
```

---

## Phase-wise Implementation

<details open>
<summary><h2>🎯 PHASE 1: List & Search (MVP)</h2></summary>

### Deliverables
✅ Template list page with table view
✅ Search and basic filters
✅ View template details
✅ Delete template (with restrictions)

### 1.1 Email Template List Page

**Route:** `/settings/email-templates` or `/email-templates`

**Page Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  📧 Email Template Library                    [+ New Template]│
├──────────────────────────────────────────────────────────────┤
│  🔍 Search: [________________]  Category: [All ▼]  Status: [▼]│
│      Type: [All Templates ▼]                                 │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Template Name    │ Category  │ Workflow │ Type │ Actions││  │
│  ├──────────────────┼───────────┼──────────┼──────┼────────┤│  │
│  │ Leave Approved   │ Leave     │ LEAVE 📎 │ 🔒   │ 👁 📋 │ │  │
│  │ Welcome Email    │ Onboarding│ None     │ 🔒   │ 👁 📋 │ │  │
│  │ Birthday Wishes  │ Engagement│ None     │ ✅   │ ✏️ 🗑️ │ │  │
│  └────────────────────────────────────────────────────────┘  │
│  Showing 1-10 of 20                              [< 1 2 3 >] │
└──────────────────────────────────────────────────────────────┘
```

**Table Columns:**

| Column | Width | Description | Interactive |
|--------|-------|-------------|-------------|
| **Template Name** | 30% | Display name with icon | Clickable → Edit |
| **Slug** | 15% | Unique identifier | Badge (monospace) |
| **Category** | 15% | Color-coded category | Badge |
| **Workflow** | 15% | Linked workflow name | Badge with icon |
| **Type** | 10% | Default/Company | Badge |
| **Status** | 10% | Active/Inactive | Toggle switch |
| **Actions** | 15% | View, Edit, Clone, Delete | Icon buttons |

**Badges & Icons:**

```jsx
// Template Type Badges
<Badge color="blue" icon={<LockIcon />}>Default</Badge>
<Badge color="green" icon={<CheckIcon />}>Customized</Badge>

// Workflow Badge
<Badge color="purple" icon={<LinkIcon />}>LEAVE</Badge>
<Badge color="gray">None</Badge>

// Status Badge
<Badge color="green" icon={<CheckCircleIcon />}>Active</Badge>
<Badge color="gray" icon={<XCircleIcon />}>Inactive</Badge>
```

**Action Buttons:**

```jsx
<IconButton icon={<EyeIcon />} tooltip="Preview" />
<IconButton icon={<EditIcon />} tooltip="Edit" disabled={isDefault && !canEdit} />
<IconButton icon={<CopyIcon />} tooltip="Clone" />
<IconButton icon={<TrashIcon />} tooltip="Delete" disabled={isDefault} color="red" />
```

**Filters Section:**

```jsx
<Filters>
  <SearchInput
    placeholder="Search by name, slug, or subject..."
    icon={<SearchIcon />}
    clearable
  />

  <Select label="Category" placeholder="All Categories">
    <Option value="">All Categories</Option>
    <Option value="authentication">🔐 Authentication</Option>
    <Option value="onboarding">👋 Onboarding</Option>
    <Option value="leave">📅 Leave</Option>
    <Option value="attendance">⏰ Attendance</Option>
    <Option value="engagement">🎉 Engagement</Option>
    <Option value="payroll">💰 Payroll</Option>
    <Option value="offboarding">👋 Offboarding</Option>
  </Select>

  <Select label="Template Type">
    <Option value="">All Templates</Option>
    <Option value="default">Default Templates</Option>
    <Option value="company">Company Templates</Option>
  </Select>

  <Select label="Status">
    <Option value="">All Status</Option>
    <Option value="true">Active</Option>
    <Option value="false">Inactive</Option>
  </Select>

  <Select label="Workflow">
    <Option value="">All Workflows</Option>
    {/* Fetched from /api/email-templates/masters */}
    <Option value="1">Leave</Option>
    <Option value="4">WFH</Option>
    <Option value="2">On Duty</Option>
  </Select>
</Filters>
```

**Empty State:**

```jsx
<EmptyState
  icon={<EmailIcon size={64} />}
  title="No Email Templates Found"
  description="Get started by creating your first email template or browse our pre-defined master templates."
  actions={[
    <Button primary>Create Template</Button>,
    <Button>View Master Templates</Button>
  ]}
/>
```

### 1.2 API Integration

**Endpoint:** `POST /api/email-templates/list`

```javascript
// Request
{
  "is_active": true,        // optional: true/false
  "search": "leave",        // optional: searches name/slug/subject
  "slug": "leave_approved"  // optional: filter by specific slug
}

// Response
{
  "success": true,
  "message": "Email templates retrieved successfully",
  "data": [
    {
      "id": 1,
      "company_id": 123,           // null = default template
      "slug": "leave_approved",
      "name": "Leave Approved (Customized)",
      "subject": "Your leave has been approved",
      "body": "<p>Dear {{user_name}}...</p>",
      "variables": ["user_name", "leave_type", "from_date"],
      "is_active": true,
      "created_at": "2025-10-30T10:00:00Z",
      "updated_at": "2025-10-30T10:00:00Z"
    }
  ]
}
```

**Frontend State Management:**

```typescript
interface Template {
  id: number;
  company_id: number | null;
  slug: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Filters {
  search: string;
  category: string;
  status: '' | 'true' | 'false';
  templateType: '' | 'default' | 'company';
  workflowId: string;
}

const [templates, setTemplates] = useState<Template[]>([]);
const [loading, setLoading] = useState(false);
const [filters, setFilters] = useState<Filters>({
  search: '',
  category: '',
  status: '',
  templateType: '',
  workflowId: ''
});
```

### 1.3 Delete Template

**Rules:**
- ✅ Can delete: Company-specific templates
- ❌ Cannot delete: Default templates (company_id = null)

**Confirmation Modal:**

```jsx
<Modal
  title="Delete Email Template"
  icon={<AlertTriangleIcon color="red" />}
  actions={[
    <Button onClick={onCancel}>Cancel</Button>,
    <Button color="red" onClick={onConfirm} loading={deleting}>
      Delete Template
    </Button>
  ]}
>
  <Text>
    Are you sure you want to delete "<strong>{template.name}</strong>"?
  </Text>
  <Alert type="warning">
    This action cannot be undone. All configurations using this template will need to be updated.
  </Alert>
</Modal>
```

**API Call:**

```javascript
// POST /api/email-templates/delete
{
  "template_id": 1
}

// Success Response
{
  "success": true,
  "message": "Email template deleted successfully",
  "data": { "deleted": true }
}

// Error Response (trying to delete default)
{
  "success": false,
  "message": "Email template not found or cannot be deleted (default templates are protected)"
}
```

</details>

---

<details>
<summary><h2>🎨 PHASE 2: Create & Edit Templates</h2></summary>

### Deliverables
✅ Create template from master
✅ Create custom template
✅ Edit template form
✅ Variable management
✅ Form validations

### 2.1 Create Template Flow

**Step 1: Select Template Type**

```jsx
<Modal title="Create Email Template" size="lg">
  <RadioGroup>
    <RadioCard
      value="master"
      icon={<TemplateIcon />}
      title="Select from Master Templates"
      description="Choose from pre-defined templates with workflow integration and variables"
      recommended
    />
    <RadioCard
      value="custom"
      icon={<CodeIcon />}
      title="Create Custom Template"
      description="Define your own template from scratch with manual configuration"
    />
  </RadioGroup>

  <ModalFooter>
    <Button onClick={onCancel}>Cancel</Button>
    <Button primary onClick={onContinue}>Continue</Button>
  </ModalFooter>
</Modal>
```

**Step 2: Select Master Template (if master selected)**

```jsx
<Select
  label="Select Master Template"
  placeholder="Choose a template..."
  searchable
  groupBy="category"
>
  <OptGroup label="🔐 Authentication">
    <Option value="reset_password">Reset Password</Option>
    <Option value="set_password">Set Password</Option>
  </OptGroup>

  <OptGroup label="👋 Onboarding">
    <Option value="welcome_email">Welcome Email</Option>
  </OptGroup>

  <OptGroup label="📅 Leave Workflow (LEAVE)">
    <Option value="leave_approved">Leave Approved</Option>
    <Option value="leave_rejected">Leave Rejected</Option>
  </OptGroup>

  <OptGroup label="🏠 WFH Workflow (WFH)">
    <Option value="wfh_approved">WFH Approved</Option>
    <Option value="wfh_rejected">WFH Rejected</Option>
  </OptGroup>
</Select>
```

### 2.2 Template Form

**Route:** `/email-templates/create` or `/email-templates/:id/edit`

**Form Layout:**

```
┌──────────────────────────────────────────────────────────┐
│  ← Back to Templates    Create Email Template    [Save] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ╔══════════════════════════════════════════════════╗  │
│  ║ 1️⃣ Basic Information                              ║  │
│  ╚══════════════════════════════════════════════════╝  │
│                                                          │
│  Template Slug *                                         │
│  [leave_approved________________________]                │
│  ℹ️ Unique identifier (lowercase, underscores only)     │
│                                                          │
│  Template Name *                                         │
│  [Leave Approved_________________________]               │
│                                                          │
│  Category *                                              │
│  [Select Category ▼         ]  [Select Workflow ▼     ] │
│                                                          │
│  Status                                                  │
│  [✓] Active                                              │
│                                                          │
│  ╔══════════════════════════════════════════════════╗  │
│  ║ 2️⃣ Email Content                                  ║  │
│  ╚══════════════════════════════════════════════════╝  │
│                                                          │
│  Subject Line *                                          │
│  [Your {{leave_type}} leave has been approved____]       │
│                                                          │
│  Available Variables: (Click to insert)                  │
│  [{{user_name}}] [{{leave_type}}] [{{from_date}}]       │
│  [{{to_date}}] [{{approver_name}}] [{{remarks}}]        │
│                                                          │
│  Email Body *                                            │
│  ┌────────────────────────────────────────────────┐    │
│  │ [B] [I] [U] 🔗 📷 {</>} [Variables ▼]         │    │
│  ├────────────────────────────────────────────────┤    │
│  │                                                 │    │
│  │  Dear {{user_name}},                           │    │
│  │                                                 │    │
│  │  Your {{leave_type}} leave request from        │    │
│  │  {{from_date}} to {{to_date}} has been        │    │
│  │  approved by {{approver_name}}.                │    │
│  │                                                 │    │
│  │  Best regards,                                  │    │
│  │  HR Team                                        │    │
│  │                                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  [👁️ Preview]  [💾 Save Draft]  [✅ Save & Activate]  │
└──────────────────────────────────────────────────────────┘
```

### 2.3 Form Fields

```typescript
interface TemplateForm {
  slug: string;              // Required, pattern: ^[a-z0-9_]+$
  name: string;              // Required, 3-255 chars
  category: string;          // Required
  workflow_id: number | null; // Optional
  subject: string;           // Required, max 500 chars
  body: string;              // Required, min 10 chars (HTML)
  variables: string[];       // Array of variable names
  is_active: boolean;        // Default: true
}

// Validation Rules
const validationSchema = {
  slug: {
    required: true,
    pattern: /^[a-z0-9_]+$/,
    message: "Slug must contain only lowercase letters, numbers, and underscores"
  },
  name: {
    required: true,
    minLength: 3,
    maxLength: 255,
    message: "Template name is required (3-255 characters)"
  },
  subject: {
    required: true,
    maxLength: 500,
    message: "Email subject is required (max 500 characters)"
  },
  body: {
    required: true,
    minLength: 10,
    message: "Email body is required (min 10 characters)"
  }
};
```

### 2.4 Variable Management

**Variable Chips (Clickable to Insert):**

```jsx
<VariableChips>
  {availableVariables.map(variable => (
    <Chip
      key={variable}
      onClick={() => insertVariable(variable)}
      icon={<CodeIcon />}
      variant="outline"
      color="purple"
    >
      {`{{${variable}}}`}
    </Chip>
  ))}
</VariableChips>

// When clicked, insert at cursor position in editor
const insertVariable = (variable: string) => {
  const text = `{{${variable}}}`;
  // Insert into rich text editor at cursor
  editor.insertText(text);
};
```

**Variable Validation:**

```jsx
// Highlight unrecognized variables in red
<Alert type="warning" icon={<AlertIcon />}>
  <Text>Unrecognized variables detected:</Text>
  <Code>{{invalid_variable}}</Code>
  <Button size="sm" onClick={addToVariables}>Add to Variables</Button>
</Alert>
```

### 2.5 API Integration

**Create Template:**

```javascript
// POST /api/email-templates/create
{
  "slug": "leave_approved",
  "name": "Leave Approved",
  "subject": "Your leave has been approved",
  "body": "<p>Dear {{user_name}},</p>...",
  "variables": ["user_name", "leave_type", "from_date"],
  "is_active": true
}

// Response
{
  "success": true,
  "message": "Email template created successfully",
  "data": {
    "id": 1,
    "company_id": 123,
    "slug": "leave_approved",
    // ... full template object
  }
}
```

**Update Template:**

```javascript
// POST /api/email-templates/update
{
  "template_id": 1,
  "name": "Leave Approved (Updated)",  // optional
  "subject": "Updated subject",        // optional
  "body": "<p>Updated body</p>",      // optional
  "variables": ["user_name"],          // optional
  "is_active": false                   // optional
}
```

</details>

---

<details>
<summary><h2>👁️ PHASE 3: Preview & Clone</h2></summary>

### Deliverables
✅ Preview template with sample data
✅ Clone default templates
✅ Rich text editor integration

### 3.1 Preview Modal

**Design:**

```
╔═══════════════════════════════════════════════════════════╗
║  Email Preview                                    [✕ Close]║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ From: noreply@company.com                          │ ║
║  │ To: employee@example.com                            │ ║
║  │ Subject: Your leave has been approved               │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  ┌───────────────────────────────────────────────────┐   ║
║  │                                                   │   ║
║  │  Dear John Doe,                                   │   ║
║  │                                                   │   ║
║  │  Your Casual Leave request from 2025-11-01 to    │   ║
║  │  2025-11-05 (5 days) has been approved by        │   ║
║  │  Sarah Manager.                                   │   ║
║  │                                                   │   ║
║  │  Remarks: Approved for vacation                   │   ║
║  │                                                   │   ║
║  │  Best regards,                                    │   ║
║  │  TechCorp HR Team                                 │   ║
║  │                                                   │   ║
║  └───────────────────────────────────────────────────┘   ║
║                                                           ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ 📊 Sample Data Used:                               │ ║
║  │ • user_name: "John Doe"                            │ ║
║  │ • leave_type: "Casual Leave"                       │ ║
║  │ • from_date: "2025-11-01"                          │ ║
║  │ • to_date: "2025-11-05"                            │ ║
║  │ • total_days: "5"                                  │ ║
║  │ • approver_name: "Sarah Manager"                   │ ║
║  │ • remarks: "Approved for vacation"                 │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  [📧 Send Test Email] [Copy HTML] [Close]                ║
╚═══════════════════════════════════════════════════════════╝
```

**Sample Data Generator:**

```typescript
const sampleData: Record<string, string> = {
  user_name: "John Doe",
  company_name: "TechCorp Solutions",
  employee_code: "EMP001",
  leave_type: "Casual Leave",
  from_date: moment().add(1, 'day').format('YYYY-MM-DD'),
  to_date: moment().add(5, 'days').format('YYYY-MM-DD'),
  total_days: "5",
  approver_name: "Sarah Manager",
  remarks: "Approved for vacation",
  reset_link: "https://app.example.com/reset-password/abc123",
  expiry_time: "24 hours",
  wishes_message: "May this year bring you joy and success!",
  // ... add more sample values
};

// Replace variables
const replaceVariables = (template: string, data: Record<string, string>): string => {
  let result = template;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key]);
  });
  return result;
};
```

### 3.2 Clone Template

**Confirmation Modal:**

```jsx
<Modal
  title="Clone Email Template"
  icon={<CopyIcon />}
>
  <Text>
    This will create a company-specific copy of
    "<strong>{template.name}</strong>" that you can customize.
  </Text>

  <Alert type="info">
    The original default template will remain unchanged.
    Your customized version will take precedence for your company.
  </Alert>

  <ModalFooter>
    <Button onClick={onCancel}>Cancel</Button>
    <Button primary onClick={onClone} loading={cloning}>
      Clone Template
    </Button>
  </ModalFooter>
</Modal>
```

**API Call:**

```javascript
// POST /api/email-templates/clone
{
  "template_id": 2  // ID of default template
}

// Success Response
{
  "success": true,
  "message": "Email template cloned successfully for customization",
  "data": {
    "id": 10,
    "company_id": 123,
    "slug": "leave_approved",
    "name": "Leave Approved (Customized)",
    // ... cloned template data
  }
}

// After cloning, redirect to edit page
router.push(`/email-templates/${response.data.id}/edit`);
```

</details>

---

<details>
<summary><h2>🚀 PHASE 4: Advanced Features</h2></summary>

### Deliverables (Optional)
✅ Send test email
✅ Template usage statistics
✅ Bulk actions
✅ Export/Import templates

### 4.1 Send Test Email

```jsx
<Modal title="Send Test Email">
  <Form>
    <Input
      label="Recipient Email"
      type="email"
      placeholder="test@example.com"
      required
    />

    <Alert type="info">
      The email will be sent using sample data for preview purposes.
    </Alert>
  </Form>

  <ModalFooter>
    <Button onClick={onCancel}>Cancel</Button>
    <Button primary onClick={onSend} loading={sending}>
      Send Test Email
    </Button>
  </ModalFooter>
</Modal>
```

### 4.2 Template Statistics

```jsx
<Card>
  <CardHeader>
    <Title>Template Usage</Title>
    <Subtitle>Last 30 days</Subtitle>
  </CardHeader>

  <Stats>
    <Stat>
      <StatLabel>Emails Sent</StatLabel>
      <StatValue>1,234</StatValue>
      <StatTrend up>+12%</StatTrend>
    </Stat>

    <Stat>
      <StatLabel>Success Rate</StatLabel>
      <StatValue>98.5%</StatValue>
    </Stat>

    <Stat>
      <StatLabel>Last Sent</StatLabel>
      <StatValue>2 hours ago</StatValue>
    </Stat>
  </Stats>
</Card>
```

### 4.3 Bulk Actions

```jsx
<BulkActions selectedCount={selectedTemplates.length}>
  <Button onClick={bulkActivate}>
    <CheckIcon /> Activate
  </Button>
  <Button onClick={bulkDeactivate}>
    <XIcon /> Deactivate
  </Button>
  <Button onClick={bulkExport}>
    <DownloadIcon /> Export
  </Button>
</BulkActions>
```

</details>

---

## API Integration Guide

### Base Configuration

```typescript
const API_BASE_URL = '/api/email-templates';
const AUTH_HEADER = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});

// All endpoints use POST method
```

### API Endpoints Summary

| Endpoint | Purpose | Request Body |
|----------|---------|--------------|
| `POST /masters` | Get template masters dropdown | `{ is_active?, category?, search? }` |
| `POST /list` | Get all templates | `{ is_active?, search?, slug? }` |
| `POST /details` | Get single template | `{ template_id }` |
| `POST /by-slug` | Get template by slug | `{ slug }` |
| `POST /create` | Create template | `{ slug, name, subject, body, variables, is_active }` |
| `POST /update` | Update template | `{ template_id, name?, subject?, body?, variables?, is_active? }` |
| `POST /clone` | Clone template | `{ template_id }` |
| `POST /delete` | Delete template | `{ template_id }` |

### Example API Service

```typescript
class EmailTemplateAPI {
  async getMasters(filters = {}) {
    return axios.post(`${API_BASE_URL}/masters`, filters, {
      headers: AUTH_HEADER()
    });
  }

  async getTemplates(filters = {}) {
    return axios.post(`${API_BASE_URL}/list`, filters, {
      headers: AUTH_HEADER()
    });
  }

  async getTemplate(templateId: number) {
    return axios.post(`${API_BASE_URL}/details`,
      { template_id: templateId },
      { headers: AUTH_HEADER() }
    );
  }

  async createTemplate(data: TemplateForm) {
    return axios.post(`${API_BASE_URL}/create`, data, {
      headers: AUTH_HEADER()
    });
  }

  async updateTemplate(templateId: number, data: Partial<TemplateForm>) {
    return axios.post(`${API_BASE_URL}/update`,
      { template_id: templateId, ...data },
      { headers: AUTH_HEADER() }
    );
  }

  async cloneTemplate(templateId: number) {
    return axios.post(`${API_BASE_URL}/clone`,
      { template_id: templateId },
      { headers: AUTH_HEADER() }
    );
  }

  async deleteTemplate(templateId: number) {
    return axios.post(`${API_BASE_URL}/delete`,
      { template_id: templateId },
      { headers: AUTH_HEADER() }
    );
  }
}

export const emailTemplateAPI = new EmailTemplateAPI();
```

---

## UI/UX Design System

### 🎨 Color Palette

```css
/* Primary Colors */
--primary: #3B82F6;      /* Blue - Default templates, primary actions */
--success: #10B981;      /* Green - Customized templates, active status */
--warning: #F59E0B;      /* Amber - Warnings, drafts */
--danger: #EF4444;       /* Red - Delete, errors */
--info: #06B6D4;         /* Cyan - Info messages */
--purple: #8B5CF6;       /* Purple - Workflows */

/* Neutral Colors */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Category Colors */
--category-auth: #3B82F6;        /* Blue */
--category-onboarding: #10B981;  /* Green */
--category-leave: #F59E0B;       /* Amber */
--category-attendance: #8B5CF6;  /* Purple */
--category-engagement: #EC4899;  /* Pink */
--category-payroll: #14B8A6;     /* Teal */
--category-offboarding: #6366F1; /* Indigo */
```

### 🔤 Typography

```css
/* Font Families */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 📏 Spacing

```css
/* Spacing Scale (based on 4px) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### 🎭 Component Styles

**Buttons:**

```jsx
// Primary Button
<Button
  variant="primary"
  size="md"
  leftIcon={<PlusIcon />}
  loading={isLoading}
>
  Create Template
</Button>

// CSS
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2563EB;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

**Badges:**

```jsx
// Badge Component
<Badge color="green" variant="solid" size="sm">
  Customized
</Badge>

// CSS
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  gap: 0.25rem;
}

.badge-solid-green {
  background: var(--success);
  color: white;
}

.badge-outline {
  border: 1px solid currentColor;
  background: transparent;
}
```

**Cards:**

```jsx
// Card Component
<Card hover shadow="md">
  <CardHeader>
    <Title>Template Name</Title>
    <Subtitle>Last updated 2 hours ago</Subtitle>
  </CardHeader>
  <CardBody>
    Content here...
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// CSS
.card {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid var(--gray-200);
  overflow: hidden;
  transition: all 0.2s;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### 🎬 Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Slide In from Right */
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Scale In */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Usage */
.modal-content {
  animation: scaleIn 0.2s ease-out;
}

.notification {
  animation: slideInRight 0.3s ease-out;
}
```

### 📱 Responsive Design

```css
/* Breakpoints */
--screen-sm: 640px;   /* Mobile landscape */
--screen-md: 768px;   /* Tablet */
--screen-lg: 1024px;  /* Desktop */
--screen-xl: 1280px;  /* Large desktop */
--screen-2xl: 1536px; /* Extra large */

/* Mobile First Approach */
.template-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .template-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .template-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Testing Checklist

### ✅ Functional Testing

**Phase 1: List & Search**
- [ ] Load template list successfully
- [ ] Search by template name works
- [ ] Filter by category works
- [ ] Filter by workflow type works
- [ ] Filter by status works
- [ ] Filter by template type (default/company) works
- [ ] Pagination works correctly
- [ ] Table sorting works
- [ ] Delete company template works
- [ ] Cannot delete default template (shows error)
- [ ] Status toggle works
- [ ] Empty state shows when no results

**Phase 2: Create & Edit**
- [ ] Open create template modal
- [ ] Select from master template
- [ ] Select custom template
- [ ] Form validation works (required fields)
- [ ] Slug validation works (lowercase, underscores only)
- [ ] Create template successfully
- [ ] Edit existing template
- [ ] Cannot edit slug on edit
- [ ] Variable chips clickable and insert correctly
- [ ] Rich text editor works
- [ ] Save draft works (is_active = false)
- [ ] Save & activate works (is_active = true)
- [ ] Form errors show correctly
- [ ] Cancel discards changes

**Phase 3: Preview & Clone**
- [ ] Preview modal opens
- [ ] Variables replaced with sample data
- [ ] Email renders correctly in preview
- [ ] Clone default template works
- [ ] Redirects to edit after clone
- [ ] Cannot clone if already exists

**Phase 4: Advanced**
- [ ] Send test email works
- [ ] Test email received correctly
- [ ] Statistics show correctly
- [ ] Bulk actions work

### ✅ UI/UX Testing

- [ ] Consistent design across all pages
- [ ] Colors match design system
- [ ] Typography consistent
- [ ] Spacing consistent
- [ ] Hover states work
- [ ] Focus states visible (accessibility)
- [ ] Loading states show
- [ ] Error states show
- [ ] Success messages show
- [ ] Animations smooth
- [ ] Icons correct size and aligned
- [ ] Badges styled correctly

### ✅ Responsive Testing

- [ ] Works on mobile (< 640px)
- [ ] Works on tablet (640px - 1024px)
- [ ] Works on desktop (> 1024px)
- [ ] Table responsive on mobile
- [ ] Modals responsive
- [ ] Forms responsive
- [ ] No horizontal scroll on mobile

### ✅ Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### ✅ Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus visible
- [ ] ARIA labels present
- [ ] Color contrast passes WCAG AA
- [ ] Alt text for images/icons

---

## 📚 Recommended Libraries

### React Ecosystem

```json
{
  "ui-framework": "shadcn/ui or Mantine or Ant Design",
  "rich-text-editor": "react-quill or tiptap or lexical",
  "forms": "react-hook-form",
  "validation": "zod or yup",
  "state-management": "zustand or redux-toolkit",
  "api-client": "axios or tanstack-query",
  "routing": "react-router-dom",
  "icons": "lucide-react or heroicons",
  "toast-notifications": "react-hot-toast or sonner",
  "date-handling": "date-fns or dayjs"
}
```

### Vue Ecosystem

```json
{
  "ui-framework": "Vuetify or PrimeVue or Element Plus",
  "rich-text-editor": "vue-quill or tiptap",
  "forms": "vee-validate",
  "validation": "yup or zod",
  "state-management": "pinia",
  "api-client": "axios",
  "routing": "vue-router",
  "icons": "unplugin-icons",
  "toast-notifications": "vue-toastification"
}
```

### Angular Ecosystem

```json
{
  "ui-framework": "Angular Material or PrimeNG",
  "rich-text-editor": "ngx-quill or angular-editor",
  "forms": "Reactive Forms (built-in)",
  "validation": "Angular Validators",
  "state-management": "NgRx or Akita",
  "api-client": "HttpClient (built-in)",
  "icons": "Angular Material Icons",
  "toast-notifications": "ngx-toastr"
}
```

---

## 🎓 Best Practices

### Code Quality
✅ Use TypeScript for type safety
✅ Follow component composition pattern
✅ Extract reusable components
✅ Write meaningful variable names
✅ Add JSDoc comments for complex logic
✅ Handle loading states
✅ Handle error states
✅ Implement proper error boundaries

### Performance
✅ Lazy load routes
✅ Debounce search inputs
✅ Virtualize long lists
✅ Optimize images
✅ Cache API responses
✅ Use React.memo / Vue computed / Angular trackBy

### Security
✅ Sanitize HTML before rendering
✅ Validate inputs client-side
✅ Don't store sensitive data in localStorage
✅ Use HTTPS only
✅ Implement CSRF protection

### User Experience
✅ Show loading spinners
✅ Show success/error toasts
✅ Confirm destructive actions
✅ Provide helpful error messages
✅ Auto-save drafts
✅ Keyboard shortcuts for power users
✅ Undo/Redo support (nice to have)

---

## 📞 Support & Questions

### Documentation
- Backend API Docs: Check Postman collection section "32. Email Template Library"
- API Base URL: `/api/email-templates`
- All endpoints use POST method
- Authentication: Bearer token required

### Need Help?
- Backend API issues → Contact backend team
- UI/UX clarifications → Refer to this document
- Missing features → Check phase definitions
- Performance issues → Follow best practices section

---

## 🏆 Success Criteria

Your implementation is complete when:

✅ **Phase 1 Complete:**
- User can view list of templates
- User can search and filter templates
- User can delete company templates
- User cannot delete default templates

✅ **Phase 2 Complete:**
- User can create template from master
- User can create custom template
- User can edit templates
- Form validations work correctly

✅ **Phase 3 Complete:**
- User can preview templates
- User can clone default templates
- Rich text editor integrated
- Variables work correctly

✅ **Quality Checks:**
- No console errors
- No broken layouts on any screen size
- All loading states implemented
- All error states handled
- Matches design system
- Accessibility score > 90%

---

## 📝 Final Notes

This guide provides a **world-class standard** for building the Email Template Library. Follow the phases sequentially, test thoroughly, and maintain code quality.

**Remember:**
- 🎨 Design matters - invest time in polish
- ⚡ Performance matters - optimize early
- ♿ Accessibility matters - test with keyboard
- 📱 Mobile matters - test on real devices
- 🧪 Testing matters - write tests, prevent regressions

**Good luck building an amazing Email Template Library! 🚀**

---

*Last Updated: 2025-10-31*
*Version: 2.0 - Phase-wise Implementation Guide*
