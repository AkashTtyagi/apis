# HRMS-Integrated Expense Management System

## Overview
This expense management module is designed as an integrated component of your HRMS system. Employees and organizational structure are managed through the main HRMS, and approval workflows leverage the existing workflow management system. Payment processing will integrate with the upcoming payroll module, with current support for bank payment sheet generation.

---

## 1) Location Group Management

Configure geographical clusters to apply location-based expense limits and policies.

### Configuration Fields

**Basic Information**
- **Group Name** (mandatory) — Text input
  - Example: "Metro Cities Tier 1", "International Locations"
  - Character limit: 100
  
- **Group Code** (mandatory) — Alphanumeric input (unique identifier)
  - Format: LOC-XXX (system-generated or custom)
  - Auto-validation for uniqueness
  
- **Group Description** — Textarea (optional)
  - Explain the purpose or criteria for this grouping
  - Character limit: 500

**Geographical Hierarchy**
- **Country** (multi-select dropdown) — Select one or more countries
  - Search-enabled dropdown with flags
  - Synced from HRMS location master
  
- **State/Province** (multi-select dropdown) — Dependent on selected country
  - Dynamic loading based on country selection
  - Synced from HRMS location master
  
- **City** (multi-select dropdown) — Dependent on selected state
  - Auto-complete with cities from HRMS database
  - Option to add custom cities
  
- **Postal/ZIP Code Range** (optional) — Text input
  - Format: "110001-110099" or comma-separated values

**Additional Configuration**
  
- **Cost of Living Index** — Dropdown (Low/Medium/High/Very High)
  - Used by AI for smart limit recommendations
  
- **Active Status** — Toggle (Yes/No)
  - Inactive groups won't appear in policy selection
  
**Audit Information**
- Created By — Auto-captured from HRMS (username + timestamp)
- Last Modified By — Auto-captured from HRMS (username + timestamp)
- Change History — View all modifications

### Use Cases
- Link groups when defining expense category limits
- Apply different policies for domestic vs. international travel
- Create tiered city classifications (Tier 1, Tier 2, Tier 3)
- Set region-specific per diem rates
- Compliance with local tax and reimbursement regulations

---

## 2) Expense Category Management

Define each expense type with comprehensive configurations, filing rules, and validation logic.

### 2.1 Expense Type Selection

Choose the fundamental type that determines calculation logic:

**a) Amount-Based**
- Standard monetary expenses
- Examples: Meals, Lodging, Office Supplies, Client Entertainment

**b) Mileage-Based**
- Distance-driven reimbursements
- Examples: Personal vehicle usage, Bike allowance

**c) Per Diem**
- Daily fixed allowance for travel
- Location and duration-based calculation

**d) Time-Based**
- Hourly or daily rate expenses
- Examples: Equipment rental, Consultant fees

### 2.2 Basic Expense Information

**Identification**
- **Expense Category Name** (mandatory) — Text input
  - Clear, descriptive naming (e.g., "Domestic Flight Travel")
  - Character limit: 150
  
- **Expense Group** (mandatory) — Dropdown
  - Predefined groups: Travel, Food & Beverage, Accommodation, Transportation, Office Expenses, Client Entertainment, Training & Development, Miscellaneous
  - Option to create new group inline
  
- **Expense Code** (mandatory) — Text input (unique)
  - Format: EXP-XXXX (system-generated or custom)
  - Used in accounting and reporting
  
- **GL/SAP Code** (optional) — Text input
  - Map to general ledger codes for accounting integration
  - Supports multiple codes (comma-separated)

**Description & Help**
- **Category Description** — Rich text editor
  - Explain what qualifies under this category
  - Include examples and exclusions
  
- **Help Text for Employees** — Rich text editor
  - User-friendly guidelines displayed during filing
  - Can include links to detailed policy documents
  
- **Icon/Image** — Upload (optional)
  - Visual representation for mobile app and dashboard
  - Recommended size: 128x128px

**Status & Visibility**
- **Active Status** — Toggle (Yes/No)
  - Inactive categories hidden from employee selection
    
- **Requires Pre-Approval** — Yes/No
  - Force employees to get approval before incurring expense 
     if yes then select the RM , RM_OF_RM ,CUSTOM

### 2.3 Custom Fields Configuration

Capture additional structured information during expense filing.

**Field Definition**
- **Field Name** (mandatory) — Text input
  - Example: "Client Name", "Project Code", "Event Type"
  
- **Field Label** — Text input
  - Display name shown to users (defaults to Field Name)
  
- **Field Type** (mandatory) — Dropdown options:
  - Text Box (single line)
  - Text Area (multi-line)
  - Number (integer or decimal)
  - Date
  - Time
  - Date & Time
  - Dropdown (single select)
  - Multi-select Dropdown
  - Radio Button
  - Checkbox
  - File Upload (with size and format restrictions)
  - Email
  - URL
  - Phone Number
  - Employee Search (lookup from HRMS)
  - Location Picker (from HRMS locations)
  - Currency Input

**Field Validation**
- **Is Mandatory** — Toggle (Yes/No)
  
- **Validation Rules** — Configure based on field type:
  - Min/Max length for text
  - Min/Max value for numbers
  - Date range restrictions
  - Regex pattern for custom validation
  - Allowed file formats and size limits
  
- **Conditional Display** — Show/hide based on other field values
  - Example: Show "Hotel Star Rating" only if "Accommodation Type" = Hotel
  
- **Default Value** — Pre-fill with specified value
  
- **Help Text** — Tooltip or inline guidance

**Dropdown Configuration** (if applicable)
- **Values** — Comma-separated or line-separated input
- **Allow Custom Values** — Yes/No (user can add new options)
- **Multi-select Max Selections** — Numeric input (if multi-select)
- **Master Data Source** — Sync from HRMS (Projects, Cost Centers, Departments)

**Actions**
- **Add More Fields** — Button (unlimited dynamic fields)
- **Reorder Fields** — Drag-and-drop interface
- **Clone Field** — Duplicate existing field configuration
- **Import from Template** — Load predefined field sets

### 2.4 Expense Limit Configuration

Define spending controls with sophisticated logic and escalation rules.

**Primary Limit Type**

**a) No Limit**
- No spending restrictions (still subject to approval via HRMS workflow)
- Use case: Executive-level expenses

**b) Global Limit** (Applicable to all locations)
- **Limit Basis** — Choose:
  - Fixed Amount
  - Percentage of CTC (Annual/Monthly) - pulled from HRMS
  - Percentage of Base Salary - pulled from HRMS
  
- **Limit Value** (mandatory) — Numeric input
  - Support for decimals
  
