1) Location Group Management

Used to configure geographical clusters (Country, State, City) to apply location-based expense limits and policies.

Configuration Fields

Group Name (mandatory) — Input box

Group Code (mandatory) — Input box (unique identifier)

Country (multi-select dropdown) — Select one or more countries

State(s) (multi-select dropdown) — Dependent on selected country

City(ies) (multi-select dropdown) — Dependent on selected state

Active Status — Toggle Yes/No

Use:
These groups are linked when defining expense category limits or policy applicability for specific locations.

2) Expense Category Management

Defines each expense head type (e.g., Food, Lodging, Cab, Fuel, etc.) with all its configurations, filing rules, and limit logic.

2.1 Expense Type

Select type of expense category to define its behavior:

a) Amount-based

b) Mileage-based

c) Per Diem (optional future)

2.2 Expense Info (Common for All Types)

Expense Category Name (mandatory) — Input box

Expense Group (mandatory) — Dropdown (select or create new)

Expense Code (mandatory) — Input box (unique)

Category Description — Textarea

Active Status — Toggle Yes/No

2.3 Custom Fields Configuration

Define additional information to be captured at the time of expense filing.

Field Name (mandatory) — Input box

Field Type (mandatory) — Options:

Textbox

Textarea

Date

Dropdown

Multi-select dropdown

File upload (optional — e.g., for supporting documents)

Is Mandatory — Yes / No

Dropdown / Multi-select values (mandatory if applicable) — Comma-separated input box

Add More Fields — Button to add unlimited fields dynamically

2.4 Expense Limit Configuration

Defines spending limits applicable for this expense category.

Choose Limit Type:

a) Global Limit (Applicable to all locations)

b) Location-based Limit

c) No Limit

If (a) Global Limit selected

Limit Type — Choose:

Amount

% of CTC

Limit Value (mandatory) — Input box (numeric)

Period (mandatory) — Dropdown:

Daily

Weekly

Monthly

Quarterly

Half Yearly

Yearly

Lifetime

If (b) Location-based Limit selected

Location Group (mandatory) — Dropdown (list of created location groups)

Limit Amount (mandatory) — Input box

Period (mandatory) — Dropdown (same as above)

Add More Location Limit — Button (add multiple groups with different limits)

2.5 Employee Expense Filing Rules

Configure behavior and conditions at employee submission time.

Allow user to file as exceptional if out of limit? — Yes / No

Description required? — Yes / No

Receipt required? — Yes / No

If Yes →
a) Minimum expense limit for mandatory receipt? — Yes / No

If Yes → Specify limit amount (mandatory)

Reimbursable? — Checkbox

(If disabled, employee cannot mark the expense as reimbursable)

Tax Applicable? — Yes / No (used for GST/VAT tagging)

2.6 Claim Frequency Configuration

Define how often this expense can be claimed.

Claim Frequency (mandatory) — Choose:

Daily

Weekly

Monthly

Quarterly

Half-Yearly

Yearly

Lifetime

If frequency ≠ Lifetime →
Specify Claim Count (mandatory) — Numeric input box

2.7 Expense Date Rules

Rules to control date validation when user submits expenses.

Allow user to file for future date — Yes / No

Allow user to file before joining date — Yes / No

Allow user to file after relieving date — Yes / No

Maximum days allowed to file expense after expense date — Input box (numeric)

Fiscal period lock — Optional Yes/No (block submission after accounting close)

2.8 Mileage-Specific Configuration (if Expense Type = Mileage)

Rate per KM (mandatory) — Numeric input box

Specify distance limit (KM)? — Yes / No

If Yes →
a) Distance Limit (KM) (mandatory) — Numeric input box
b) KM Limit Period (mandatory) — Dropdown:

Day

Week

Month

Quarter

Half Year

Year

Lifetime

Vehicle Type — Dropdown (Car / Bike / EV / Other)

Fuel Type — Dropdown (Petrol / Diesel / Electric)

Other settings (Employee Rules, Claim Frequency, and Date Rules) remain same as in “Amount” type.

3) Currency Management

Manage organization-wide multi-currency reimbursement and exchange rate policies.

Configuration Fields

Policy Name (mandatory) — Input box

Effective Date (mandatory) — Date picker

Base Currency (mandatory) — Dropdown (default company currency)

Add Exchange Currency —

Exchange Currency (mandatory) — Dropdown (list of currencies)

Exchange Rate (mandatory) — Numeric input

Effective From — Date picker

Effective To — Date picker (optional)

Add More Currency — Button (add multiple currency lines)

Auto Sync Exchange Rate (Pro feature) — Toggle (fetch via API e.g. Fixer.io)

Notes — Input box (to record any remarks or update logs)

4) Expense Policy Management

Used to define how expense categories, limits, and filing rules apply to employees or departments.

Configuration Fields

Policy Name (mandatory) — Input box

Effective Date (mandatory) — Date picker

Expense Categories (mandatory) — Multi-select dropdown (list of created categories)

Approval Workflow — Dropdown (1 level / 2 level / Finance approval etc.)

Advance Settings

Allow employees to edit after submission — Yes / No

Allow employees to delete after submission — Yes / No

Apply overall limit across all categories — Yes / No

If Yes → Specify Limit Amount (mandatory)

Applicability

By Department (multi-select dropdown)

By Designation / Grade / Band

By Location Group

By Employment Type (Permanent / Intern / Contract)

Advanced Applicability (Pro)

Conditional rule builder:
Example → “If Department = Sales and Location = Delhi → Limit ₹10,000/month”

5) General Settings

Configure how the expense report and claims system will behave globally.

Expense report submission window — Yes / No

If Yes →
a) Submission Start Day Number — Input box
b) Submission End Day Number — Input box

Maximum days allowed for backdated expense filing — Input box (numeric)

Allow user to edit system-calculated distance (for mileage) — Yes / No

Allow employees to submit expenses from multiple months in a single report — Yes / No

Allow exceptional and regular expenses together in the same report — Yes / No

Auto reject pending requests after (X) days (Pro) — Numeric input

Enable AI Insights / Auto Violation Detection (Pro) — Toggle

Enable OCR Receipt Scan for Auto Reading (Pro) — Toggle

Notification Mode — Multi-select: Email / WhatsApp / Slack / In-App

6) Audit & AI Features (Pro)

AI Limit Advisor — Suggest limit based on employee’s grade, history, and department.

Auto Policy Violation Detection — Flags exceptions in real-time.

OCR-Based Receipt Scanning — Auto reads amount/date/vendor from uploaded receipts.

Full Audit Trail — Track all config and claim edits with timestamp + user ID.

Analytics Dashboard —

Expense trend by category

Employee spend leaderboard

Policy violations summary

Reimbursement turnaround time