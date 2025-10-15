/**
 * Employee Type Master Seeder
 * Seeds common employee types into hrms_employee_type_master table
 */

const { HrmsEmployeeTypeMaster } = require('../../src/models/HrmsEmployeeTypeMaster');

const employeeTypes = [
    {
        id: 1,
        type_code: 'FULL_TIME',
        type_name: 'Full Time',
        description: 'Full-time permanent employees',
        is_active: 1,
        display_order: 1
    },
    {
        id: 2,
        type_code: 'PART_TIME',
        type_name: 'Part Time',
        description: 'Part-time employees working fewer hours than full-time',
        is_active: 1,
        display_order: 2
    },
    {
        id: 3,
        type_code: 'CONTRACT',
        type_name: 'Contract',
        description: 'Contract-based employees hired for specific duration or project',
        is_active: 1,
        display_order: 3
    },
    {
        id: 4,
        type_code: 'INTERN',
        type_name: 'Intern',
        description: 'Internship or trainee employees',
        is_active: 1,
        display_order: 4
    },
    {
        id: 5,
        type_code: 'CONSULTANT',
        type_name: 'Consultant',
        description: 'External consultants providing specialized services',
        is_active: 1,
        display_order: 5
    },
    {
        id: 6,
        type_code: 'FREELANCER',
        type_name: 'Freelancer',
        description: 'Freelance workers engaged on per-project basis',
        is_active: 1,
        display_order: 6
    },
    {
        id: 7,
        type_code: 'TEMPORARY',
        type_name: 'Temporary',
        description: 'Temporary employees hired for short-term needs',
        is_active: 1,
        display_order: 7
    },
    {
        id: 8,
        type_code: 'SEASONAL',
        type_name: 'Seasonal',
        description: 'Seasonal employees hired during specific seasons or periods',
        is_active: 1,
        display_order: 8
    }
];

const seedEmployeeTypes = async () => {
    try {
        console.log('🌱 Starting employee type seeding...');

        // Check if data already exists
        const count = await HrmsEmployeeTypeMaster.count();
        if (count > 0) {
            console.log(`⚠️  Employee types already seeded (${count} records found). Skipping...`);
            return;
        }

        // Bulk insert employee types
        await HrmsEmployeeTypeMaster.bulkCreate(employeeTypes, {
            ignoreDuplicates: true,
            validate: true
        });

        console.log(`✅ Successfully seeded ${employeeTypes.length} employee types`);
        console.log('Employee types seeded:');
        employeeTypes.forEach(type => {
            console.log(`  - ${type.type_name} (${type.type_code})`);
        });

    } catch (error) {
        console.error('❌ Error seeding employee types:', error);
        throw error;
    }
};

// Run seeder if called directly
if (require.main === module) {
    const { sequelize } = require('../../src/utils/database');

    seedEmployeeTypes()
        .then(() => {
            console.log('✅ Employee type seeding completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Employee type seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedEmployeeTypes };
