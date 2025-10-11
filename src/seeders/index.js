/**
 * Master Seeder
 * Runs all location seeders in the correct order
 * Order: Country -> State -> City (due to foreign key dependencies)
 */

const { seedCountries } = require('./countrySeeder');
const { seedStates } = require('./stateSeeder');
const { seedCities } = require('./citySeeder');
const { sequelize } = require('../utils/database');

/**
 * Run all location seeders
 */
const runAllSeeders = async () => {
    try {
        console.log('🚀 Starting location master seeder...\n');

        // Test database connection
        await sequelize.authenticate();
        console.log('✓ Database connection established\n');

        // 1. Seed Countries first (no dependencies)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('STEP 1: Seeding Countries');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const countries = await seedCountries();
        console.log(`\n✅ ${countries.length} countries seeded\n`);

        // 2. Seed States (depends on countries)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('STEP 2: Seeding States');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const states = await seedStates();
        console.log(`\n✅ ${states.length} states seeded\n`);

        // 3. Seed Cities (depends on countries and states)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('STEP 3: Seeding Cities');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const cities = await seedCities();
        console.log(`\n✅ ${cities.length} cities seeded\n`);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 ALL LOCATION DATA SEEDED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 Summary:`);
        console.log(`   • Countries: ${countries.length}`);
        console.log(`   • States: ${states.length}`);
        console.log(`   • Cities: ${cities.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return {
            countries: countries.length,
            states: states.length,
            cities: cities.length
        };
    } catch (error) {
        console.error('\n❌ Seeder error:', error.message);
        console.error(error);
        throw error;
    }
};

// Run if called directly
if (require.main === module) {
    runAllSeeders()
        .then(() => {
            console.log('✅ All seeders completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeder failed:', error);
            process.exit(1);
        });
}

module.exports = { runAllSeeders };
