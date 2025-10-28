/**
 * One-time script to seed document structure for existing companies
 *
 * Usage:
 * node scripts/seedDocumentStructure.js
 *
 * This will seed document structure for all existing companies that don't have it yet
 */

const { sequelize } = require('../src/utils/database');
const { seedDefaultDocumentStructure, checkDocumentStructureExists } = require('../src/services/document/documentSeeder.service');

const seedAllCompanies = async () => {
    try {
        console.log('\n🚀 Starting document structure seeding...\n');

        // Get all companies
        const [companies] = await sequelize.query(
            'SELECT id, org_name FROM hrms_companies WHERE is_parent_company = 1'
        );

        if (companies.length === 0) {
            console.log('❌ No companies found in the database.');
            process.exit(0);
        }

        console.log(`📊 Found ${companies.length} companies to process\n`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        const errors = [];

        // Process each company
        for (const company of companies) {
            const transaction = await sequelize.transaction();

            try {
                console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`Processing Company: ${company.org_name} (ID: ${company.id})`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

                // Check if structure already exists
                const exists = await checkDocumentStructureExists(company.id);
                if (exists) {
                    console.log(`⏭️  Skipping: Document structure already exists\n`);
                    await transaction.rollback();
                    skipCount++;
                    continue;
                }

                // Seed the structure (using user_id = 1 as system user)
                const result = await seedDefaultDocumentStructure(company.id, 1, transaction);

                // Commit transaction
                await transaction.commit();

                console.log(`\n✅ SUCCESS for ${company.org_name}`);
                console.log(`   - Folders: ${result.folders_created}`);
                console.log(`   - Document Types: ${result.document_types_created}`);
                console.log(`   - Permissions: ${result.permissions_created}`);
                successCount++;

            } catch (error) {
                // Rollback on error
                await transaction.rollback();

                console.error(`\n❌ FAILED for ${company.org_name}: ${error.message}`);
                errors.push({
                    company_id: company.id,
                    company_name: company.org_name,
                    error: error.message
                });
                errorCount++;
            }
        }

        // Print summary
        console.log(`\n\n╔═══════════════════════════════════════════════╗`);
        console.log(`║           SEEDING SUMMARY                     ║`);
        console.log(`╠═══════════════════════════════════════════════╣`);
        console.log(`║  Total Companies: ${String(companies.length).padStart(28)} ║`);
        console.log(`║  Successful: ${String(successCount).padStart(31)} ║`);
        console.log(`║  Skipped: ${String(skipCount).padStart(34)} ║`);
        console.log(`║  Failed: ${String(errorCount).padStart(35)} ║`);
        console.log(`╚═══════════════════════════════════════════════╝\n`);

        if (errors.length > 0) {
            console.log('\n❌ ERRORS:\n');
            errors.forEach((err, idx) => {
                console.log(`${idx + 1}. Company: ${err.company_name} (ID: ${err.company_id})`);
                console.log(`   Error: ${err.error}\n`);
            });
        }

        console.log('✅ Seeding process completed!\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

// Run the seeder
seedAllCompanies();
