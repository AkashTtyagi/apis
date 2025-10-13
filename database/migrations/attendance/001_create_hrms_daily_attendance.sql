/**
 * Daily Attendance Table
 *
 * Purpose: Stores actual daily attendance records for employees
 *
 * Integration with Workflow:
 * - workflow_master_id = NULL → Regular attendance (punch in/out)
 * - workflow_master_id = 1 → Leave (from workflow request)
 * - workflow_master_id = 2 → On Duty (from workflow request)
 * - workflow_master_id = 3 → WFH (from workflow request)
 *
 * Note: Holidays and Week-offs are NOT stored here (calculated from calendar)
 *
 * Example: Employee applies for 5 days leave
 * → 1 entry in hrms_workflow_requests
 * → 5 entries in hrms_daily_attendance (one per day)
 */

CREATE TABLE IF NOT EXISTS hrms_daily_attendance (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Employee & Company
    employee_id INT NOT NULL,
    company_id INT NOT NULL,

    -- Date
    attendance_date DATE NOT NULL,

    -- Workflow Integration (NULL for regular attendance)
    request_id INT UNSIGNED NULL COMMENT 'FK to hrms_workflow_requests - NULL for regular attendance',
    workflow_master_id INT UNSIGNED NULL COMMENT 'FK to hrms_workflow_master - NULL for regular attendance, 1=Leave, 2=OnDuty, 3=WFH',

    -- Pay Type
    pay_day TINYINT NOT NULL DEFAULT 1 COMMENT '1=Full Day, 2=First Half, 3=Second Half, 4=Unpaid',

    -- Actual Punch Details
    punch_in DATETIME NULL COMMENT 'Actual punch in time',
    punch_out DATETIME NULL COMMENT 'Actual punch out time',
    punch_in_location VARCHAR(500) NULL COMMENT 'Punch in location (lat,long or address)',
    punch_out_location VARCHAR(500) NULL COMMENT 'Punch out location (lat,long or address)',

    -- Shift Details (Expected)
    shift_id INT UNSIGNED NULL COMMENT 'FK to shift master',
    shift_punch_in TIME NULL COMMENT 'Expected shift start time',
    shift_punch_out TIME NULL COMMENT 'Expected shift end time',

    -- Work Hours
    total_hours DECIMAL(5,2) NULL COMMENT 'Total working hours',
    break_hours DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Break time',
    overtime_hours DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Overtime hours',

    -- Late/Early Tracking
    late_by_minutes INT DEFAULT 0 COMMENT 'Minutes late',
    early_out_by_minutes INT DEFAULT 0 COMMENT 'Minutes early out',

    -- Payment
    is_paid BOOLEAN DEFAULT TRUE COMMENT 'Is this day paid or unpaid',

    -- Additional Details
    remarks TEXT NULL,
    leave_type VARCHAR(100) NULL COMMENT 'Type of leave if workflow_master_id = 1',

    -- Approval (for manual/regularization entries)
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INT NULL,
    approved_at DATETIME NULL,

    -- Metadata
    created_by INT NULL,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_employee_date (employee_id, attendance_date),
    INDEX idx_company_date (company_id, attendance_date),
    INDEX idx_request (request_id),
    INDEX idx_workflow_master (workflow_master_id),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_employee_month (employee_id, attendance_date),

    -- Foreign Keys
    CONSTRAINT fk_daily_attendance_employee
        FOREIGN KEY (employee_id)
        REFERENCES hrms_employees(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_daily_attendance_request
        FOREIGN KEY (request_id)
        REFERENCES hrms_workflow_requests(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_daily_attendance_workflow_master
        FOREIGN KEY (workflow_master_id)
        REFERENCES hrms_workflow_master(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_daily_attendance_approved_by
        FOREIGN KEY (approved_by)
        REFERENCES hrms_user_details(id)
        ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Daily attendance records with workflow integration';

-- Note: NO UNIQUE constraint on (employee_id, attendance_date)
-- because multiple entries allowed for same date (regularization scenarios)
