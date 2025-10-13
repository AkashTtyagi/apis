/**
 * SLA Calculator Utility
 * Calculates SLA due dates and checks for breaches
 */

/**
 * Calculate SLA due date from current time
 * @param {number} slaDays - SLA in days
 * @param {number} slaHours - SLA in hours
 * @returns {Date} SLA due date
 */
const calculateSLADueDate = (slaDays = null, slaHours = null) => {
    try {
        if (!slaDays && !slaHours) {
            return null; // No SLA configured
        }

        const now = new Date();
        const dueDate = new Date(now);

        if (slaDays) {
            dueDate.setDate(dueDate.getDate() + slaDays);
        }

        if (slaHours) {
            dueDate.setHours(dueDate.getHours() + slaHours);
        }

        return dueDate;

    } catch (error) {
        console.error('Error calculating SLA due date:', error);
        return null;
    }
};

/**
 * Calculate SLA due date from a specific start time
 * @param {Date} startDate - Start date
 * @param {number} slaDays - SLA in days
 * @param {number} slaHours - SLA in hours
 * @returns {Date} SLA due date
 */
const calculateSLADueDateFromStart = (startDate, slaDays = null, slaHours = null) => {
    try {
        if (!slaDays && !slaHours) {
            return null;
        }

        const dueDate = new Date(startDate);

        if (slaDays) {
            dueDate.setDate(dueDate.getDate() + slaDays);
        }

        if (slaHours) {
            dueDate.setHours(dueDate.getHours() + slaHours);
        }

        return dueDate;

    } catch (error) {
        console.error('Error calculating SLA due date from start:', error);
        return null;
    }
};

/**
 * Check if SLA is breached
 * @param {Date} dueDate - SLA due date
 * @param {Date} currentDate - Current date (optional, defaults to now)
 * @returns {boolean} True if breached
 */
const checkSLABreach = (dueDate, currentDate = null) => {
    try {
        if (!dueDate) {
            return false; // No SLA configured
        }

        const now = currentDate || new Date();
        return now > dueDate;

    } catch (error) {
        console.error('Error checking SLA breach:', error);
        return false;
    }
};

/**
 * Calculate remaining time until SLA breach
 * @param {Date} dueDate - SLA due date
 * @returns {Object} Remaining time breakdown
 */
const calculateRemainingTime = (dueDate) => {
    try {
        if (!dueDate) {
            return null;
        }

        const now = new Date();
        const diffMs = dueDate - now;

        if (diffMs <= 0) {
            return {
                expired: true,
                days: 0,
                hours: 0,
                minutes: 0,
                totalHours: 0,
                message: 'SLA expired'
            };
        }

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

        return {
            expired: false,
            days,
            hours,
            minutes,
            totalHours,
            message: `${days}d ${hours}h ${minutes}m remaining`
        };

    } catch (error) {
        console.error('Error calculating remaining time:', error);
        return null;
    }
};

/**
 * Calculate time elapsed since a date
 * @param {Date} startDate - Start date
 * @returns {Object} Elapsed time breakdown
 */
const calculateElapsedTime = (startDate) => {
    try {
        if (!startDate) {
            return null;
        }

        const now = new Date();
        const diffMs = now - startDate;

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

        return {
            days,
            hours,
            minutes,
            totalHours,
            message: `${days}d ${hours}h ${minutes}m elapsed`
        };

    } catch (error) {
        console.error('Error calculating elapsed time:', error);
        return null;
    }
};

/**
 * Get SLA status with color coding
 * @param {Date} dueDate - SLA due date
 * @returns {Object} SLA status
 */
const getSLAStatus = (dueDate) => {
    try {
        if (!dueDate) {
            return {
                status: 'no_sla',
                color: 'gray',
                message: 'No SLA configured'
            };
        }

        const remaining = calculateRemainingTime(dueDate);

        if (remaining.expired) {
            return {
                status: 'breached',
                color: 'red',
                message: 'SLA Breached',
                ...remaining
            };
        }

        // Less than 4 hours remaining - critical
        if (remaining.totalHours < 4) {
            return {
                status: 'critical',
                color: 'red',
                message: 'SLA Critical',
                ...remaining
            };
        }

        // Less than 24 hours remaining - warning
        if (remaining.totalHours < 24) {
            return {
                status: 'warning',
                color: 'orange',
                message: 'SLA Warning',
                ...remaining
            };
        }

        // Normal
        return {
            status: 'normal',
            color: 'green',
            message: 'Within SLA',
            ...remaining
        };

    } catch (error) {
        console.error('Error getting SLA status:', error);
        return null;
    }
};

/**
 * Calculate SLA in business hours (excluding weekends)
 * @param {number} businessHours - Business hours
 * @returns {Date} SLA due date
 */
const calculateBusinessHoursSLA = (businessHours) => {
    try {
        const now = new Date();
        let remainingHours = businessHours;
        let currentDate = new Date(now);

        while (remainingHours > 0) {
            currentDate.setHours(currentDate.getHours() + 1);

            // Skip weekends
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
                // Skip non-business hours (before 9 AM or after 6 PM)
                const hour = currentDate.getHours();
                if (hour >= 9 && hour < 18) {
                    remainingHours--;
                }
            }
        }

        return currentDate;

    } catch (error) {
        console.error('Error calculating business hours SLA:', error);
        return null;
    }
};

/**
 * Format SLA time for display
 * @param {Date} dueDate - Due date
 * @returns {string} Formatted SLA string
 */
const formatSLATime = (dueDate) => {
    try {
        if (!dueDate) {
            return 'No SLA';
        }

        const remaining = calculateRemainingTime(dueDate);

        if (!remaining) {
            return 'Invalid SLA';
        }

        if (remaining.expired) {
            return 'Expired';
        }

        if (remaining.days > 0) {
            return `${remaining.days}d ${remaining.hours}h`;
        }

        if (remaining.hours > 0) {
            return `${remaining.hours}h ${remaining.minutes}m`;
        }

        return `${remaining.minutes}m`;

    } catch (error) {
        console.error('Error formatting SLA time:', error);
        return 'Error';
    }
};

module.exports = {
    calculateSLADueDate,
    calculateSLADueDateFromStart,
    checkSLABreach,
    calculateRemainingTime,
    calculateElapsedTime,
    getSLAStatus,
    calculateBusinessHoursSLA,
    formatSLATime
};
