/**
 * Onboarding Service
 * Handles combined company and user onboarding in a single transaction
 */

const { db } = require('../utils/database');
const { sendPasswordSetEmail } = require('./auth.service');
const { HrmsLeaveMaster } = require('../models/HrmsLeaveMaster');
const { HrmsLeavePolicyMaster } = require('../models/HrmsLeavePolicyMaster');
const { HrmsLeavePolicyMapping } = require('../models/HrmsLeavePolicyMapping');
const { HrmsEmployee } = require('../models/HrmsEmployee');
const { copyAllTemplatesToCompany } = require('./companyTemplate.service');
const { createDefaultWorkflows } = require('./workflow/workflowConfig.service');

/**
 * Onboard company and user together in a single transaction
 * Creates company first, then creates user with the company_id
 * @param {Object} data - Onboarding data
 * @param {string} data.org_name - Organization name
 * @param {number} data.country_id - Country ID (used for both company and user)
 * @param {number} data.org_industry - Industry ID (required for department assignment)
 * @param {string} data.first_name - User first name
 * @param {string} [data.middle_name] - User middle name (optional)
 * @param {string} data.last_name - User last name
 * @param {string} data.email - User email
 * @param {string} [data.phone] - User phone (optional)
 * @returns {Promise<Object>} - Created company and user objects
 */