- **Limit Period** (mandatory) — Dropdown:
  - Per Transaction
  - Daily
  - Weekly
  - Monthly
  - Quarterly
  - Half-Yearly
  - Yearly
  - Lifetime (one-time allowance)
  - Rolling Period (last X days)
  
- **Rollover Unused Limit** — Yes/No
  - Carry forward unused amount to next period
  - Specify max rollover cap (optional)

**c) Location-Based Limit**
- **Location Group** (mandatory) — Dropdown (from created groups)
  
- **Limit Amount** (mandatory) — Numeric input
  
- **Limit Period** (mandatory) — Dropdown (same as global)
  
- **Override Global Limit** — Yes/No
  - If No, apply stricter of global or location limit
  
- **Add More Location Limits** — Button
  - Define multiple tiers with different amounts
  - Priority order if locations overlap

**Advanced Limit Features**
- **Threshold Alerts** — Set percentage-based warnings
  - Example: Alert at 75%, 90%, 100% of limit utilization
  
- **Grace Amount** — Allow overage up to specified amount
  - Requires additional approval level (handled by HRMS workflow)
  
- **Cumulative vs. Individual** — Toggle
  - Cumulative: Total of all expenses in period
  - Individual: Each expense checked separately
  
- **Shared Pool Limits** — Department or team-wide spending cap
  - Track collective utilization

### 2.5 Employee Expense Filing Rules

Control submission behavior and validation at the employee interface.

**Limit Breach Handling**
- **Allow Filing Beyond Limit** — Yes/No
  
- **If Yes, Categorize As** — Dropdown:
  - Exceptional Expense (requires justification)
  - Auto-escalate via HRMS Workflow
  - Block Unless Pre-Approved
  
- **Exceptional Justification Required** — Yes/No
  - Minimum character count for justification
  

**Documentation Requirements**
- **Description Required** — Toggle (Yes/No)
  - Minimum character count (if mandatory)
  - Suggested prompts for description
  
- **Receipt/Bill Mandatory** — Toggle (Yes/No)
  
  - **If Yes:**
    - **Minimum Amount Threshold** — Numeric input
      - Example: Mandatory for expenses ≥ ₹500
    - **Document Type** — Dropdown (Invoice, Receipt, Bill, Other)
    - **File Format Allowed** — Multi-select (PDF, JPG, PNG, XLSX)
    - **Max File Size** — Numeric input (MB)
    - **OCR Auto-Extract** — Toggle (extract data from receipt)
  
**Reimbursement Settings**
- **Reimbursable** — Toggle
    option (Yes/No)
  
- **Payment Mode** — 
  - Bank Transfer (via bank sheet)
  
- **Advance Adjustment** — Yes/No
  - Deduct from pending advance amount
  - Show available advance balance

**Tax & Compliance**
- **Tax Applicable** — Toggle (Yes/No)
  - GST/VAT/Sales Tax tagging
  - Auto-calculate tax amount if rate provided
  
- **Tax Rate** — Numeric input (if applicable)
  - Support for multiple tax components
    
- **TDS Deduction** — Yes/No (for contractor payments)
  
- **Require Tax Invoice Number** — Yes/No
  - GSTIN validation for India

**Splitting & Allocation**
- **Allow Split Across Projects** — Yes/No
  - Distribute single expense across multiple cost centers
  
- **Allow Partial Personal Use** — Yes/No
  - Example: Personal + Business phone bill
  - Define personal % or amount to exclude
  
- **Multi-Department Allocation** — Yes/No
  - Cross-charge to multiple departments (from HRMS)

### 2.6 Claim Frequency Configuration

Control how often employees can submit claims for this category.

**Frequency Definition**
- **Claim Frequency** (mandatory) — Dropdown:
  - Per Transaction (unlimited individual expenses)
  - Daily
  - Weekly
  - Bi-Weekly
  - Monthly
  - Quarterly
  - Half-Yearly
  - Yearly
  - Lifetime (one-time claim)
  - Custom Period (define days)

**Count & Quantity Limits**
- **Maximum Claims Allowed** (mandatory if frequency ≠ Per Transaction)
  - Numeric input
  - Example: 2 claims per month
  
- **Minimum Gap Between Claims** — Numeric input (days/hours)
  - Prevent rapid consecutive submissions
  
- **Maximum Quantity per Claim** — Numeric input
  - Example: Max 5 taxi rides per day
  
- **Waiting Period After Joining** — Numeric input (days)
  - New employees must wait X days before claiming (verified from HRMS join date)

**Reset & Rollover**
- **Unused Claims Rollover** — Yes/No
  - Carry forward to next period
  - Maximum accumulation cap
  
- **Reset on Fiscal Year** — Yes/No
  - Independent of calendar year

### 2.7 Expense Date Rules

Comprehensive date validation for temporal controls.

**Future & Past Date Controls**
- **Allow Future-Dated Expenses** — Toggle (Yes/No)
  - Use case: Pre-booked travel, advance bookings
  
- **Maximum Future Days Allowed** — Numeric input
  - Example: 90 days ahead
  
- **Allow Before Joining Date** — Toggle (Yes/No)
  - Typically No (verified against HRMS join date)
  
- **Allow After Relieving Date** — Toggle (Yes/No)
  - Grace period for final settlements (verified against HRMS exit date)

**Filing Window**
- **Maximum Days to File After Expense Date** — Numeric input
  - Example: Must file within 30 days
  - System blocks submission beyond this
  
- **Minimum Days After Expense Date** — Numeric input
  - Cooling-off period before filing
  
- **Weekend/Holiday Adjustment** — Dropdown
  - Extend deadline if it falls on non-working day (synced with HRMS holiday calendar)
  - Auto-adjust to next working day

**Period Locking**
- **Fiscal Period Lock** — Toggle (Yes/No)
  - Block submissions for closed accounting periods
  
- **Lock Date** — Date picker
  - Manually set cutoff
  
- **Lock Override Authority** — Select roles (from HRMS role master)
  - Who can reopen or bypass locks
  
- **Month-End Cutoff** — Numeric input
  - Auto-lock on Xth day of following month

**Date Validation Rules**
- **Expense Date ≤ Submission Date** — Enforced by default
  
- **Require Date Sequence** — Yes/No
  - Check-in before check-out for lodging
  
- **Max Date Range for Single Expense** — Numeric input
  - Example: Multi-day hotel stay max 30 days
  
- **Block Duplicate Dates** — Yes/No
  - Prevent same-category expense on same date
  
- **Conflict Detection** — Yes/No
  - Flag overlapping travel dates across categories

### 2.8 Mileage-Specific Configuration

**(Only if Expense Type = Mileage-Based)**

**Rate Configuration**
- **Rate per KM/Mile** (mandatory) — Numeric input
  - Supports decimal values (e.g., ₹8.50/km)
  
