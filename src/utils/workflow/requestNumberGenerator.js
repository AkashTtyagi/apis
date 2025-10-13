/**
 * Request Number Generator Utility
 * Generates unique request numbers for workflow requests
 */

const { HrmsWorkflowRequest } = require('../../models/workflow');
const { Op } = require('sequelize');

/**
 * Generate unique request number
 * Format: WFR-{WORKFLOW_CODE}-{YEAR}-{SEQUENCE}
 * Example: WFR-LEAVE-2024-00001
 *
 * @param {string} workflowCode - Workflow code (LEAVE, ONDUTY, etc.)
 * @param {number} companyId - Company ID
 * @returns {Promise<string>} Generated request number
 */
const generateRequestNumber = async (workflowCode, companyId) => {
    try {
        const year = new Date().getFullYear();
        const prefix = `WFR-${workflowCode}-${year}`;

        // Get count of requests for this workflow, company, and year
        const count = await HrmsWorkflowRequest.count({
            where: {
                company_id: companyId,
                request_number: {
                    [Op.like]: `${prefix}-%`
                }
            }
        });

        // Generate sequence number (padded to 5 digits)
        const sequence = String(count + 1).padStart(5, '0');

        const requestNumber = `${prefix}-${sequence}`;

        console.log(`✓ Generated request number: ${requestNumber}`);

        return requestNumber;

    } catch (error) {
        console.error('Error generating request number:', error);
        throw error;
    }
};

/**
 * Validate request number format
 * @param {string} requestNumber - Request number to validate
 * @returns {boolean} True if valid
 */
const validateRequestNumber = (requestNumber) => {
    // Format: WFR-{CODE}-{YEAR}-{SEQUENCE}
    const pattern = /^WFR-[A-Z_]+-\d{4}-\d{5}$/;
    return pattern.test(requestNumber);
};

/**
 * Parse request number to extract components
 * @param {string} requestNumber - Request number
 * @returns {Object} Parsed components
 */
const parseRequestNumber = (requestNumber) => {
    try {
        if (!validateRequestNumber(requestNumber)) {
            throw new Error('Invalid request number format');
        }

        const parts = requestNumber.split('-');

        return {
            prefix: parts[0],           // WFR
            workflowCode: parts[1],     // LEAVE
            year: parseInt(parts[2]),   // 2024
            sequence: parseInt(parts[3]) // 00001
        };

    } catch (error) {
        console.error('Error parsing request number:', error);
        throw error;
    }
};

/**
 * Get next sequence number for a workflow
 * @param {string} workflowCode - Workflow code
 * @param {number} companyId - Company ID
 * @param {number} year - Year
 * @returns {Promise<number>} Next sequence number
 */
const getNextSequenceNumber = async (workflowCode, companyId, year = null) => {
    try {
        const currentYear = year || new Date().getFullYear();
        const prefix = `WFR-${workflowCode}-${currentYear}`;

        const count = await HrmsWorkflowRequest.count({
            where: {
                company_id: companyId,
                request_number: {
                    [Op.like]: `${prefix}-%`
                }
            }
        });

        return count + 1;

    } catch (error) {
        console.error('Error getting next sequence number:', error);
        throw error;
    }
};

module.exports = {
    generateRequestNumber,
    validateRequestNumber,
    parseRequestNumber,
    getNextSequenceNumber
};