const onboardCompanyAndUser = async (data) => {
    // Start a database transaction using centralized db instance
    const dbTrans = await db.beginTransaction();

    try {
        const {
            org_name,
            country_id,
            org_industry,
            first_name,
            middle_name,
            last_name,
            email,
            phone
        } = data;

        // Step 1: Check if company with this name already exists
        const checkCompanyQuery = 'SELECT id FROM hrms_companies WHERE org_name = ? LIMIT 1';
        const existingCompanies = await dbTrans.execute(checkCompanyQuery, [org_name]);

        if (existingCompanies && existingCompanies.length > 0) {
            // Rollback transaction if company already exists
            await dbTrans.rollback();
            throw new Error('Company with this name already exists');
        }

        // Step 2: Check if user with this email already exists
        const checkUserQuery = 'SELECT id FROM hrms_user_details WHERE email = ? LIMIT 1';
        const existingUsers = await dbTrans.execute(checkUserQuery, [email]);

        if (existingUsers && existingUsers.length > 0) {
            // Rollback transaction if user email already exists
            await dbTrans.rollback();
            throw new Error('User with this email already exists');
        }

        // Step 3: Create the user first (without company_id, will update later)
        // Note: Name fields are stored in hrms_employees table, not in hrms_user_details
        // hrms_user_details only stores authentication and account information
        const createUserQuery = `
        INSERT INTO hrms_user_details (company_id, email, phone, created_at)
        VALUES (0, ?, ?, NOW())
        `;

        const userInsertResult = await dbTrans.execute(createUserQuery, [
            email,
            phone || null
        ]);

        // Step 4: Get the inserted user ID from the result
        const user_id = userInsertResult.insertId;
        console.log(`✓ User created with ID: ${user_id}`);

        // Step 5: Create the company with created_by set to the new user's ID and is_parent_company = 1
        const createCompanyQuery = `
        INSERT INTO hrms_companies (org_name, country_id, org_industry, is_parent_company, created_by, created_at)
        VALUES (?, ?, ?, 1, ?, NOW())
        `;

        const companyInsertResult = await dbTrans.execute(createCompanyQuery, [org_name, country_id, org_industry, user_id]);

        // Step 6: Get the inserted company ID from the result
        const company_id = companyInsertResult.insertId;
        console.log(`✓ Company created with ID: ${company_id}`);

        // Step 7: Update the company record to set parent_enterprise_id equal to company id
        const updateCompanyEntityQuery = `
        UPDATE hrms_companies
        SET parent_enterprise_id = ?
        WHERE id = ?
        `;

        await dbTrans.execute(updateCompanyEntityQuery, [company_id, company_id]);
        console.log(`✓ Company updated with parent_enterprise_id: ${company_id}`);

        // Step 8: Update the user record to set company_id
        const updateUserQuery = `
        UPDATE hrms_user_details
        SET company_id = ?
        WHERE id = ?
        `;

        await dbTrans.execute(updateUserQuery, [company_id, user_id]);
        console.log(`✓ User updated with company_id: ${company_id}`);

        // Step 9: Auto-assign departments based on selected industry
        if (org_industry) {
            // Try to get active departments for the selected industry
            const getDepartmentsQuery = `
            SELECT department_id, department_name
            FROM hrms_department_master
            WHERE industry_id = ? AND is_active = 1
            `;

            let departments = await dbTrans.execute(getDepartmentsQuery, [org_industry]);
            console.log(`✓ Found ${departments.length} active departments for industry ${org_industry}`);

            // If no departments found for specific industry, get generic departments (industry_id IS NULL)
            if (!departments || departments.length === 0) {
                console.log(`⚠ No departments found for industry ${org_industry}, falling back to generic departments`);

                const getGenericDepartmentsQuery = `
                SELECT department_id, department_name
                FROM hrms_department_master
                WHERE industry_id IS NULL AND is_active = 1
                `;

                departments = await dbTrans.execute(getGenericDepartmentsQuery);
                console.log(`✓ Found ${departments.length} generic departments (industry_id = NULL)`);
            }

            // Insert departments into hrms_company_departments
            if (departments && departments.length > 0) {
                const insertDepartmentsQuery = `
                INSERT INTO hrms_company_departments (company_id, department_id, is_active, created_by, created_at)
                VALUES (?, ?, 1, ?, NOW())
                `;

                for (const dept of departments) {
                    await dbTrans.execute(insertDepartmentsQuery, [company_id, dept.department_id, user_id]);
                }

                console.log(`✓ Assigned ${departments.length} departments to company ${company_id}`);
            } else {
                console.log(`⚠ No departments available to assign`);
            }

            // Step 9a: Auto-assign designations based on selected industry
            const getDesignationsQuery = `
            SELECT designation_id, designation_code, designation_name, description, level
            FROM hrms_designation_master
            WHERE industry_id = ? AND is_active = 1
            `;

            let designations = await dbTrans.execute(getDesignationsQuery, [org_industry]);
            console.log(`✓ Found ${designations.length} active designations for industry ${org_industry}`);

            // If no designations found for specific industry, get generic designations (industry_id IS NULL)
            if (!designations || designations.length === 0) {
                console.log(`⚠ No designations found for industry ${org_industry}, falling back to generic designations`);

                const getGenericDesignationsQuery = `
                SELECT designation_id, designation_code, designation_name, description, level
                FROM hrms_designation_master
                WHERE industry_id IS NULL AND is_active = 1
                `;

                designations = await dbTrans.execute(getGenericDesignationsQuery);
                console.log(`✓ Found ${designations.length} generic designations (industry_id = NULL)`);
            }

            // Insert designations into hrms_company_designations
            if (designations && designations.length > 0) {
                const insertDesignationsQuery = `
                INSERT INTO hrms_company_designations
                (company_id, designation_master_id, designation_code, designation_name, job_description, is_active, created_by, created_at)
                VALUES (?, ?, ?, ?, ?, 1, ?, NOW())
                `;

                for (const desig of designations) {
                    await dbTrans.execute(insertDesignationsQuery, [
                        company_id,
                        desig.designation_id,
                        desig.designation_code,
                        desig.designation_name,
                        desig.description || null,
                        user_id
                    ]);
                }

                console.log(`✓ Assigned ${designations.length} designations to company ${company_id}`);
            } else {
                console.log(`⚠ No designations available to assign`);
            }

            // Step 9b: Auto-assign skills based on selected industry
            const getSkillsQuery = `
            SELECT id, skill_code, skill_name, skill_category, description, is_statutory
            FROM hrms_statutory_skills_master
            WHERE industry_id = ? AND is_active = 1
            `;

            let skills = await dbTrans.execute(getSkillsQuery, [org_industry]);
            console.log(`✓ Found ${skills.length} active skills for industry ${org_industry}`);

            // If no skills found for specific industry, get generic skills (industry_id IS NULL)
            if (!skills || skills.length === 0) {
                console.log(`⚠ No skills found for industry ${org_industry}, falling back to generic skills`);

                const getGenericSkillsQuery = `
                SELECT id, skill_code, skill_name, skill_category, description, is_statutory
                FROM hrms_statutory_skills_master
                WHERE industry_id IS NULL AND is_active = 1
                `;

                skills = await dbTrans.execute(getGenericSkillsQuery);
                console.log(`✓ Found ${skills.length} generic skills (industry_id = NULL)`);
            }

            // Insert skills into hrms_company_skills
            if (skills && skills.length > 0) {
                const insertSkillsQuery = `
                INSERT INTO hrms_company_skills
                (company_id, statutory_skill_id, skill_code, skill_name, skill_category, description, is_active, created_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 1, ?, NOW())
                `;

                for (const skill of skills) {
                    await dbTrans.execute(insertSkillsQuery, [
                        company_id,
                        skill.id,
                        skill.skill_code,
                        skill.skill_name,
                        skill.skill_category || null,
                        skill.description || null,
                        user_id
                    ]);
                }

                console.log(`✓ Assigned ${skills.length} skills to company ${company_id}`);
            } else {
                console.log(`⚠ No skills available to assign`);
            }
        }

        // Step 10: Create employee record from user (INSIDE transaction)
        // Pass the Sequelize transaction to Sequelize methods
        console.log(`Creating employee record...`);
        const employee = await createEmployeeFromUser(
            company_id, user_id, first_name, middle_name, last_name, email, phone,
            dbTrans.trans_id  // Pass Sequelize transaction
        );
        console.log(`✓ Employee created with ID: ${employee.id}`);

        // Step 11: Create default leave policy with all default leave types (INSIDE transaction)
        console.log(`Creating default leave policy...`);
        const policyResult = await createDefaultLeavePolicy(
            company_id, user_id,
            dbTrans.trans_id  // Pass Sequelize transaction
        );
        const policy = policyResult.policy;
        console.log(`✓ Default leave policy created with ID: ${policy.id}`);

        // Step 12: Assign policy to employee (INSIDE transaction)
        console.log(`Assigning leave policy to employee...`);
        await assignPolicyToEmployee(
            employee.id, policy.id,
            dbTrans.trans_id  // Pass Sequelize transaction
        );
        console.log(`✓ Leave policy ${policy.id} assigned to employee ${employee.id}`);

        // Step 13: Copy all default templates to company (INSIDE transaction)
        console.log(`Copying default templates to company...`);
        const templateCopyResult = await copyAllTemplatesToCompany(
            company_id, user_id,
            dbTrans.trans_id  // Pass Sequelize transaction
        );
        console.log(`✓ Templates copied: ${templateCopyResult.templates_copied} templates, ${templateCopyResult.total_sections} sections, ${templateCopyResult.total_fields} fields`);

        // Step 14: Create default workflows for all workflow types (INSIDE transaction)
        console.log(`Creating default workflows for all workflow types...`);
        const workflowResult = await createDefaultWorkflows(
            company_id, user_id,
            dbTrans.trans_id  // Pass Sequelize transaction
        );
        console.log(`✓ Workflows created: ${workflowResult.created_count} workflows configured`);

        // Commit the transaction (ALL operations successful)
        await dbTrans.commit();
        console.log(`✓ Transaction committed successfully`);

        // Get the created company data
        const getCompanyQuery = 'SELECT * FROM hrms_companies WHERE id = ?';
        const companyResults = await db.execute(getCompanyQuery, [company_id]);
        const company = companyResults[0];

        // Get the created user data
        const getUserQuery = 'SELECT * FROM hrms_user_details WHERE id = ?';
        const userResults = await db.execute(getUserQuery, [user_id]);
        const user = userResults[0];

        // Send password set email to the new user
        try {
            await sendPasswordSetEmail(user_id);
            console.log(`✓ Password set email sent to ${user.email}`);
        } catch (emailError) {
            console.error('Warning: Failed to send password set email:', emailError.message);
            // Don't fail the entire onboarding if email fails
        }

        // Return company, user, employee, template, and workflow data
        return {
            company: company,
            user: user,
            employee: employee,
            templates: templateCopyResult,
            workflows: workflowResult
        };
    } catch (error) {
        // Rollback transaction on any error
        try {
            await dbTrans.rollback();
        } catch (rollbackError) {
            console.error('Rollback error:', rollbackError.message);
        }
        console.error('Service - Onboard company and user error:', error.message);
        throw error;
    }
};