- **Tiered Rate Structure** — Toggle
  - Define different rates for distance bands
  - Example: First 100km @ ₹10/km, next 100km @ ₹8/km
  
- **Rate Effective Date** — Date picker
  - Maintain historical rates for auditing

**Vehicle Type**
- **Vehicle Type** (mandatory) — Dropdown
  - Car - 4 Wheeler
  - Bike - 2 Wheeler
  - EV - Electric Vehicle
  - Bicycle
  - Scooter/Moped
  - Other (specify)
  
- **Multiple Vehicle Support** — Yes/No
  - Allow employee to claim for different vehicles
  - Separate rates per vehicle type

**Fuel Type**
- **Fuel Type** (mandatory) — Dropdown
  - Petrol
  - Diesel
  - CNG
  - Electric
  - Hybrid
  
- **Fuel Surcharge** — Numeric input (optional)
  - Additional amount per km based on fuel price

**Distance Configuration**
- **Distance Limit (KM/Miles)** — Toggle (Yes/No)
  
  - **If Yes:**
    - **Maximum Distance** (mandatory) — Numeric input
    - **Limit Period** (mandatory) — Dropdown:
      - Per Trip
      - Daily
      - Weekly
      - Monthly
      - Quarterly
      - Half-Yearly
      - Yearly
      - Lifetime
    
- **Minimum Distance for Claim** — Numeric input
  - Ignore trips below threshold (e.g., < 5 km)

**Route & Distance Calculation**
- **Distance Calculation Method** — Dropdown:
  - Employee Self-Declaration
  - Odometer Reading (Start/End)
  - System Predefined Routes
  
- **Allow Manual Distance Override** — Toggle (Yes/No)
  - If No, lock system-calculated distance
  - Requires justification if override allowed
  
- **Route Details Required** — Toggle (Yes/No)
  - From Location (mandatory) - from HRMS locations
  - To Location (mandatory) - from HRMS locations
  - Via Points (optional)
  - Purpose of Travel (dropdown/text)
  
- **Round Trip** — Toggle (Yes/No)
  - Auto-calculate return journey
  - 2x distance for same-day return

**Mileage Claim Validation**
- **Require Odometer Photo** — Yes/No
  - Upload start and end odometer reading images
  
- **Require Fuel Receipt** — Yes/No
  - Link fuel expenses to mileage claims
  
- **Blocked Locations** — Multi-select (from HRMS office locations)
  - Office to Office travel (not reimbursable)
  - Home to Office (standard commute)
  
- **Maximum Claims per Day** — Numeric input
  - Prevent unrealistic multiple trips

**Other Settings**
- Employee filing rules (Description, Receipt, etc.) — Same as Amount-based
- Claim frequency — Same as Amount-based
- Date rules — Same as Amount-based

### 2.9 Per Diem Configuration

**(Only if Expense Type = Per Diem)**

**Per Diem Rate**
- **Rate Type** — Dropdown:
  - Fixed Daily Amount
  - Hourly Rate (for partial days)
  - Meal-based (Breakfast, Lunch, Dinner separate)
  
- **Base Rate** (mandatory) — Numeric input
  - Default daily allowance amount
  
- **Location-Based Rates** — Toggle
  - Define different rates per location group
  - Domestic vs. International
  - City tier-based rates

**Meal Breakdown** (if Meal-based selected)
- **Breakfast Allowance** — Numeric input
- **Lunch Allowance** — Numeric input
- **Dinner Allowance** — Numeric input
- **Snacks/Incidentals** — Numeric input
- **Time-based Entitlement** — Define meal eligibility by time
  - Example: Breakfast if travel starts before 8 AM

**Eligibility & Calculation**
- **Minimum Hours for Full Day** — Numeric input
  - Example: 24 hours = 1 full day
  
- **Partial Day Calculation** — Dropdown:
  - Proportional (hourly basis)
  - Fixed Fraction (Half day / Full day only)
  - Meal count-based
  
- **Include Travel Start/End Days** — Toggle (Yes/No)
  - First and last day treatment
  
- **Maximum Consecutive Days** — Numeric input
  - Auto-reduce rate after X days (long-term assignment)

**Exclusions & Adjustments**
- **Exclude if Accommodation Includes Meals** — Toggle
  - Reduce per diem if hotel provides breakfast
  
- **Company-Provided Meals** — Toggle
  - Deduct if meals arranged by company
  
- **Weekend/Holiday Rate Adjustment** — Numeric input
  - Increase/decrease % for non-working days (from HRMS calendar)

**Documentation**
- **Require Travel Itinerary** — Yes/No
- **Require Proof of Stay** — Yes/No (hotel check-in/out)
- **Manager Attestation** — Yes/No (via HRMS workflow)

**Other Settings**
- Employee filing rules — Same as Amount-based
- Claim frequency — Same as Amount-based
- Date rules — Same as Amount-based

---

## 3) Currency Management

Multi-currency support with exchange rates for international expenses.

### Configuration Fields

**Policy Definition**
- **Policy Name** (mandatory) — Text input
  - Example: "FY 2024-25 Exchange Rates"
  
- **Policy Description** — Textarea
  - Document approval reference, update frequency
  
- **Effective Date** (mandatory) — Date picker
  - When this policy becomes active
  
- **Expiry Date** — Date picker (optional)
  - Auto-archive after expiry

**Base Currency**
- **Base/Home Currency** (mandatory) — Dropdown
  - Organization's default accounting currency (from HRMS)
  - Example: INR, USD, EUR, GBP
  
- **Currency Symbol** — Auto-populated
  
- **Decimal Places** — Dropdown (0, 2, 3)
  - Standard rounding rules

**Exchange Rate Configuration**
- **Add Exchange Currency** — Button

  - **Foreign Currency** (mandatory) — Dropdown
    - ISO 4217 currency codes
    - Search-enabled with currency name
  
  - **Exchange Rate** (mandatory) — Numeric input
    - Rate at which 1 Foreign Currency = X Base Currency
    - Example: 1 USD = 83.25 INR

  - **Default Currency** (mandatory) — Dropdown  
  
  - **Add More Currency** — Button
    - Unlimited currency pairs

  
- **Audit Trail** — Log all rate changes
  - Previous rate, new rate, changed by (from HRMS), timestamp
  
- **Export Functionality** — Download rate history
  - CSV, Excel formats
  - Date range filter

**Notes & Documentation**
- **Admin Notes** — Text area
  - Internal remarks on rate justification
  
- **Employee-Visible Notes** — Text area
  - Guidance on currency selection
  - Rate update notifications

---

## 4) Expense Policy Management

Create expense policies with granular applicability based on HRMS data.

### Configuration Fields

**Policy Identification**
- **Policy Name** (mandatory) — Text input
  - Descriptive and unique name
  - Example: "Sales Team Domestic Travel Policy 2024"
  
