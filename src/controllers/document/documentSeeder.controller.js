/**
 * Document Seeder Controller
 * API to seed document structure for existing companies
 */

const { seedDefaultDocumentStructure, checkDocumentStructureExists } = require('../../services/document/documentSeeder.service');
const { sequelize } = require('../../utils/database');

/**
 * Seed document structure for a company
 * POST /api/documents/seed-structure
 * Body: { company_id: number }
 */
const seedDocumentStructure = async (req, res) => {
    let transaction;

    try {
        const { company_id } = req.body;
        const user_id = req.user?.id || req.user?.user_id;

        // Validation
        if (!company_id) {
            return res.status(400).json({
                success: false,
                message: 'company_id is required'
            });
        }

        // Check if structure already exists
        const exists = await checkDocumentStructureExists(company_id);
        if (exists) {
            return res.status(400).json({
                success: false,
                message: `Document structure already exists for company ${company_id}. Delete existing structure first if you want to recreate.`
            });
        }

        // Start transaction
        transaction = await sequelize.transaction();

        // Seed the structure
        const result = await seedDefaultDocumentStructure(company_id, user_id, transaction);

        // Commit transaction
        await transaction.commit();

        return res.status(201).json({
            success: true,
            message: 'Document structure created successfully',
            data: result
        });
    } catch (error) {
        // Rollback on error
        if (transaction) {
            await transaction.rollback();
        }

        console.error('Controller - Seed document structure error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to create document structure',
            error: error.message
        });
    }
};

/**
 * Seed document structure for multiple companies
 * POST /api/documents/seed-structure-bulk
 * Body: { company_ids: [number, number, ...] }
 */
const seedDocumentStructureBulk = async (req, res) => {
    try {
        const { company_ids } = req.body;
        const user_id = req.user?.id || req.user?.user_id;

        // Validation
        if (!company_ids || !Array.isArray(company_ids) || company_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'company_ids array is required and must not be empty'
            });
        }

        const results = [];
        const errors = [];

        // Process each company
        for (const company_id of company_ids) {
            let transaction;
            try {
                // Check if structure already exists
                const exists = await checkDocumentStructureExists(company_id);
                if (exists) {
                    errors.push({
                        company_id,
                        error: 'Document structure already exists'
                    });
                    continue;
                }

                // Start transaction for this company
                transaction = await sequelize.transaction();

                // Seed the structure
                const result = await seedDefaultDocumentStructure(company_id, user_id, transaction);

                // Commit transaction
                await transaction.commit();

                results.push({
                    company_id,
                    success: true,
                    ...result
                });
            } catch (error) {
                // Rollback on error
                if (transaction) {
                    await transaction.rollback();
                }

                errors.push({
                    company_id,
                    error: error.message
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: `Processed ${company_ids.length} companies`,
            summary: {
                total: company_ids.length,
                successful: results.length,
                failed: errors.length
            },
            results,
            errors
        });
    } catch (error) {
        console.error('Controller - Seed document structure bulk error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to process bulk seeding',
            error: error.message
        });
    }
};

/**
 * Check if document structure exists for a company
 * GET /api/documents/check-structure/:company_id
 */
const checkStructureExists = async (req, res) => {
    try {
        const { company_id } = req.params;

        if (!company_id) {
            return res.status(400).json({
                success: false,
                message: 'company_id is required'
            });
        }

        const exists = await checkDocumentStructureExists(parseInt(company_id));

        return res.status(200).json({
            success: true,
            company_id: parseInt(company_id),
            structure_exists: exists
        });
    } catch (error) {
        console.error('Controller - Check structure exists error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to check structure',
            error: error.message
        });
    }
};

module.exports = {
    seedDocumentStructure,
    seedDocumentStructureBulk,
    checkStructureExists
};
