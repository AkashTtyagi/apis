/**
 * Employee Service
 * Handles employee creation, update, and retrieval
 * Manages both hrms_employees table and hrms_template_responses
 */

const { HrmsEmployee } = require('../models/HrmsEmployee');
const { HrmsTemplateResponse } = require('../models/HrmsTemplateResponse');
const { HrmsTemplateField } = require('../models/HrmsTemplateField');
const { HrmsUserDetails } = require('../models/HrmsUserDetails');
const { sequelize } = require('../utils/database');
const { validateFields } = require('../utils/fieldValidator');
const { Op } = require('sequelize');

/**
 * Create new employee with template responses
 * Also creates user in hrms_user_details (without password - will be set via activation)
 *
 * @param {Object} employeeData - Employee data
 * @param {Object} employeeData.directFields - Direct employee fields (for hrms_employees table)
 * @param {Object} employeeData.templateFields - Template field responses (for hrms_template_responses table)
 * @param {number} employeeData.template_id - Template ID
 * @param {number} employeeData.user_id - User ID who is creating
 * @param {number} employeeData.company_id - Company ID from logged-in user
 * @returns {Object} Created employee with responses
 */
const createEmployee = async (employeeData) => {
    const { directFields, templateFields, template_id, user_id, company_id } = employeeData;

    const transaction = await sequelize.transaction();

    try {
        // Validate template fields if provided
        if (templateFields && Object.keys(templateFields).length > 0) {
            const fieldIds = Object.keys(templateFields);
            const fields = await HrmsTemplateField.findAll({
                where: {
                    id: { [Op.in]: fieldIds },
                    is_active: true
                },
                raw: true
            });

            const validation = validateFields(fields, templateFields);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
            }
        }

        // Create user in hrms_user_details (without password)
        const userDetails = await HrmsUserDetails.create(
            {
                company_id: company_id,
                first_name: directFields.first_name,
                middle_name: directFields.middle_name || null,
                last_name: directFields.last_name || null,
                email: directFields.email,
                phone: directFields.phone || null,
                is_password_set: false
            },
            { transaction }
        );

        // Create employee record
        const employee = await HrmsEmployee.create(
            {
                company_id: company_id,
                user_id: userDetails.id,
                employee_code: directFields.employee_code,
                first_name: directFields.first_name,
                middle_name: directFields.middle_name || null,
                last_name: directFields.last_name || null,
                email: directFields.email,
                phone: directFields.phone || null,
                date_of_birth: directFields.date_of_birth || null,
                gender: directFields.gender || null,
                date_of_joining: directFields.date_of_joining || null,
                department_id: directFields.department_id,
                sub_department_id: directFields.sub_department_id || null,
                designation_id: directFields.designation_id || null,
                reporting_manager_id: directFields.reporting_manager_id || null,
                leave_policy_id: directFields.leave_policy_id || null,
                shift_id: directFields.shift_id || null,
                timezone_id: directFields.timezone_id || null,
                employment_type: directFields.employment_type || 'full_time',
                status: directFields.status || 0,
                profile_picture: directFields.profile_picture || null,
                is_deleted: 0,
                created_by: user_id
            },
            { transaction }
        );

        // Save template field responses if provided
        if (templateFields && Object.keys(templateFields).length > 0) {
            const responseData = Object.keys(templateFields).map(field_id => ({
                company_id: company_id,
                template_id: template_id,
                entity_type: 'employee',
                record_id: employee.id,
                field_id: parseInt(field_id),
                field_value: templateFields[field_id],
                created_by: user_id
            }));

            await HrmsTemplateResponse.bulkCreate(responseData, { transaction });
        }

        await transaction.commit();

        return {
            employee,
            user_id: userDetails.id,
            message: 'Employee created successfully'
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Update employee with template responses
 *
 * @param {number} employee_id - Employee ID
 * @param {Object} updateData - Update data
 * @param {Object} updateData.directFields - Direct employee fields
 * @param {Object} updateData.templateFields - Template field responses
 * @param {number} updateData.template_id - Template ID
 * @param {number} updateData.user_id - User ID who is updating
 * @param {number} updateData.company_id - Company ID from logged-in user
 * @returns {Object} Update result
 */
const updateEmployee = async (employee_id, updateData) => {
    const { directFields, templateFields, template_id, user_id, company_id } = updateData;

    const transaction = await sequelize.transaction();

    try {
        // Get existing employee
        const employee = await HrmsEmployee.findOne({
            where: {
                id: employee_id,
                company_id: company_id
            },
            transaction,
            raw: true
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        // Validate template fields if provided
        if (templateFields && Object.keys(templateFields).length > 0) {
            const fieldIds = Object.keys(templateFields);
            const fields = await HrmsTemplateField.findAll({
                where: {
                    id: { [Op.in]: fieldIds },
                    is_active: true
                },
                raw: true
            });

            const validation = validateFields(fields, templateFields);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
            }
        }

        // Update employee record
        await HrmsEmployee.update(
            {
                ...(directFields.employee_code !== undefined && { employee_code: directFields.employee_code }),
                ...(directFields.first_name !== undefined && { first_name: directFields.first_name }),
                ...(directFields.middle_name !== undefined && { middle_name: directFields.middle_name }),
                ...(directFields.last_name !== undefined && { last_name: directFields.last_name }),
                ...(directFields.email !== undefined && { email: directFields.email }),
                ...(directFields.phone !== undefined && { phone: directFields.phone }),
                ...(directFields.date_of_birth !== undefined && { date_of_birth: directFields.date_of_birth }),
                ...(directFields.gender !== undefined && { gender: directFields.gender }),
                ...(directFields.date_of_joining !== undefined && { date_of_joining: directFields.date_of_joining }),
                ...(directFields.department_id !== undefined && { department_id: directFields.department_id }),
                ...(directFields.sub_department_id !== undefined && { sub_department_id: directFields.sub_department_id }),
                ...(directFields.designation_id !== undefined && { designation_id: directFields.designation_id }),
                ...(directFields.reporting_manager_id !== undefined && { reporting_manager_id: directFields.reporting_manager_id }),
                ...(directFields.leave_policy_id !== undefined && { leave_policy_id: directFields.leave_policy_id }),
                ...(directFields.shift_id !== undefined && { shift_id: directFields.shift_id }),
                ...(directFields.timezone_id !== undefined && { timezone_id: directFields.timezone_id }),
                ...(directFields.employment_type !== undefined && { employment_type: directFields.employment_type }),
                ...(directFields.status !== undefined && { status: directFields.status }),
                ...(directFields.profile_picture !== undefined && { profile_picture: directFields.profile_picture }),
                updated_by: user_id
            },
            {
                where: { id: employee_id },
                transaction
            }
        );

        // Update template field responses if provided
        if (templateFields && Object.keys(templateFields).length > 0) {
            for (const field_id of Object.keys(templateFields)) {
                const existingResponse = await HrmsTemplateResponse.findOne({
                    where: {
                        company_id: employee.company_id,
                        entity_type: 'employee',
                        record_id: employee_id,
                        field_id: parseInt(field_id)
                    },
                    transaction,
                    raw: true
                });

                if (existingResponse) {
                    // Update existing response
                    await HrmsTemplateResponse.update(
                        {
                            field_value: templateFields[field_id],
                            updated_by: user_id
                        },
                        {
                            where: { id: existingResponse.id },
                            transaction
                        }
                    );
                } else {
                    // Create new response
                    await HrmsTemplateResponse.create(
                        {
                            company_id: employee.company_id,
                            template_id: template_id,
                            entity_type: 'employee',
                            record_id: employee_id,
                            field_id: parseInt(field_id),
                            field_value: templateFields[field_id],
                            created_by: user_id
                        },
                        { transaction }
                    );
                }
            }
        }

        await transaction.commit();

        return {
            message: 'Employee updated successfully'
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get employee by ID with template responses
 *
 * @param {number} employee_id - Employee ID
 * @param {number} company_id - Company ID from logged-in user
 * @param {boolean} includeTemplateFields - Include template field responses
 * @returns {Object} Employee data with template responses
 */
const getEmployeeById = async (employee_id, company_id, includeTemplateFields = true) => {
    const employee = await HrmsEmployee.findOne({
        where: {
            id: employee_id,
            company_id: company_id
        },
        raw: true
    });

    if (!employee) {
        throw new Error('Employee not found');
    }

    if (!includeTemplateFields) {
        return { employee };
    }

    // Get template responses
    const responses = await HrmsTemplateResponse.findAll({
        where: {
            company_id: employee.company_id,
            entity_type: 'employee',
            record_id: employee_id
        },
        raw: true
    });

    // Get field metadata
    if (responses.length > 0) {
        const fieldIds = responses.map(r => r.field_id);
        const fields = await HrmsTemplateField.findAll({
            where: {
                id: { [Op.in]: fieldIds }
            },
            raw: true
        });

        const templateFields = responses.map(response => {
            const field = fields.find(f => f.id === response.field_id);
            return {
                field_id: response.field_id,
                field_slug: field?.field_slug || null,
                field_label: field?.field_label || null,
                field_type: field?.field_type || null,
                field_value: response.field_value
            };
        });

        return {
            employee,
            templateFields
        };
    }

    return {
        employee,
        templateFields: []
    };
};

/**
 * Get all employees for a company
 *
 * @param {number} company_id - Company ID
 * @param {Object} filters - Filter options
 * @returns {Array} List of employees
 */
const getEmployeesByCompany = async (company_id, filters = {}) => {
    const whereClause = {
        company_id: company_id
    };

    if (filters.status) {
        whereClause.status = filters.status;
    }

    if (filters.department_id) {
        whereClause.department_id = filters.department_id;
    }

    if (filters.sub_department_id) {
        whereClause.sub_department_id = filters.sub_department_id;
    }

    if (filters.designation_id) {
        whereClause.designation_id = filters.designation_id;
    }

    if (filters.is_deleted !== undefined) {
        whereClause.is_deleted = filters.is_deleted;
    }

    const employees = await HrmsEmployee.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        raw: true
    });

    return employees;
};

/**
 * Get logged-in user details with employee information
 *
 * @param {number} user_id - User ID from auth token
 * @returns {Object} User details with employee information
 */
const getLoggedInUserDetails = async (user_id) => {
    // Get user details with employee in a single query
    const userDetails = await HrmsUserDetails.findOne({
        where: { id: user_id },
        attributes: ['id', 'company_id', 'email', 'phone', 'created_at'],
        include: [
            {
                model: HrmsEmployee,
                as: 'employee',
                where: {
                    status: { [Op.notIn]: [3, 4, 5, 6] }
                },
                required: true
            }
        ]
    });

    if (!userDetails) {
        throw new Error('User or employee not found');
    }

    const result = userDetails.toJSON();

    return {
        user: {
            id: result.id,
            company_id: result.company_id,
            email: result.email,
            phone: result.phone,
            created_at: result.created_at
        },
        employee: result.employee
    };
};

module.exports = {
    createEmployee,
    updateEmployee,
    getEmployeeById,
    getEmployeesByCompany,
    getLoggedInUserDetails
};