- **Policy Code** — Auto-generated or custom
  - Format: POL-XXXX
  
- **Policy Version** — Auto-incremented
  - Maintain version history for compliance
  
- **Effective Date** (mandatory) — Date picker
  - When policy becomes applicable
  
- **Expiry Date** — Date picker (optional)
  - Auto-transition to next policy version

**Policy Description**
- **Policy Summary** — Rich text editor
  - High-level overview for employees
  
- **Detailed Policy Document** — File upload
  - PDF attachment with complete policy
  
- **Policy Owner** — Dropdown (select employee from HRMS)
  - Accountable person for policy queries

### Expense Categories & Limits

**Category Selection**
- **Included Expense Categories** (mandatory) — Multi-select dropdown
  - Select from configured expense categories
  - Grouped display by expense group
  
- **Category-Specific Overrides** — Button to expand per category
  - Override global limits for individual categories
  - Custom filing rules per category within policy

**Overall Policy Limits**
- **Apply Overall Spending Cap** — Toggle (Yes/No)
  
  - **If Yes:**
    - **Limit Amount** (mandatory) — Numeric input
    - **Limit Period** — Dropdown (Monthly/Quarterly/Yearly)
    - **Limit Type** — Dropdown:
      - Total across all categories
      - Per category, all combined
      - Weighted allocation (% to each category)
    
    - **Breach Action** — Dropdown:
      - Block further submissions
      - Allow with justification
      - Auto-escalate via HRMS Workflow
  
### Advanced Settings

**Post-Submission Controls**
- **Allow Edit After Submission** — Toggle (Yes/No)
  - Before approval vs. After approval (separate toggles)
  
- **Editable Fields** — Multi-select (if edit allowed)
  - Select which fields can be modified
  - Always log edits in audit trail
  
- **Allow Delete After Submission** — Toggle (Yes/No)
  - Soft delete vs. Hard delete
  
- **Resubmission Allowed** — Toggle (Yes/No)
  - After rejection, allow resubmit
  - Maximum resubmission attempts — Numeric input

**Report Management**
- **Report Submission Mandatory** — Toggle (Yes/No)
  - Group expenses into reports vs. individual submission
  
- **Minimum Expenses per Report** — Numeric input
  
- **Maximum Expenses per Report** — Numeric input
  
- **Auto-Generate Report** — Toggle (Yes/No)
  - System creates report at period end

**Exceptional Expense Handling**
- **Allow Exceptional Expenses** — Toggle (Yes/No)
  - Outside regular limits with justification
  
  
- **Exceptional Justification Template** — Text area
  - Predefined questions for consistent justification
  
- **Mix Exceptional & Regular** — Toggle (Yes/No)
  - In the same report or separate submission

### Policy Applicability

Define who this policy applies to using HRMS data.


### Advanced Applicability




### Audit & Compliance

**Change Management**
  
- **Change Log** — Auto-maintained
  - Who changed what, when (linked to HRMS users)
  - Before/after comparison
  
- **Version Control** — Automatic versioning
  - Rollback to previous version

---

## 5) General Settings

System-wide configurations for the expense management module.

### Expense Submission Window

**Submission Period**
- **Enforce Submission Window** — Toggle (Yes/No)
  
  - **If Yes:**
    - **Submission Start Day** — Numeric input (1-31)
      - Example: 1st of month
    
    - **Submission End Day** — Numeric input (1-31)
      - Example: 7th of month
    
    - **Block Outside Window** — Toggle (Yes/No)
      - If No, allow with warning
    
    - **Grace Period** — Numeric input (days)
      - Extra days for late submissions with approval

**Exception Handling**
- **Allow Exceptional Submissions** — Toggle (Yes/No)
  - Outside defined window with approval via HRMS workflow

### Date & Time Settings

**Backdating**
- **Maximum Days for Backdated Filing** — Numeric input
  - Example: 90 days in the past


### Distance & Mileage

**System-Calculated Distance**
- **Allow Override** — Toggle (Yes/No)
  
- **Override Requires** — Multi-select:
  - Justification (mandatory comments)
  - Supporting document
  - Manager approval (via HRMS workflow)
  
- **Tolerance Threshold** — Numeric input (%)
  - Allow ±10% without approval

**Route Calculation**
- **Default Route Provider** — Dropdown:
  - Google Maps
  - OpenStreetMap
  - Custom API
  
- **Route Preference** — Dropdown:
  - Shortest distance
  - Fastest route
  - Fuel efficient

### Report Management

**Report Grouping**
- **Allow Multi-Month Reports** — Toggle (Yes/No)
  - Single report spanning multiple months
  
- **Max Months in Single Report** — Numeric input
  
- **Allow Mixed Expense Types** — Toggle (Yes/No)
  - Exceptional + Regular in same report

**Report Submission**
- **Auto-Submit Option** — Toggle (Yes/No)
  - Schedule automatic submission
  
- **Draft Auto-Save** — Toggle (Yes/No)
  - Save every X minutes — Numeric input





### AI & Advanced Features

**AI Limit Advisor**
- **Enable AI Recommendations** — Toggle (Yes/No)
  
  - **Data Points Considered**:
    - Employee's historical spend
    - Department average (from HRMS)
    - Grade/band benchmarks (from HRMS)
    - Location cost of living
  
  - **Recommendation Frequency** — Dropdown:
    - Quarterly review
    - On policy creation
    - On-demand

**Auto Policy Violation Detection**
- **Enable Real-Time Detection** — Toggle (Yes/No)
  
  - **Violation Types Detected**:
    - Amount exceeds limit
    - Missing receipt
    - Duplicate expense
    - Date discrepancies
    - Category mismatch
  
  - **Action on Detection** — Dropdown:
    - Block submission
    - Flag with warning

**OCR Receipt Scanning**
- **Enable OCR** — Toggle (Yes/No)
  
  - **Auto-Extract Fields**:
    - Vendor name
    - Expense date
    - Amount
    - Tax amount
    - Invoice number
  
  - **OCR Provider** — Dropdown:
    - Custom OCR
  
  - **Confidence Threshold** — Numeric slider (50-100%)
    - Below threshold → Manual review required
  
  - **Multi-Language Support** — Toggle (Yes/No)
  


### Audit Trail

**Logging**
- **Audit All Actions** — Toggle (Yes/No) — Recommended: Always Yes
  
  - **Actions Logged**:
    - Expense creation/edit/delete
    - Approval actions
    - Policy changes
    - Configuration updates
    - User actions (linked to HRMS user ID)
  
  - **Retention Period** — Dropdown:
    - 1 year
    - 3 years
    - 5 years
    - 7 years (regulatory compliance)
    - Indefinite
  
  - **Export Audit Logs** — Toggle (Yes/No)
    - CSV/JSON download


  

