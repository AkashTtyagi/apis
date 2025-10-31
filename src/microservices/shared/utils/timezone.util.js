/**
 * Timezone Utility
 * Handles timezone conversions for punch records
 * Shared across microservices
 */

const moment = require('moment-timezone');

/**
 * Convert UTC to employee timezone
 * Used for biometric devices that send UTC time
 *
 * @param {Date|string} utcDatetime - UTC datetime
 * @param {string} employeeTimezone - Employee timezone (e.g., "Asia/Kolkata")
 * @returns {Date} Converted datetime in employee timezone
 */
const convertUTCToEmployeeTimezone = (utcDatetime, employeeTimezone) => {
    if (!employeeTimezone) {
        throw new Error('Employee timezone is required');
    }

    try {
        // Parse UTC datetime and convert to employee timezone
        const converted = moment.utc(utcDatetime).tz(employeeTimezone);
        return converted.toDate();
    } catch (error) {
        throw new Error(`Invalid timezone conversion: ${error.message}`);
    }
};

/**
 * Get current datetime in employee timezone
 *
 * @param {string} employeeTimezone - Employee timezone
 * @returns {Date} Current datetime in employee timezone
 */
const getCurrentDateTimeInTimezone = (employeeTimezone) => {
    if (!employeeTimezone) {
        throw new Error('Employee timezone is required');
    }

    try {
        return moment().tz(employeeTimezone).toDate();
    } catch (error) {
        throw new Error(`Invalid timezone: ${error.message}`);
    }
};

/**
 * Get UTC offset for timezone
 *
 * @param {string} timezone - Timezone string
 * @returns {string} UTC offset (e.g., "+05:30", "-08:00")
 */
const getUTCOffset = (timezone) => {
    try {
        return moment.tz(timezone).format('Z');
    } catch (error) {
        return null;
    }
};

/**
 * Format datetime in employee timezone
 *
 * @param {Date} datetime - Datetime to format
 * @param {string} timezone - Timezone
 * @param {string} format - Moment format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted datetime string
 */
const formatDateTimeInTimezone = (datetime, timezone, format = 'YYYY-MM-DD HH:mm:ss') => {
    try {
        return moment(datetime).tz(timezone).format(format);
    } catch (error) {
        return null;
    }
};

/**
 * Check if datetime is within time range (for shift validation)
 *
 * @param {Date} datetime - Datetime to check
 * @param {string} startTime - Start time (HH:mm:ss format)
 * @param {string} endTime - End time (HH:mm:ss format)
 * @param {string} timezone - Timezone
 * @returns {boolean} True if within range
 */
const isWithinTimeRange = (datetime, startTime, endTime, timezone) => {
    try {
        const dt = moment(datetime).tz(timezone);
        const timeOnly = dt.format('HH:mm:ss');

        // Handle overnight shifts (e.g., 22:00 - 06:00)
        if (endTime < startTime) {
            return timeOnly >= startTime || timeOnly <= endTime;
        }

        return timeOnly >= startTime && timeOnly <= endTime;
    } catch (error) {
        return false;
    }
};

/**
 * Add minutes to datetime in specific timezone
 *
 * @param {Date} datetime - Base datetime
 * @param {number} minutes - Minutes to add (can be negative)
 * @param {string} timezone - Timezone
 * @returns {Date} New datetime
 */
const addMinutesInTimezone = (datetime, minutes, timezone) => {
    try {
        return moment(datetime).tz(timezone).add(minutes, 'minutes').toDate();
    } catch (error) {
        throw new Error(`Error adding minutes: ${error.message}`);
    }
};

/**
 * Get difference in minutes between two datetimes
 *
 * @param {Date} datetime1 - First datetime
 * @param {Date} datetime2 - Second datetime
 * @returns {number} Difference in minutes
 */
const getMinutesDifference = (datetime1, datetime2) => {
    const m1 = moment(datetime1);
    const m2 = moment(datetime2);
    return m2.diff(m1, 'minutes');
};

/**
 * Validate timezone string
 *
 * @param {string} timezone - Timezone to validate
 * @returns {boolean} True if valid
 */
const isValidTimezone = (timezone) => {
    return moment.tz.zone(timezone) !== null;
};

module.exports = {
    convertUTCToEmployeeTimezone,
    getCurrentDateTimeInTimezone,
    getUTCOffset,
    formatDateTimeInTimezone,
    isWithinTimeRange,
    addMinutesInTimezone,
    getMinutesDifference,
    isValidTimezone
};