/**
 * Create default leave policy with all default leave types
 * This is called automatically during company onboarding
 * Clones leave types from master (company_id = 0) to company
 * @param {number} company_id - Company ID
 * @param {number} user_id - User ID who created the company
 * @param {Object} transaction - Sequelize transaction object
 */
const createDefaultLeavePolicy = async (company_id, user_id, transaction = null) => {
    try {
        // Step 1: Get all default leave types (company_id = 0)
        const defaultLeaveTypes = await HrmsLeaveMaster.findAll({
            where: {
                company_id: 0,
                is_active: true
            },
            raw: true,
            transaction  // Pass transaction to Sequelize
        });

        if (!defaultLeaveTypes || defaultLeaveTypes.length === 0) {
            throw new Error('No default leave types found. Please run seed data first.');
        }

        console.log(`Found ${defaultLeaveTypes.length} default leave types to clone`);

        // Step 2: Clone leave types for the company
        const clonedLeaveTypes = [];

        for (const masterLeave of defaultLeaveTypes) {
            // Create a copy of the leave type for this company
            const clonedLeave = await HrmsLeaveMaster.create({
                master_id: masterLeave.id,  // Store master leave ID
                company_id: company_id,      // New company ID
                leave_code: masterLeave.leave_code,
                leave_name: masterLeave.leave_name,
                leave_cycle_start_month: masterLeave.leave_cycle_start_month,
                leave_cycle_end_month: masterLeave.leave_cycle_end_month,
                leave_type: masterLeave.leave_type,
                is_encashment_allowed: masterLeave.is_encashment_allowed,
                applicable_to_esi: masterLeave.applicable_to_esi,
                applicable_to_status: masterLeave.applicable_to_status,
                applicable_to_gender: masterLeave.applicable_to_gender,
                credit_frequency: masterLeave.credit_frequency,
                credit_day_of_month: masterLeave.credit_day_of_month,
                number_of_leaves_to_credit: masterLeave.number_of_leaves_to_credit,
                active_leaves_to_credit: masterLeave.active_leaves_to_credit,
                probation_leaves_to_credit: masterLeave.probation_leaves_to_credit,
                intern_leaves_to_credit: masterLeave.intern_leaves_to_credit,
                contractor_leaves_to_credit: masterLeave.contractor_leaves_to_credit,
                separated_leaves_to_credit: masterLeave.separated_leaves_to_credit,
                credit_only_married: masterLeave.credit_only_married,
                round_off_credited_leaves: masterLeave.round_off_credited_leaves,
                lapse_balance_before_next_cycle: masterLeave.lapse_balance_before_next_cycle,
                can_request_half_day: masterLeave.can_request_half_day,
                can_employee_request: masterLeave.can_employee_request,
                max_requests_per_tenure: masterLeave.max_requests_per_tenure,
                max_requests_per_month: masterLeave.max_requests_per_month,
                min_leaves_per_request: masterLeave.min_leaves_per_request,
                max_continuous_leave: masterLeave.max_continuous_leave,
                max_leaves_per_year: masterLeave.max_leaves_per_year,
                max_leaves_per_month: masterLeave.max_leaves_per_month,
                backdated_leave_allowed: masterLeave.backdated_leave_allowed,
                days_allowed_for_backdated_leave: masterLeave.days_allowed_for_backdated_leave,
                future_dated_leave_allowed: masterLeave.future_dated_leave_allowed,
                manager_can_apply_future_dated: masterLeave.manager_can_apply_future_dated,
                manager_can_apply_backdated: masterLeave.manager_can_apply_backdated,
                days_allowed_manager_backdated: masterLeave.days_allowed_manager_backdated,
                document_required: masterLeave.document_required,
                raise_leave_after_attendance_process: masterLeave.raise_leave_after_attendance_process,
                restrict_if_resignation_pending: masterLeave.restrict_if_resignation_pending,
                restrict_after_joining_period: masterLeave.restrict_after_joining_period,
                max_leaves_to_carry_forward: masterLeave.max_leaves_to_carry_forward,
                max_carry_forward_count: masterLeave.max_carry_forward_count,
                carry_forward_method: masterLeave.carry_forward_method,
                carry_forward_in_same_cycle: masterLeave.carry_forward_in_same_cycle,
                carry_forward_same_cycle_count: masterLeave.carry_forward_same_cycle_count,
                is_active: true,
                created_by: user_id
            }, { transaction });

            clonedLeaveTypes.push(clonedLeave);
        }

        console.log(`✓ Cloned ${clonedLeaveTypes.length} leave types for company ${company_id}`);

        // Step 3: Create default leave policy
        const policy = await HrmsLeavePolicyMaster.create({
            company_id,
            policy_name: 'General Leave Policy',
            policy_description: 'Default leave policy with all standard leave types',
            is_active: true,
            created_by: user_id
        }, { transaction });  // Pass transaction to Sequelize

        console.log(`✓ Leave policy created with ID: ${policy.id}`);

        // Step 4: Create mappings for cloned leave types
        const mappings = clonedLeaveTypes.map((clonedLeave, index) => ({
            policy_id: policy.id,
            leave_type_id: clonedLeave.id,  // Use cloned leave ID, not master ID
            display_order: index + 1,
            is_active: true
        }));

        await HrmsLeavePolicyMapping.bulkCreate(mappings, { transaction });  // Pass transaction to Sequelize

        console.log(`✓ ${mappings.length} cloned leave types mapped to policy`);

        return {
            policy,
            leaveTypesCount: clonedLeaveTypes.length
        };
    } catch (error) {
        console.error('Error creating default leave policy:', error.message);
        throw error;
    }
};