### User Interface

**Employee Portal Settings**
- **Dark Mode** — Toggle (Yes/No)
  - Allow users to toggle dark/light theme
  
- **Dashboard Widgets** — Drag-drop configurator:
  - Pending approvals
  - Recent expenses
  - Limit utilization
  - Reimbursement status
  
- **Default Currency Display** — Dropdown
  - Show amounts in home currency or original

**Mobile App Settings**
- **Offline Mode** — Toggle (Yes/No)
  - Allow expense creation offline, sync later
  
- **Camera Auto-Launch** — Toggle (Yes/No)
  - Open camera for receipt on add expense
  
- **GPS Auto-Capture** — Toggle (Yes/No)
  - Auto-fill location for mileage

### System Performance

**Batch Processing**
- **Batch Approval Limit** — Numeric input
  - Max expenses in single bulk action
  
- **Report Generation Queue** — Toggle (Yes/No)
  - Queue large reports for background processing

**Data Retention**
- **Soft Delete Period** — Numeric input (days)
  - Before permanent deletion
  
- **Attachment Retention** — Dropdown:
  - Same as expense
  - Indefinite
  - X years

---

## 6) Vendor & Merchant Management

Maintain a database of approved vendors and service providers.

### Vendor Configuration

**Vendor Information**
- **Vendor Name** (mandatory) — Text input
  
- **Vendor Code** — Auto-generated (VEN-XXXX)
  
- **Vendor Type** — Dropdown:
  - Hotel/Accommodation
  - Airline
  - Taxi/Cab Service
  - Restaurant
  - Fuel Station
  - Office Supplies
  - Training Provider
  - Event Venue
  - Other
  
- **Contact Details**:
  - Phone Number
  - Email
  - Website URL
  - Address (Street, City, State, Country, ZIP)
  
- **Tax Information**:
  - GST/VAT Number
  - PAN/Tax ID
  - TDS Applicability — Toggle (Yes/No)

**Vendor Status**
- **Approved Vendor** — Toggle (Yes/No)
  - Only approved vendors selectable in expense filing
  
- **Blacklisted** — Toggle (Yes/No)
  - Block expenses from this vendor
  - Reason for blacklisting — Text area
  
- **Active Status** — Toggle (Yes/No)

**Contracts & Agreements**
- **Corporate Agreement** — Toggle (Yes/No)
  - Negotiated rates with company
  
- **Contract Document** — File upload
  
- **Contract Validity** — Date range (From/To)
  
- **Discount/Rebate %** — Numeric input
  - Track savings on corporate rates

**Payment Terms**
- **Preferred Payment Method** — Dropdown:
  - Direct Vendor Payment (via bank sheet)
  - Employee Reimbursement
  - Corporate Credit Card
  
- **Direct Payment Details** (if applicable):
  - Bank Account Number
  - IFSC/SWIFT Code
  - Beneficiary Name

### Vendor Analytics

**Spend Tracking**
- **Total Spend (MTD/QTD/YTD)** — Auto-calculated dashboard
  
- **Top Spending Employees** — Ranked list (from HRMS)
  
- **Category Breakdown** — Pie chart
  - What expense types from this vendor
  
- **Location Breakdown** — Geo map (from HRMS locations)
  - Where expenses incurred

**Compliance Monitoring**
- **Duplicate Invoice Detection** — Auto-flag same invoice number
  
- **Spending Anomalies** — AI-detected unusual patterns
  
- **Vendor Performance Rating** — Star rating by employees
  - Track quality of service

---

## 7) Project & Cost Center Mapping

Allocate expenses to projects and cost centers for accurate accounting.

### Project Configuration

**Project Details**
- **Project Name** (mandatory) — Text input
  
- **Project Code** (mandatory) — Alphanumeric (unique)
  - Format: PROJ-XXXX
  
- **Project Manager** — Dropdown (select employee from HRMS)
  
- **Department Owner** — Dropdown (from HRMS departments)
  
- **Project Status** — Dropdown:
  - Active
  - On Hold
  - Completed
  - Archived
  
- **Project Budget** — Numeric input
  - Total allocated budget
  
- **Project Duration** — Date range (Start/End)

**Cost Center Mapping**
- **Cost Center Code** — Alphanumeric input
  - Map to accounting system or can sync from HRMS
  
- **GL Account Code** — Text input
  - General ledger mapping

**Project Expense Rules**
- **Allowed Expense Categories** — Multi-select
  - Restrict which categories can be charged
  
- **Requires Project Manager Approval** — Toggle (Yes/No)
  - Additional approval layer (uses HRMS workflow)
  
- **Budget Alert Threshold** — Numeric input (%)
  - Alert when X% budget consumed

### Expense Allocation

**Allocation Methods**
- **Single Project** — Default (100% to one project)
  
- **Multi-Project Split** — Percentage allocation
  - Example: 50% Project A, 50% Project B
  - Total must equal 100%
  
- **Cost Center Split** — Allocate across departments (from HRMS)

**Allocation Rules**
- **Mandatory Project Code** — Toggle (Yes/No)
  - Block expense submission without project
  
- **Default Project** — Dropdown (optional)
  - Auto-fill based on employee's primary project (from HRMS)
  
- **Project Validation** — Check project status
  - Block expenses for inactive/completed projects

### Chargeback & Billing

**Internal Billing**
- **Chargeback to Client** — Toggle (Yes/No)
  - Mark expenses for client invoicing
  
- **Markup %** — Numeric input
  - Add margin on expense reimbursement
  
- **Billable Amount** — Auto-calculated
  - Original Amount + Markup

**Reporting**
- **Project-Wise Expense Report** — Generate per project
  - Total spend, category breakdown, employee-wise (from HRMS)
  
- **Budget Utilization Dashboard** — Real-time tracking
  - Spent vs. Budget, Variance %
  
- **Chargeback Report** — Billable expenses summary
  - Ready for client invoicing

---

## 8) Advance Payment Management

Manage cash advances given to employees before travel or events.

### Advance Request

**Request Configuration**
- **Allow Advance Requests** — Toggle (Yes/No) in Policy settings
  
- **Advance Amount Limit** — Numeric input
  - Maximum advance allowed per employee
  
- **Limit Basis** — Dropdown:
  - Fixed Amount
  - % of Trip Estimate
  - % of Monthly Salary (from HRMS)
  - Grade-Based (from HRMS grade master)

**Request Submission**
- **Advance Purpose** (mandatory) — Text area
  - Travel, Event, Emergency, Other
  
- **Estimated Expense Amount** — Numeric input
  - Justification for advance
  
- **Advance Amount Requested** — Numeric input
  
