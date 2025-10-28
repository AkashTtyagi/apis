/**
 * Letter Generation Controller
 * Handles HTTP requests for letter generation
 */

const letterGenerationService = require('../../services/letter/letterGeneration.service');

/**
 * Generate letter for employee
 * POST /api/letters/generate
 */
const generateLetter = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.user_id;

        const letterData = {
            ...req.body
        };

        const result = await letterGenerationService.generateLetterForEmployee(letterData, userId);

        return res.status(201).json({
            success: true,
            message: result.approval_required
                ? 'Letter generated and sent for approval'
                : 'Letter generated successfully',
            data: result
        });

    } catch (error) {
        console.error('Controller - Generate letter error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate letter'
        });
    }
};

/**
 * Preview letter HTML
 * POST /api/letters/preview
 */
const previewLetter = async (req, res) => {
    try {
        const { letter_template_id, employee_id, custom_field_values } = req.body;

        if (!letter_template_id || !employee_id) {
            return res.status(400).json({
                success: false,
                message: 'Template ID and Employee ID are required'
            });
        }

        const preview = await letterGenerationService.previewLetterHTML(
            letter_template_id,
            employee_id,
            custom_field_values || []
        );

        return res.status(200).json({
            success: true,
            data: preview
        });

    } catch (error) {
        console.error('Controller - Preview letter error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to preview letter'
        });
    }
};

/**
 * Check if approval is required for letter
 * GET /api/letters/check-approval/:templateId/:employeeId
 */
const checkApproval = async (req, res) => {
    try {
        const templateId = parseInt(req.params.templateId);
        const employeeId = parseInt(req.params.employeeId);

        const approvalDetails = await letterGenerationService.checkApprovalRequired(templateId, employeeId);

        return res.status(200).json({
            success: true,
            data: approvalDetails
        });

    } catch (error) {
        console.error('Controller - Check approval error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to check approval requirement'
        });
    }
};

/**
 * Get employee letters
 * GET /api/letters/employee/:employeeId/letters
 */
const getEmployeeLetters = async (req, res) => {
    try {
        const employeeId = parseInt(req.params.employeeId);

        // Extract filters from query params
        const filters = {
            folder_id: req.query.folder_id ? parseInt(req.query.folder_id) : null,
            document_type_id: req.query.document_type_id ? parseInt(req.query.document_type_id) : null,
            status: req.query.status || null
        };

        const letters = await letterGenerationService.getEmployeeLetters(employeeId, filters);

        return res.status(200).json({
            success: true,
            data: letters
        });

    } catch (error) {
        console.error('Controller - Get employee letters error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch employee letters'
        });
    }
};

/**
 * Get letter details by document ID
 * GET /api/letters/letters/:documentId
 */
const getLetterDetails = async (req, res) => {
    try {
        const documentId = parseInt(req.params.documentId);

        const letter = await letterGenerationService.getLetterDetails(documentId);

        return res.status(200).json({
            success: true,
            data: letter
        });

    } catch (error) {
        console.error('Controller - Get letter details error:', error.message);
        return res.status(404).json({
            success: false,
            message: error.message || 'Letter not found'
        });
    }
};

/**
 * Download letter PDF
 * GET /api/letters/download/:documentId
 */
const downloadPDF = async (req, res) => {
    try {
        const documentId = parseInt(req.params.documentId);

        // This will be implemented in PDF service
        // For now, return placeholder
        return res.status(501).json({
            success: false,
            message: 'PDF generation not yet implemented. Please install puppeteer package first.'
        });

    } catch (error) {
        console.error('Controller - Download PDF error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to download letter PDF'
        });
    }
};

module.exports = {
    generateLetter,
    previewLetter,
    checkApproval,
    getEmployeeLetters,
    getLetterDetails,
    downloadPDF
};
