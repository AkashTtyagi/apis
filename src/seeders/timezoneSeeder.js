/**
 * Timezone Seeder
 * Seeds hrms_timezone_master table with all world timezones
 */

const { HrmsTimezoneMaster } = require('../models/HrmsTimezoneMaster');

/**
 * Comprehensive list of world timezones with UTC offsets
 */
const timezones = [
    // UTC/GMT
    { timezone_name: 'UTC', timezone_offset: '+00:00', timezone_offset_minutes: 0, country_code: null, timezone_abbr: 'UTC', display_name: '(UTC+00:00) Coordinated Universal Time' },
    { timezone_name: 'GMT', timezone_offset: '+00:00', timezone_offset_minutes: 0, country_code: null, timezone_abbr: 'GMT', display_name: '(UTC+00:00) Greenwich Mean Time' },

    // Africa
    { timezone_name: 'Africa/Abidjan', timezone_offset: '+00:00', timezone_offset_minutes: 0, country_code: 'CI', timezone_abbr: 'GMT', display_name: '(UTC+00:00) Abidjan' },
    { timezone_name: 'Africa/Accra', timezone_offset: '+00:00', timezone_offset_minutes: 0, country_code: 'GH', timezone_abbr: 'GMT', display_name: '(UTC+00:00) Accra' },
    { timezone_name: 'Africa/Addis_Ababa', timezone_offset: '+03:00', timezone_offset_minutes: 180, country_code: 'ET', timezone_abbr: 'EAT', display_name: '(UTC+03:00) Addis Ababa' },
    { timezone_name: 'Africa/Algiers', timezone_offset: '+01:00', timezone_offset_minutes: 60, country_code: 'DZ', timezone_abbr: 'CET', display_name: '(UTC+01:00) Algiers' },
    { timezone_name: 'Africa/Cairo', timezone_offset: '+02:00', timezone_offset_minutes: 120, country_code: 'EG', timezone_abbr: 'EET', display_name: '(UTC+02:00) Cairo' },
    { timezone_name: 'Africa/Casablanca', timezone_offset: '+01:00', timezone_offset_minutes: 60, country_code: 'MA', timezone_abbr: 'WEST', display_name: '(UTC+01:00) Casablanca' },
    { timezone_name: 'Africa/Johannesburg', timezone_offset: '+02:00', timezone_offset_minutes: 120, country_code: 'ZA', timezone_abbr: 'SAST', display_name: '(UTC+02:00) Johannesburg' },
    { timezone_name: 'Africa/Lagos', timezone_offset: '+01:00', timezone_offset_minutes: 60, country_code: 'NG', timezone_abbr: 'WAT', display_name: '(UTC+01:00) Lagos' },
    { timezone_name: 'Africa/Nairobi', timezone_offset: '+03:00', timezone_offset_minutes: 180, country_code: 'KE', timezone_abbr: 'EAT', display_name: '(UTC+03:00) Nairobi' },

    // America - North America
    { timezone_name: 'America/New_York', timezone_offset: '-05:00', timezone_offset_minutes: -300, country_code: 'US', timezone_abbr: 'EST', display_name: '(UTC-05:00) Eastern Time - New York' },
    { timezone_name: 'America/Chicago', timezone_offset: '-06:00', timezone_offset_minutes: -360, country_code: 'US', timezone_abbr: 'CST', display_name: '(UTC-06:00) Central Time - Chicago' },
    { timezone_name: 'America/Denver', timezone_offset: '-07:00', timezone_offset_minutes: -420, country_code: 'US', timezone_abbr: 'MST', display_name: '(UTC-07:00) Mountain Time - Denver' },
    { timezone_name: 'America/Los_Angeles', timezone_offset: '-08:00', timezone_offset_minutes: -480, country_code: 'US', timezone_abbr: 'PST', display_name: '(UTC-08:00) Pacific Time - Los Angeles' },
    { timezone_name: 'America/Phoenix', timezone_offset: '-07:00', timezone_offset_minutes: -420, country_code: 'US', timezone_abbr: 'MST', display_name: '(UTC-07:00) Phoenix' },
    { timezone_name: 'America/Anchorage', timezone_offset: '-09:00', timezone_offset_minutes: -540, country_code: 'US', timezone_abbr: 'AKST', display_name: '(UTC-09:00) Anchorage' },
    { timezone_name: 'America/Honolulu', timezone_offset: '-10:00', timezone_offset_minutes: -600, country_code: 'US', timezone_abbr: 'HST', display_name: '(UTC-10:00) Honolulu' },
    { timezone_name: 'America/Toronto', timezone_offset: '-05:00', timezone_offset_minutes: -300, country_code: 'CA', timezone_abbr: 'EST', display_name: '(UTC-05:00) Toronto' },
    { timezone_name: 'America/Vancouver', timezone_offset: '-08:00', timezone_offset_minutes: -480, country_code: 'CA', timezone_abbr: 'PST', display_name: '(UTC-08:00) Vancouver' },
    { timezone_name: 'America/Mexico_City', timezone_offset: '-06:00', timezone_offset_minutes: -360, country_code: 'MX', timezone_abbr: 'CST', display_name: '(UTC-06:00) Mexico City' },

    // America - South America
    { timezone_name: 'America/Bogota', timezone_offset: '-05:00', timezone_offset_minutes: -300, country_code: 'CO', timezone_abbr: 'COT', display_name: '(UTC-05:00) Bogota' },
    { timezone_name: 'America/Buenos_Aires', timezone_offset: '-03:00', timezone_offset_minutes: -180, country_code: 'AR', timezone_abbr: 'ART', display_name: '(UTC-03:00) Buenos Aires' },
    { timezone_name: 'America/Caracas', timezone_offset: '-04:00', timezone_offset_minutes: -240, country_code: 'VE', timezone_abbr: 'VET', display_name: '(UTC-04:00) Caracas' },
    { timezone_name: 'America/Lima', timezone_offset: '-05:00', timezone_offset_minutes: -300, country_code: 'PE', timezone_abbr: 'PET', display_name: '(UTC-05:00) Lima' },
    { timezone_name: 'America/Santiago', timezone_offset: '-03:00', timezone_offset_minutes: -180, country_code: 'CL', timezone_abbr: 'CLST', display_name: '(UTC-03:00) Santiago' },
    { timezone_name: 'America/Sao_Paulo', timezone_offset: '-03:00', timezone_offset_minutes: -180, country_code: 'BR', timezone_abbr: 'BRT', display_name: '(UTC-03:00) Sao Paulo' },

    // Asia - South Asia
    { timezone_name: 'Asia/Kolkata', timezone_offset: '+05:30', timezone_offset_minutes: 330, country_code: 'IN', timezone_abbr: 'IST', display_name: '(UTC+05:30) India Standard Time - Kolkata' },
    { timezone_name: 'Asia/Mumbai', timezone_offset: '+05:30', timezone_offset_minutes: 330, country_code: 'IN', timezone_abbr: 'IST', display_name: '(UTC+05:30) Mumbai' },
    { timezone_name: 'Asia/Delhi', timezone_offset: '+05:30', timezone_offset_minutes: 330, country_code: 'IN', timezone_abbr: 'IST', display_name: '(UTC+05:30) Delhi' },
    { timezone_name: 'Asia/Dhaka', timezone_offset: '+06:00', timezone_offset_minutes: 360, country_code: 'BD', timezone_abbr: 'BST', display_name: '(UTC+06:00) Dhaka' },
    { timezone_name: 'Asia/Karachi', timezone_offset: '+05:00', timezone_offset_minutes: 300, country_code: 'PK', timezone_abbr: 'PKT', display_name: '(UTC+05:00) Karachi' },
    { timezone_name: 'Asia/Kathmandu', timezone_offset: '+05:45', timezone_offset_minutes: 345, country_code: 'NP', timezone_abbr: 'NPT', display_name: '(UTC+05:45) Kathmandu' },
    { timezone_name: 'Asia/Colombo', timezone_offset: '+05:30', timezone_offset_minutes: 330, country_code: 'LK', timezone_abbr: 'IST', display_name: '(UTC+05:30) Colombo' },

    // Asia - Southeast Asia
    { timezone_name: 'Asia/Bangkok', timezone_offset: '+07:00', timezone_offset_minutes: 420, country_code: 'TH', timezone_abbr: 'ICT', display_name: '(UTC+07:00) Bangkok' },
    { timezone_name: 'Asia/Singapore', timezone_offset: '+08:00', timezone_offset_minutes: 480, country_code: 'SG', timezone_abbr: 'SGT', display_name: '(UTC+08:00) Singapore' },
    { timezone_name: 'Asia/Jakarta', timezone_offset: '+07:00', timezone_offset_minutes: 420, country_code: 'ID', timezone_abbr: 'WIB', display_name: '(UTC+07:00) Jakarta' },
    { timezone_name: 'Asia/Manila', timezone_offset: '+08:00', timezone_offset_minutes: 480, country_code: 'PH', timezone_abbr: 'PST', display_name: '(UTC+08:00) Manila' },
    { timezone_name: 'Asia/Kuala_Lumpur', timezone_offset: '+08:00', timezone_offset_minutes: 480, country_code: 'MY', timezone_abbr: 'MYT', display_name: '(UTC+08:00) Kuala Lumpur' },
    { timezone_name: 'Asia/Ho_Chi_Minh', timezone_offset: '+07:00', timezone_offset_minutes: 420, country_code: 'VN', timezone_abbr: 'ICT', display_name: '(UTC+07:00) Ho Chi Minh City' },

    // Asia - East Asia
    { timezone_name: 'Asia/Hong_Kong', timezone_offset: '+08:00', timezone_offset_minutes: 480, country_code: 'HK', timezone_abbr: 'HKT', display_name: '(UTC+08:00) Hong Kong' },
    { timezone_name: 'Asia/Shanghai', timezone_offset: '+08:00', timezone_offset_minutes: 480, country_code: 'CN', timezone_abbr: 'CST', display_name: '(UTC+08:00) Shanghai' },
    { timezone_name: 'Asia/Tokyo', timezone_offset: '+09:00', timezone_offset_minutes: 540, country_code: 'JP', timezone_abbr: 'JST', display_name: '(UTC+09:00) Tokyo' },
    { timezone_name: 'Asia/Seoul', timezone_offset: '+09:00', timezone_offset_minutes: 540, country_code: 'KR', timezone_abbr: 'KST', display_name: '(UTC+09:00) Seoul' },
    { timezone_name: 'Asia/Taipei', timezone_offset: '+08:00', timezone_offset_minutes: 480, country_code: 'TW', timezone_abbr: 'CST', display_name: '(UTC+08:00) Taipei' },

    // Asia - Middle East
    { timezone_name: 'Asia/Dubai', timezone_offset: '+04:00', timezone_offset_minutes: 240, country_code: 'AE', timezone_abbr: 'GST', display_name: '(UTC+04:00) Dubai' },
    { timezone_name: 'Asia/Riyadh', timezone_offset: '+03:00', timezone_offset_minutes: 180, country_code: 'SA', timezone_abbr: 'AST', display_name: '(UTC+03:00) Riyadh' },
    { timezone_name: 'Asia/Kuwait', timezone_offset: '+03:00', timezone_offset_minutes: 180, country_code: 'KW', timezone_abbr: 'AST', display_name: '(UTC+03:00) Kuwait' },
    { timezone_name: 'Asia/Qatar', timezone_offset: '+03:00', timezone_offset_minutes: 180, country_code: 'QA', timezone_abbr: 'AST', display_name: '(UTC+03:00) Qatar' },
    { timezone_name: 'Asia/Bahrain', timezone_offset: '+03:00', timezone_offset_minutes: 180, country_code: 'BH', timezone_abbr: 'AST', display_name: '(UTC+03:00) Bahrain' },
    { timezone_name: 'Asia/Jerusalem', timezone_offset: '+02:00', timezone_offset_minutes: 120, country_code: 'IL', timezone_abbr: 'IST', display_name: '(UTC+02:00) Jerusalem' },
    { timezone_name: 'Asia/Tehran', timezone_offset: '+03:30', timezone_offset_minutes: 210, country_code: 'IR', timezone_abbr: 'IRST', display_name: '(UTC+03:30) Tehran' },

    // Asia - Central Asia
    { timezone_name: 'Asia/Tashkent', timezone_offset: '+05:00', timezone_offset_minutes: 300, country_code: 'UZ', timezone_abbr: 'UZT', display_name: '(UTC+05:00) Tashkent' },
    { timezone_name: 'Asia/Almaty', timezone_offset: '+06:00', timezone_offset_minutes: 360, country_code: 'KZ', timezone_abbr: 'ALMT', display_name: '(UTC+06:00) Almaty' },

    // Europe - Western Europe
    { timezone_name: 'Europe/London', timezone_offset: '+00:00', timezone_offset_minutes: 0, country_code: 'GB', timezone_abbr: 'GMT', display_name: '(UTC+00:00) London' },
    { timezone_name: 'Europe/Dublin', timezone_offset: '+00:00', timezone_offset_minutes: 0, country_code: 'IE', timezone_abbr: 'GMT', display_name: '(UTC+00:00) Dublin' },
    { timezone_name: 'Europe/Lisbon', timezone_offset: '+00:00', timezone_offset_minutes: 0, country_code: 'PT', timezone_abbr: 'WET', display_name: '(UTC+00:00) Lisbon' },
    { timezone_name: 'Europe/Paris', timezone_offset: '+01:00', timezone_offset_minutes: 60, country_code: 'FR', timezone_abbr: 'CET', display_name: '(UTC+01:00) Paris' },
    { timezone_name: 'Europe/Madrid', timezone_offset: '+01:00', timezone_offset_minutes: 60, country_code: 'ES', timezone_abbr: 'CET', display_name: '(UTC+01:00) Madrid' },
    { timezone_name: 'Europe/Brussels', timezone_offset: '+01:00', timezone_offset_minutes: 60, country_code: 'BE', timezone_abbr: 'CET', display_name: '(UTC+01:00) Brussels' },
    { timezone_name: 'Europe/Amsterdam', timezone_offset: '+01:00', timezone_offset_minutes: 60, country_code: 'NL', timezone_abbr: 'CET', display_name: '(UTC+01:00) Amsterdam' },

    // Europe - Central Europe
    { timezone_name: 'Europe/Berlin', timezone_offset: '+01:00', timezone_offset_minutes: 60, country_code: 'DE', timezone_abbr: 'CET', display_name: '(UTC+01:00) Berlin' },
    { timezone_name: 'Europe/Rome', timezone_offset: '+01:00', timezone_offset_minutes: 60, country_code: 'IT', timezone_abbr: 'CET', display_name: '(UTC+01:00) Rome' },
    { timezone_name: 'Europe/Vienna', timezone_offset: '+01:00', timezone_offset_minutes: 60, country_code: 'AT', timezone_abbr: 'CET', display_name: '(UTC+01:00) Vienna' },
    { timezone_name: 'Europe/Zurich', timezone_offset: '+01:00', timezone_offset_minutes: 60, country_code: 'CH', timezone_abbr: 'CET', display_name: '(UTC+01:00) Zurich' },
    { timezone_name: 'Europe/Prague', timezone_offset: '+01:00', timezone_offset_minutes: 60, country_code: 'CZ', timezone_abbr: 'CET', display_name: '(UTC+01:00) Prague' },
    { timezone_name: 'Europe/Warsaw', timezone_offset: '+01:00', timezone_offset_minutes: 60, country_code: 'PL', timezone_abbr: 'CET', display_name: '(UTC+01:00) Warsaw' },

    // Europe - Eastern Europe
    { timezone_name: 'Europe/Athens', timezone_offset: '+02:00', timezone_offset_minutes: 120, country_code: 'GR', timezone_abbr: 'EET', display_name: '(UTC+02:00) Athens' },
    { timezone_name: 'Europe/Bucharest', timezone_offset: '+02:00', timezone_offset_minutes: 120, country_code: 'RO', timezone_abbr: 'EET', display_name: '(UTC+02:00) Bucharest' },
    { timezone_name: 'Europe/Helsinki', timezone_offset: '+02:00', timezone_offset_minutes: 120, country_code: 'FI', timezone_abbr: 'EET', display_name: '(UTC+02:00) Helsinki' },
    { timezone_name: 'Europe/Istanbul', timezone_offset: '+03:00', timezone_offset_minutes: 180, country_code: 'TR', timezone_abbr: 'TRT', display_name: '(UTC+03:00) Istanbul' },
    { timezone_name: 'Europe/Moscow', timezone_offset: '+03:00', timezone_offset_minutes: 180, country_code: 'RU', timezone_abbr: 'MSK', display_name: '(UTC+03:00) Moscow' },
    { timezone_name: 'Europe/Kiev', timezone_offset: '+02:00', timezone_offset_minutes: 120, country_code: 'UA', timezone_abbr: 'EET', display_name: '(UTC+02:00) Kiev' },

    // Pacific - Australia
    { timezone_name: 'Australia/Sydney', timezone_offset: '+10:00', timezone_offset_minutes: 600, country_code: 'AU', timezone_abbr: 'AEST', display_name: '(UTC+10:00) Sydney' },
    { timezone_name: 'Australia/Melbourne', timezone_offset: '+10:00', timezone_offset_minutes: 600, country_code: 'AU', timezone_abbr: 'AEST', display_name: '(UTC+10:00) Melbourne' },
    { timezone_name: 'Australia/Brisbane', timezone_offset: '+10:00', timezone_offset_minutes: 600, country_code: 'AU', timezone_abbr: 'AEST', display_name: '(UTC+10:00) Brisbane' },
    { timezone_name: 'Australia/Perth', timezone_offset: '+08:00', timezone_offset_minutes: 480, country_code: 'AU', timezone_abbr: 'AWST', display_name: '(UTC+08:00) Perth' },
    { timezone_name: 'Australia/Adelaide', timezone_offset: '+09:30', timezone_offset_minutes: 570, country_code: 'AU', timezone_abbr: 'ACST', display_name: '(UTC+09:30) Adelaide' },

    // Pacific - New Zealand & Islands
    { timezone_name: 'Pacific/Auckland', timezone_offset: '+12:00', timezone_offset_minutes: 720, country_code: 'NZ', timezone_abbr: 'NZST', display_name: '(UTC+12:00) Auckland' },
    { timezone_name: 'Pacific/Fiji', timezone_offset: '+12:00', timezone_offset_minutes: 720, country_code: 'FJ', timezone_abbr: 'FJT', display_name: '(UTC+12:00) Fiji' },
    { timezone_name: 'Pacific/Guam', timezone_offset: '+10:00', timezone_offset_minutes: 600, country_code: 'GU', timezone_abbr: 'ChST', display_name: '(UTC+10:00) Guam' },
    { timezone_name: 'Pacific/Tahiti', timezone_offset: '-10:00', timezone_offset_minutes: -600, country_code: 'PF', timezone_abbr: 'TAHT', display_name: '(UTC-10:00) Tahiti' },

    // Atlantic
    { timezone_name: 'Atlantic/Azores', timezone_offset: '-01:00', timezone_offset_minutes: -60, country_code: 'PT', timezone_abbr: 'AZOT', display_name: '(UTC-01:00) Azores' },
    { timezone_name: 'Atlantic/Cape_Verde', timezone_offset: '-01:00', timezone_offset_minutes: -60, country_code: 'CV', timezone_abbr: 'CVT', display_name: '(UTC-01:00) Cape Verde' },
    { timezone_name: 'Atlantic/Reykjavik', timezone_offset: '+00:00', timezone_offset_minutes: 0, country_code: 'IS', timezone_abbr: 'GMT', display_name: '(UTC+00:00) Reykjavik' }
];

/**
 * Seed timezone data
 */
const seedTimezones = async () => {
    try {
        console.log('Starting timezone seeding...');

        // Check if data already exists
        const count = await HrmsTimezoneMaster.count();
        if (count > 0) {
            console.log(`Timezone data already exists (${count} records). Skipping seed.`);
            return;
        }

        // Bulk create timezones
        await HrmsTimezoneMaster.bulkCreate(timezones);

        console.log(`✓ Successfully seeded ${timezones.length} timezones`);
    } catch (error) {
        console.error('Error seeding timezones:', error);
        throw error;
    }
};

module.exports = {
    seedTimezones
};