- **Expense Breakdown** — Table:
  - Category, Estimated Amount
  - Attach supporting documents (quotes, bookings)
  
- **Expected Settlement Date** — Date picker
  - When expense report will be submitted

**Approval Workflow**
- **Advance Approval** — Uses HRMS Workflow
  - Typically Manager + Finance approval
  
- **Fast-Track Advance** — Toggle (Yes/No)
  - Emergency advances approved within X hours

### Advance Disbursement

**Payment Method**
- **Disbursement Mode** — Information only:
  - Via Bank Transfer (bank sheet generation)
  - Will integrate with Payroll module when available
  
- **Payment Timeline** — Numeric input (days)
  - Target to disburse within X working days of approval

**Tracking**
- **Advance Register** — Dashboard view
  - All advances issued, pending settlement
  - Employee details from HRMS
  
- **Overdue Advances** — Auto-alert after settlement date
  - Escalate to manager (via HRMS) and finance

### Advance Settlement

**Settlement Process**
- **Link Expense to Advance** — Dropdown during expense filing
  - Select advance ID to settle against
  
- **Auto-Adjust Amount** — Toggle (Yes/No)
  - Deduct advance from reimbursement
  
- **Settlement Scenarios**:
  - **Actual < Advance** → Employee returns excess
  - **Actual = Advance** → No reimbursement
  - **Actual > Advance** → Company pays difference

**Excess Recovery**
- **Recovery Method** — Dropdown:
  - Salary Deduction (will integrate with Payroll)
  - Cash/Cheque Return
  - Adjust Against Next Advance
  
- **Recovery Timeline** — Numeric input (days)
  - Recover within X days
  
- **Grace Period** — Numeric input (days)
  - Before initiating recovery action

**Reporting**
- **Advance vs. Actual Report** — Comparison dashboard
  - Forecast accuracy tracking
  
- **Pending Settlements** — Aged analysis
  - 30/60/90 days overdue
  
- **Employee Advance History** — Track advance utilization pattern
  - Identify habitual advance requesters

---

## 9) Payment Processing

Process approved expense reimbursements through bank sheets or payroll integration.

### Payment Configuration

**Payment Cycle**
- **Payment Frequency** — Dropdown:
  - Weekly
  - Bi-Weekly
  - Monthly
  - On-Demand
  
- **Payment Day** — Numeric input (1-31)
  - Example: 25th of every month
  
- **Cutoff Day for Payment Cycle** — Numeric input
  - Example: Expenses approved by 20th will be paid on 25th
  
- **Processing Days** — Numeric input
  - Buffer days for payment processing

**Payment Methods**

**A) Bank Sheet Generation** (Current Solution)
- **Bank Sheet Format** — Dropdown:
  - NEFT Format
  - RTGS Format
  - IMPS Format
  - Custom Bank Format
  
- **Bank Sheet Template** — File upload
  - Upload bank-specific Excel/CSV template
  
- **Auto-Generate Bank Sheet** — Toggle (Yes/No)
  - Automatically create on payment date
  
- **Include in Bank Sheet** — Multi-select:
  - Employee Name (from HRMS)
  - Employee Code (from HRMS)
  - Bank Account Number (from HRMS)
  - IFSC Code (from HRMS)
  - Amount
  - Payment Reference Number
  - Narration/Description
  - Department (from HRMS)
  - Cost Center
  
- **Bank Sheet Approval** — Toggle (Yes/No)
  - Require finance approval before download (uses HRMS workflow)
  
- **Download Options** — Multi-select:
  - Excel (.xlsx)
  - CSV
  - Text File (.txt)
  - PDF (for record)







**Status Update**
- **Manual Status Update** — Toggle (Yes/No)
  - Allow finance team to manually update payment status
  
- **Require Payment Reference** — Toggle (Yes/No)
  - When marking as paid, enter transaction reference
  
- **Auto-Notify Employee** — Toggle (Yes/No)
  - Send notification when payment completed (via HRMS notifications)

**Bank Sheet Management**

**Generate Bank Sheet**
- **Filter Criteria**:
  - Date Range (approval date)
  - Department (from HRMS)
  - Location (from HRMS)
  - Payment Mode (Bank Transfer/Salary Credit)
  - Minimum Amount
  - Maximum Amount
  
- **Exclusions**:
  - Already paid expenses
  - Advances to be adjusted
  - Hold/On-hold expenses
  
- **Grouping Options**:
  - By Employee (one row per employee, total amount)
  - By Expense (one row per expense)
  - By Department
  
- **Summary Display** (before generation):
  - Total Number of Employees
  - Total Number of Expenses
  - Total Payment Amount
  - Breakdown by Department

**Bank Sheet Operations**
- **Preview** — View before download
  - Check for errors
  - Verify bank details (from HRMS)
  
- **Download** — Generate file
  - Timestamp added to filename
  - Auto-save copy in system
  
- **Re-Generate** — If corrections needed
  - Make changes and regenerate
  
- **Mark as Processed** — After bank upload
  - Change status to "Payment Initiated"
  - Lock from further modifications
  
- **Upload Bank Confirmation** — File upload (optional)
  - Upload bank success report
  - Auto-match and mark as paid

**Reconciliation**

**Payment Reconciliation**
- **Upload Bank Statement** — File upload
  - Support for Excel, CSV, PDF (with parsing)
  
- **Auto-Match Transactions** — Toggle (Yes/No)
  - Match bank transactions with pending expenses
  - Match on: Account Number, Amount, Date (±2 days)
  
- **Manual Matching** — For unmatched items
  - Display side-by-side: Bank transaction vs. Expense
  - Admin can manually link
  
- **Reconciliation Report** — Generate
  - Matched: X expenses
  - Unmatched: Y expenses
  - Failed: Z transactions
  - Need attention: List

**Failed Payments**
- **Mark as Failed** — Status update
  - Reason for failure — Dropdown:
    - Incorrect Bank Details
    - Insufficient Balance
    - Bank Rejection
    - Account Closed
    - Other (specify)
  
  
- **Notify Employee** — Alert about failed payment
  - Request to update bank details in HRMS

**Advance Adjustment**
- **Auto-Detect Advances** — System checks for pending advances
  - Display advance amount in payment summary
  
- **Adjustment Calculation**:
  - Total Expense Amount
  - Less: Advance Amount
  - Net Payable Amount
  
- **Split Payments**:
  - If expense > advance: Pay difference to employee
  - If expense < advance: Employee owes company (recovery via payroll)

**Payment Reports**
- **Payment Register** — All payments made
  - Date, Employee (from HRMS), Amount, Mode, Status, Reference
  
- **Pending Payments** — Due for payment
  - Aging: 0-7 days, 8-15 days, 16-30 days, >30 days
  
