/**
 * Field Validator Utility
 * Validates dynamic template field values based on field configurations
 */

/**
 * Validate a single field value against field configuration
 *
 * @param {Object} field - Field configuration from hrms_template_fields
 * @param {*} value - Value to validate
 * @returns {Object} Validation result { isValid: boolean, error: string|null }
 */
const validateField = (field, value) => {
    const { field_label, field_type, is_required, min_length, max_length, min_value, max_value, regex_pattern, data_type } = field;

    // Check required
    if (is_required && (value === null || value === undefined || value === '')) {
        return {
            isValid: false,
            error: `${field_label} is required`
        };
    }

    // If not required and empty, skip other validations
    if (!is_required && (value === null || value === undefined || value === '')) {
        return { isValid: true, error: null };
    }

    // String/Text validations
    if ((field_type === 'text' || field_type === 'textarea' || field_type === 'email' || field_type === 'url') && typeof value === 'string') {
        if (min_length && value.length < min_length) {
            return {
                isValid: false,
                error: `${field_label} must be at least ${min_length} characters`
            };
        }
        if (max_length && value.length > max_length) {
            return {
                isValid: false,
                error: `${field_label} must not exceed ${max_length} characters`
            };
        }
    }

    // Number validations
    if (field_type === 'number' && !isNaN(value)) {
        const numValue = parseFloat(value);
        if (min_value !== null && numValue < min_value) {
            return {
                isValid: false,
                error: `${field_label} must be at least ${min_value}`
            };
        }
        if (max_value !== null && numValue > max_value) {
            return {
                isValid: false,
                error: `${field_label} must not exceed ${max_value}`
            };
        }
    }

    // Email validation
    if (field_type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return {
                isValid: false,
                error: `${field_label} must be a valid email address`
            };
        }
    }

    // Phone validation
    if (field_type === 'phone') {
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(value.toString().replace(/[^0-9]/g, ''))) {
            return {
                isValid: false,
                error: `${field_label} must be a valid phone number`
            };
        }
    }

    // URL validation
    if (field_type === 'url') {
        try {
            new URL(value);
        } catch {
            return {
                isValid: false,
                error: `${field_label} must be a valid URL`
            };
        }
    }

    // Regex pattern validation
    if (regex_pattern) {
        const regex = new RegExp(regex_pattern);
        if (!regex.test(value)) {
            return {
                isValid: false,
                error: `${field_label} format is invalid`
            };
        }
    }

    return { isValid: true, error: null };
};

/**
 * Validate multiple fields
 *
 * @param {Array} fields - Array of field configurations
 * @param {Object} values - Object with field_id as key and value as value
 * @returns {Object} Validation result { isValid: boolean, errors: Array }
 */
const validateFields = (fields, values) => {
    const errors = [];

    fields.forEach(field => {
        const value = values[field.id] || values[field.field_slug];
        const result = validateField(field, value);

        if (!result.isValid) {
            errors.push({
                field_id: field.id,
                field_slug: field.field_slug,
                error: result.error
            });
        }
    });

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

module.exports = {
    validateField,
    validateFields
};