/**
 * Create employee record from user
 * @param {number} company_id - Company ID
 * @param {number} user_id - User ID
 * @param {string} first_name - First name
 * @param {string} middle_name - Middle name
 * @param {string} last_name - Last name
 * @param {string} email - Email
 * @param {string} phone - Phone
 * @param {Object} transaction - Sequelize transaction object
 * @returns {Object} Created employee
 */
const createEmployeeFromUser = async (company_id, user_id, first_name, middle_name, last_name, email, phone, transaction = null) => {
    try {
        // Generate employee code (you can customize this logic)
        const employee_code = `EMP${user_id.toString().padStart(5, '0')}`;

        const employee = await HrmsEmployee.create({
            company_id,
            user_id,
            employee_code,
            first_name,
            middle_name: middle_name || null,
            last_name: last_name || null,
            email,
            phone: phone || null,
            status: 0, // 0 = Active (from hrms_employee_status_master)
            is_active: true,
            created_by: user_id
        }, { transaction });  // Pass transaction to Sequelize

        return employee;
    } catch (error) {
        console.error('Error creating employee:', error.message);
        throw error;
    }
};

/**
 * Assign leave policy to employee
 * @param {number} employee_id - Employee ID
 * @param {number} policy_id - Policy ID
 * @param {Object} transaction - Sequelize transaction object
 */
const assignPolicyToEmployee = async (employee_id, policy_id, transaction = null) => {
    try {
        await HrmsEmployee.update(
            { leave_policy_id: policy_id },
            {
                where: { id: employee_id },
                transaction  // Pass transaction to Sequelize
            }
        );

        console.log(`✓ Policy ${policy_id} assigned to employee ${employee_id}`);
    } catch (error) {
        console.error('Error assigning policy to employee:', error.message);
        throw error;
    }
};

module.exports = {
    onboardCompanyAndUser,
    createDefaultLeavePolicy,
    createEmployeeFromUser,
    assignPolicyToEmployee
};