- **Payment Trend Analysis** — Graphical view
  - Monthly payment volume
  - Average payment per employee
  - Category-wise disbursement
  
- **Bank Sheet History** — All generated sheets
  - Date, Number of employees, Total amount, Status

**Notifications** (via HRMS notification system)
- **To Employee**:
  - Expense approved and queued for payment
  - Payment initiated (bank sheet generated)
  - Payment completed (credited to account)
  - Payment failed (with reason)
  
- **To Finance Team**:
  - New expenses ready for payment
  - Bank sheet ready for download
  - Payment failures requiring action
  - Pending reconciliation items

---

## 10) Audit & AI Features

Advanced automation and compliance capabilities.

### AI-Powered Features

**AI Limit Advisor**
- **Intelligent Limit Recommendations** — Machine learning engine
  
  - **Data Sources**:
    - Employee's historical spend
    - Department average (from HRMS)
    - Grade/band benchmarks (from HRMS)
    - Location cost-of-living index
    - Seasonal trends
  
  - **Recommendation Logic**:
    - Predict realistic limits based on role
    - Flag under/over-budgeted categories
  
  - **Advisory Dashboard**:
    - Current vs. Suggested limits
    - Rationale provided
  
  - **Accept/Reject Recommendation** — Admin review

**Auto Policy Violation Detection**
- **Real-Time Violation Scanning** — As expense is submitted
  
  - **Violation Categories**:
    - Amount exceeds limit
    - Missing mandatory receipt
    - Duplicate expense detected
    - Date outside allowed range
    - Category not permitted for employee (based on HRMS data)
    - Vendor not approved
    - Expense date falls on holiday/leave (from HRMS calendar)
    - Frequency limit exceeded
    - Project code invalid/inactive
  
  - **Action on Detection**:
    - **Block Submission** — Hard stop
    - **Flag as Exceptional** — Allow with justification
    - **Auto-Notify** — Alert employee + approver (via HRMS)
  
  - **Violation Severity** — Color-coded:
    - Red (Critical): Block submission
    - Amber (Warning): Flag for approval
    - Yellow (Info): Note for reviewer

**Duplicate Expense Detection**
- **Matching Algorithm** — AI checks for duplicates:
  - Same amount ± 5%
  - Same date or within 2 days
  - Same category
  - Same vendor
  - Same employee (from HRMS)
  
- **Fuzzy Matching** — Catch variations:
  - Vendor name variations
  - Currency conversions
  
- **Action**:
  - Alert employee: "Possible duplicate found"
  - Show matching expense for comparison
  - Allow confirmation

**Spending Anomaly Detection**
- **Behavioral Analysis** — Identify unusual patterns:
  - Sudden spike in expense amount
  - Expense at unusual time
  - Out-of-pattern category
  - Frequency anomaly
  
- **Anomaly Score** — 0-100 risk rating
  - High risk → Auto-flag for audit
  - Medium → Additional approval (via HRMS workflow)
  - Low → Normal processing
  
- **Fraud Indicators**:
  - Rounded amounts
  - Sequential invoice numbers
  - Weekend expense during reported leave (from HRMS)
  - Expense from blacklisted vendor

**Smart Receipt Scanning (OCR)**
- **OCR Provider Integration**
  
  - **Supported Providers**:
    - Custom OCR

  
- **Auto-Extracted Fields**:
  - Merchant/Vendor Name
  - Expense Date
  - Total Amount
  - Tax Amount
  - Invoice Number
  - Payment Method
  
- **Data Validation**:
  - Cross-check with employee input
  - Verify against approved vendor list
  
- **Quality Control**:
  - Flag low-confidence fields
  - Allow manual correction
  - Audit trail maintained

**AI Category Suggestion**
- **Smart Categorization** — Auto-suggest category
  
  - **Input Signals**:
    - Vendor name
    - Description keywords
    - Amount range
    - Location
  
  - **Learning Engine**:
    - Learn from employee's past categorization
    - Department-wide patterns (from HRMS)
    - Company-wide trends
  
  - **User Experience**:
    - Pre-fill category with high confidence
    - Show top suggestions if uncertain

**Predictive Analytics**
- **Expense Forecasting** — Predict future spend
  - Employee-level forecasts
  - Department-level budgets (from HRMS)
  - Seasonality adjustments
  
- **Budget Alerts** — Proactive notifications
  - Projected to exceed budget warnings
  
- **Trend Analysis** — Identify patterns
  - Category-wise spend trends
  - Department comparisons (from HRMS)

### Comprehensive Audit Trail

**Full Activity Logging**
- **Granular Tracking** — Every action recorded
  
  - **User Actions** (linked to HRMS user):
    - Login/Logout
    - Expense creation/edit/delete
    - Submission/withdrawal
    - Document upload/delete
  
  - **Approver Actions** (linked to HRMS):
    - Approval/Rejection
    - Delegation
    - Bulk actions
  
  - **Admin Actions** (linked to HRMS):
    - Policy changes
    - Limit modifications
    - Configuration updates
    - Payment processing
  
  - **System Actions**:
    - Auto-approval triggers
    - Payment status updates
    - Bank sheet generation

**Audit Trail Details**
- **Captured Information**:
  - User ID (from HRMS)
  - Action Type
  - Timestamp
  - IP Address
  - Before/After Values
  - Comments/Reason
  
- **Change History** — Version control
  - Expense edit history
  - Compare versions
  - Rollback capability (admin only)

**Audit Reports**
- **Predefined Reports**:
  - User Activity Summary (per employee from HRMS)
  - Policy Compliance Report
  - Approval Turnaround Time
  - Payment Processing Log
  - Admin Configuration Changes
  
- **Custom Report Builder**:
  - Select fields
  - Apply filters
  - Export to CSV/Excel/PDF
  - Schedule automated delivery

**Compliance Features**
- **Regulatory Alignment**:
  - SOX Compliance
  - GDPR (data privacy)
  - Local tax compliance
  
- **Data Retention**:
  - Configurable retention period
  - Auto-archive old data
  - Tamper-proof storage
  
- **Digital Signatures**:
  - E-sign on approvals
  - Timestamp verification
  
- **Audit Log Immutability**:
  - Write-once, read-many
  - No deletion, only append

### AI-Powered Insights Dashboard

**Executive Dashboard**
- **Real-Time Metrics**:
  - Total Spend (MTD/QTD/YTD)
  - Average Processing Time
  - Approval Rate
  - Payment Status
  - Policy Violation Rate
  
- **Visual Analytics**:
  - Spend by Category (pie chart)
  - Trend Over Time (line graph)
  - Department Comparison (bar chart) - from HRMS
  - Location-Wise Spend (heat map) - from HRMS

**Employee Leaderboard** (from HRMS data)
- **Top Spenders** — Ranked list
  - Total expense amount
  - Number of expenses filed
  
- **Policy Champions** — Highest compliance rate
  
- **Fastest Processors** — Quickest approval turnaround

**Category Analysis**
- **Category-Wise Spend** — Breakdown
  - Percentage distribution
  
- **Budget Utilization** — Per category
  - Spent vs. Budgeted
  - Forecast to year-end
  
- **Trend Analysis** — MoM/QoQ comparison

**Policy Violation Summary**
- **Violation Types** — Frequency chart
  - Missing Receipt
  - Over Limit
  - Late Filing
  - Duplicate
  
- **Violators List** — Repeat offenders (from HRMS)
  - Ranked by violation count
  
- **Violation Trends** — Track improvements

**Payment Metrics**
- **Average Turnaround Time** — Submission to Payment
  - Target vs. Actual
  
- **Payment Status** — Real-time tracker
  - Pending Approval
  - Approved, Pending Payment
  - Payment Initiated
  - Paid
  
- **Payment Delays** — Root cause analysis
  - Identify bottlenecks

**AI Recommendations**
- **Policy Optimization**:
  - Suggested limit adjustments
  - Location-specific recommendations
  
- **Process Improvements**:
  - Workflow optimization suggestions
  - Auto-approval threshold recommendations
  
- **Fraud Prevention**:
  - Suspicious activity alerts
  - Vendor risk warnings

---

## 11) Reports & Analytics

Comprehensive reporting suite for stakeholders.

### Standard Reports

**Expense Summary Report**
- **Filters**:
  - Date Range
  - Department (from HRMS)
  - Employee (from HRMS)
  - Category
  - Status
  - Amount Range
  
- **Output**:
  - Total Expenses
  - Count of Expenses
  - Average Expense Value
  - Breakdown by Category/Department/Employee
  
- **Export**: CSV, Excel, PDF
- **Schedule**: Daily/Weekly/Monthly auto-email (via HRMS)

**Pending Approvals Report**
- **Aging Analysis**:
  - 0-3 days
  - 4-7 days
  - 8-15 days
  - > 15 days
  
- **Approver-Wise Breakdown** (from HRMS):
  - Pending count per approver
  - Highlight bottlenecks
  
- **SLA Compliance**:
  - Within SLA vs. Breached

**Budget Utilization Report**
- **Category-Wise**:
  - Budget, Spent, Available, Utilization %
  
- **Department-Wise** (from HRMS):
  - Overall spend vs. allocated budget
  - Variance analysis
  
- **Project-Wise** (if applicable)

**Payment Status Report**
- **Payment Pipeline**:
  - Submitted
  - Approved
  - Payment Pending
  - Payment Initiated
  - Paid
  
- **Employee-Wise** (from HRMS):
  - Total pending reimbursement
  - Oldest pending expense date
  
- **Payment Delays**:
  - Expenses pending > 30 days
  - Root cause tracking

**Tax Report**
- **GST/VAT Summary**:
  - Total taxable amount
  - Tax collected
  - Input tax credit eligible
  
- **TDS Report**:
  - Vendor-wise TDS deducted
  - Quarter-wise summary
  
- **Tax Exemption Report** (syncs with Payroll):
  - Employee-wise tax-free benefits
  - Limit utilization

**Compliance Report**
- **Policy Violation Details**:
  - Violation type, employee (from HRMS), date, amount
  - Action taken
  
- **Exceptional Expense Report**:
  - All out-of-policy expenses
  - Justifications provided
  
- **Audit Trail Summary**:
  - Key activities in period
  - Admin actions performed

**Vendor Spend Report**
- **Vendor-Wise Total Spend**:
  - Top 10 vendors by amount
  - Category breakdown per vendor
  
- **New Vendors Added**:
  - Track vendor base growth
  
- **Vendor Performance**:
  - Average rating
  - Issue count

**Mileage Report**
- **Total Distance Traveled** (KM)
  - By employee (from HRMS), vehicle type, department
  
- **Total Mileage Reimbursement**
  
- **Route Analysis**:
  - Most frequent routes
  - Longest trips

**Per Diem Report**
- **Total Per Diem Paid**
  - By location, employee (from HRMS), duration
  
- **Meal Breakdown**:
  - Breakfast/Lunch/Dinner counts
  
- **Travel Days**:
  - Total days on travel per employee

**Advance Report**
- **Advance Register**:
  - All advances issued
  - Employee (from HRMS), amount, date, status
  
- **Pending Settlements**:
  - Overdue advances
  - Aged analysis
  
- **Advance vs. Actual**:
  - Comparison of estimated vs. actual spend

**Bank Sheet Report**
- **Generated Bank Sheets**:
  - Date, number of employees, total amount
  - Download link
  


### Custom Report Builder

**Report Designer**
- **Drag-Drop Interface**:
  - Select data fields
  - Add filters and conditions
  - Group by dimensions (Department, Category, Employee from HRMS)
  - Apply calculations
  
- **Available Fields**:
  - Employee details (from HRMS): Name, Code, Department, Grade, Location
  - Expense details: Category, Amount, Date, Status
  - Approval details: Approver (from HRMS), Date, Comments
  - Payment details: Mode, Date, Reference
  - Custom fields
  
- **Calculations**:
  - Sum, Average, Count, Min, Max
  - Running Total, % of Total

**Report Scheduling**
- **Frequency**:
  - Daily/Weekly/Monthly/Quarterly
  - Specific day and time
  
- **Recipients**:
  - Email to specific users (from HRMS)
  - Export to shared drive
  
- **Format**:
  - Excel (with charts)
  - PDF
  - CSV

### Dashboards & Visualizations

**Interactive Dashboards**
- **Drill-Down Capability**:
  - Click on chart to see underlying data
  - Hierarchical exploration (Company → Department → Employee from HRMS)
  
- **Real-Time Updates**:
  - Live data refresh
  - Configurable refresh interval
  
- **Filters**:
  - Date range selector
  - Department/Location filter (from HRMS)
  - Employee search (from HRMS)

**Chart Types**
- Line Chart (trends over time)
- Bar Chart (comparisons)
- Pie Chart (composition)
- Heat Map (geographic/calendar)
- Gauge Chart (target vs. actual)
- Funnel Chart (approval pipeline)

**Dashboard Templates**
- **CFO Dashboard**:
  - Total spend, budget variance
  - Top categories, departments (from HRMS)
  - Payment pending pipeline
  
- **Department Head Dashboard**:
  - Team's expense summary (from HRMS)
  - Pending approvals
  - Policy compliance rate
  
- **Employee Dashboard**:
  - My expenses (submitted/approved/paid)
  - Limit utilization
  - Reimbursement status
