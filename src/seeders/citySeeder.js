/**
 * City Master Seeder
 * Seeds major cities data for countries with states defined
 * Uses country_id and state_id for mapping (foreign keys)
 */

const { HrmsCityMaster } = require('../models/HrmsCityMaster');
const { HrmsStateMaster } = require('../models/HrmsStateMaster');
const { HrmsCountryMaster } = require('../models/HrmsCountryMaster');
const { sequelize } = require('../utils/database');

/**
 * Seed Cities
 */
const seedCities = async () => {
    try {
        console.log('🏙️  Starting city seeder...');

        // Sync the model to create table if it doesn't exist
        await HrmsCityMaster.sync({ alter: true });
        console.log('✓ City table synced');

        // Get all countries and states for ID mapping
        const countries = await HrmsCountryMaster.findAll();
        const states = await HrmsStateMaster.findAll();

        // Create lookup maps
        const countryMap = {};
        countries.forEach(c => {
            countryMap[c.iso_code_2] = c.id;
        });

        const stateMap = {};
        states.forEach(s => {
            const key = `${s.country_id}_${s.state_name}`;
            stateMap[key] = { state_id: s.id, country_id: s.country_id };
        });

        const cities = [];

        // Helper function to add city using IDs
        const addCity = (countryIso, stateName, cityName, order) => {
            const countryId = countryMap[countryIso];
            if (!countryId) return;

            const stateKey = `${countryId}_${stateName}`;
            const stateData = stateMap[stateKey];
            if (!stateData) return;

            // Store using country_id and state_id (foreign keys)
            cities.push({
                country_id: stateData.country_id,  // Foreign key to country
                state_id: stateData.state_id,       // Foreign key to state
                city_name: cityName,
                is_active: true,
                display_order: order
            });
        };

        // INDIA - Major Cities (using IDs)
        addCity('IN', 'Maharashtra', 'Mumbai', 1);
        addCity('IN', 'Maharashtra', 'Pune', 2);
        addCity('IN', 'Maharashtra', 'Nagpur', 3);
        addCity('IN', 'Maharashtra', 'Nashik', 4);
        addCity('IN', 'Maharashtra', 'Aurangabad', 5);
        addCity('IN', 'Maharashtra', 'Thane', 6);
        addCity('IN', 'Maharashtra', 'Navi Mumbai', 7);
        addCity('IN', 'Maharashtra', 'Solapur', 8);
        addCity('IN', 'Maharashtra', 'Kolhapur', 9);

        addCity('IN', 'Delhi', 'New Delhi', 1);
        addCity('IN', 'Delhi', 'Delhi', 2);
        addCity('IN', 'Delhi', 'Dwarka', 3);
        addCity('IN', 'Delhi', 'Rohini', 4);

        addCity('IN', 'Karnataka', 'Bangalore', 1);
        addCity('IN', 'Karnataka', 'Mysore', 2);
        addCity('IN', 'Karnataka', 'Hubli', 3);
        addCity('IN', 'Karnataka', 'Mangalore', 4);
        addCity('IN', 'Karnataka', 'Belgaum', 5);
        addCity('IN', 'Karnataka', 'Gulbarga', 6);

        addCity('IN', 'Tamil Nadu', 'Chennai', 1);
        addCity('IN', 'Tamil Nadu', 'Coimbatore', 2);
        addCity('IN', 'Tamil Nadu', 'Madurai', 3);
        addCity('IN', 'Tamil Nadu', 'Tiruchirappalli', 4);
        addCity('IN', 'Tamil Nadu', 'Salem', 5);
        addCity('IN', 'Tamil Nadu', 'Tirunelveli', 6);
        addCity('IN', 'Tamil Nadu', 'Erode', 7);

        addCity('IN', 'Gujarat', 'Ahmedabad', 1);
        addCity('IN', 'Gujarat', 'Surat', 2);
        addCity('IN', 'Gujarat', 'Vadodara', 3);
        addCity('IN', 'Gujarat', 'Rajkot', 4);
        addCity('IN', 'Gujarat', 'Gandhinagar', 5);
        addCity('IN', 'Gujarat', 'Bhavnagar', 6);

        addCity('IN', 'West Bengal', 'Kolkata', 1);
        addCity('IN', 'West Bengal', 'Howrah', 2);
        addCity('IN', 'West Bengal', 'Durgapur', 3);
        addCity('IN', 'West Bengal', 'Siliguri', 4);
        addCity('IN', 'West Bengal', 'Asansol', 5);

        addCity('IN', 'Telangana', 'Hyderabad', 1);
        addCity('IN', 'Telangana', 'Warangal', 2);
        addCity('IN', 'Telangana', 'Nizamabad', 3);
        addCity('IN', 'Telangana', 'Karimnagar', 4);

        addCity('IN', 'Uttar Pradesh', 'Lucknow', 1);
        addCity('IN', 'Uttar Pradesh', 'Kanpur', 2);
        addCity('IN', 'Uttar Pradesh', 'Agra', 3);
        addCity('IN', 'Uttar Pradesh', 'Varanasi', 4);
        addCity('IN', 'Uttar Pradesh', 'Noida', 5);
        addCity('IN', 'Uttar Pradesh', 'Ghaziabad', 6);
        addCity('IN', 'Uttar Pradesh', 'Meerut', 7);
        addCity('IN', 'Uttar Pradesh', 'Allahabad', 8);
        addCity('IN', 'Uttar Pradesh', 'Bareilly', 9);

        addCity('IN', 'Rajasthan', 'Jaipur', 1);
        addCity('IN', 'Rajasthan', 'Jodhpur', 2);
        addCity('IN', 'Rajasthan', 'Udaipur', 3);
        addCity('IN', 'Rajasthan', 'Kota', 4);
        addCity('IN', 'Rajasthan', 'Ajmer', 5);
        addCity('IN', 'Rajasthan', 'Bikaner', 6);

        addCity('IN', 'Punjab', 'Ludhiana', 1);
        addCity('IN', 'Punjab', 'Amritsar', 2);
        addCity('IN', 'Punjab', 'Jalandhar', 3);
        addCity('IN', 'Punjab', 'Patiala', 4);

        addCity('IN', 'Haryana', 'Gurugram', 1);
        addCity('IN', 'Haryana', 'Faridabad', 2);
        addCity('IN', 'Haryana', 'Panipat', 3);
        addCity('IN', 'Haryana', 'Ambala', 4);
        addCity('IN', 'Haryana', 'Hisar', 5);

        addCity('IN', 'Kerala', 'Thiruvananthapuram', 1);
        addCity('IN', 'Kerala', 'Kochi', 2);
        addCity('IN', 'Kerala', 'Kozhikode', 3);
        addCity('IN', 'Kerala', 'Thrissur', 4);
        addCity('IN', 'Kerala', 'Kannur', 5);

        addCity('IN', 'Madhya Pradesh', 'Bhopal', 1);
        addCity('IN', 'Madhya Pradesh', 'Indore', 2);
        addCity('IN', 'Madhya Pradesh', 'Gwalior', 3);
        addCity('IN', 'Madhya Pradesh', 'Jabalpur', 4);
        addCity('IN', 'Madhya Pradesh', 'Ujjain', 5);

        addCity('IN', 'Bihar', 'Patna', 1);
        addCity('IN', 'Bihar', 'Gaya', 2);
        addCity('IN', 'Bihar', 'Bhagalpur', 3);
        addCity('IN', 'Bihar', 'Muzaffarpur', 4);

        addCity('IN', 'Andhra Pradesh', 'Visakhapatnam', 1);
        addCity('IN', 'Andhra Pradesh', 'Vijayawada', 2);
        addCity('IN', 'Andhra Pradesh', 'Guntur', 3);
        addCity('IN', 'Andhra Pradesh', 'Tirupati', 4);

        addCity('IN', 'Odisha', 'Bhubaneswar', 1);
        addCity('IN', 'Odisha', 'Cuttack', 2);
        addCity('IN', 'Odisha', 'Rourkela', 3);

        addCity('IN', 'Jharkhand', 'Ranchi', 1);
        addCity('IN', 'Jharkhand', 'Jamshedpur', 2);
        addCity('IN', 'Jharkhand', 'Dhanbad', 3);

        addCity('IN', 'Chhattisgarh', 'Raipur', 1);
        addCity('IN', 'Chhattisgarh', 'Bhilai', 2);
        addCity('IN', 'Chhattisgarh', 'Bilaspur', 3);

        addCity('IN', 'Uttarakhand', 'Dehradun', 1);
        addCity('IN', 'Uttarakhand', 'Haridwar', 2);
        addCity('IN', 'Uttarakhand', 'Roorkee', 3);

        addCity('IN', 'Assam', 'Guwahati', 1);
        addCity('IN', 'Assam', 'Silchar', 2);
        addCity('IN', 'Assam', 'Dibrugarh', 3);

        addCity('IN', 'Chandigarh', 'Chandigarh', 1);
        addCity('IN', 'Goa', 'Panaji', 1);
        addCity('IN', 'Goa', 'Vasco da Gama', 2);

        // UNITED STATES - Major Cities
        addCity('US', 'California', 'Los Angeles', 1);
        addCity('US', 'California', 'San Francisco', 2);
        addCity('US', 'California', 'San Diego', 3);
        addCity('US', 'California', 'San Jose', 4);
        addCity('US', 'California', 'Sacramento', 5);

        addCity('US', 'New York', 'New York City', 1);
        addCity('US', 'New York', 'Buffalo', 2);
        addCity('US', 'New York', 'Rochester', 3);

        addCity('US', 'Texas', 'Houston', 1);
        addCity('US', 'Texas', 'Dallas', 2);
        addCity('US', 'Texas', 'Austin', 3);
        addCity('US', 'Texas', 'San Antonio', 4);

        addCity('US', 'Florida', 'Miami', 1);
        addCity('US', 'Florida', 'Orlando', 2);
        addCity('US', 'Florida', 'Tampa', 3);
        addCity('US', 'Florida', 'Jacksonville', 4);

        addCity('US', 'Illinois', 'Chicago', 1);
        addCity('US', 'Pennsylvania', 'Philadelphia', 1);
        addCity('US', 'Pennsylvania', 'Pittsburgh', 2);
        addCity('US', 'Arizona', 'Phoenix', 1);
        addCity('US', 'Arizona', 'Tucson', 2);
        addCity('US', 'Nevada', 'Las Vegas', 1);
        addCity('US', 'Washington', 'Seattle', 1);
        addCity('US', 'Massachusetts', 'Boston', 1);
        addCity('US', 'Georgia', 'Atlanta', 1);
        addCity('US', 'Colorado', 'Denver', 1);
        addCity('US', 'Michigan', 'Detroit', 1);

        // CANADA - Major Cities
        addCity('CA', 'Ontario', 'Toronto', 1);
        addCity('CA', 'Ontario', 'Ottawa', 2);
        addCity('CA', 'Ontario', 'Mississauga', 3);
        addCity('CA', 'Quebec', 'Montreal', 1);
        addCity('CA', 'Quebec', 'Quebec City', 2);
        addCity('CA', 'British Columbia', 'Vancouver', 1);
        addCity('CA', 'British Columbia', 'Victoria', 2);
        addCity('CA', 'Alberta', 'Calgary', 1);
        addCity('CA', 'Alberta', 'Edmonton', 2);

        // AUSTRALIA - Major Cities
        addCity('AU', 'New South Wales', 'Sydney', 1);
        addCity('AU', 'Victoria', 'Melbourne', 1);
        addCity('AU', 'Queensland', 'Brisbane', 1);
        addCity('AU', 'Queensland', 'Gold Coast', 2);
        addCity('AU', 'Western Australia', 'Perth', 1);
        addCity('AU', 'South Australia', 'Adelaide', 1);
        addCity('AU', 'Australian Capital Territory', 'Canberra', 1);

        // CHINA - Major Cities
        addCity('CN', 'Beijing', 'Beijing', 1);
        addCity('CN', 'Shanghai', 'Shanghai', 1);
        addCity('CN', 'Guangdong', 'Guangzhou', 1);
        addCity('CN', 'Guangdong', 'Shenzhen', 2);
        addCity('CN', 'Chongqing', 'Chongqing', 1);
        addCity('CN', 'Tianjin', 'Tianjin', 1);
        addCity('CN', 'Sichuan', 'Chengdu', 1);
        addCity('CN', 'Hubei', 'Wuhan', 1);
        addCity('CN', 'Jiangsu', 'Nanjing', 1);
        addCity('CN', 'Zhejiang', 'Hangzhou', 1);

        // UNITED KINGDOM - Major Cities
        addCity('GB', 'England', 'London', 1);
        addCity('GB', 'England', 'Birmingham', 2);
        addCity('GB', 'England', 'Manchester', 3);
        addCity('GB', 'England', 'Liverpool', 4);
        addCity('GB', 'England', 'Leeds', 5);
        addCity('GB', 'Scotland', 'Edinburgh', 1);
        addCity('GB', 'Scotland', 'Glasgow', 2);
        addCity('GB', 'Wales', 'Cardiff', 1);
        addCity('GB', 'Northern Ireland', 'Belfast', 1);

        // GERMANY - Major Cities
        addCity('DE', 'Berlin', 'Berlin', 1);
        addCity('DE', 'Hamburg', 'Hamburg', 1);
        addCity('DE', 'Bavaria', 'Munich', 1);
        addCity('DE', 'Hesse', 'Frankfurt', 1);
        addCity('DE', 'North Rhine-Westphalia', 'Cologne', 1);
        addCity('DE', 'North Rhine-Westphalia', 'Dortmund', 2);

        // FRANCE - Major Cities
        addCity('FR', 'Île-de-France', 'Paris', 1);
        addCity('FR', 'Auvergne-Rhône-Alpes', 'Lyon', 1);
        addCity('FR', "Provence-Alpes-Côte d'Azur", 'Marseille', 1);
        addCity('FR', "Provence-Alpes-Côte d'Azur", 'Nice', 2);
        addCity('FR', 'Occitanie', 'Toulouse', 1);

        // BRAZIL - Major Cities
        addCity('BR', 'São Paulo', 'São Paulo', 1);
        addCity('BR', 'Rio de Janeiro', 'Rio de Janeiro', 1);
        addCity('BR', 'Bahia', 'Salvador', 1);
        addCity('BR', 'Distrito Federal', 'Brasília', 1);
        addCity('BR', 'Ceará', 'Fortaleza', 1);
        addCity('BR', 'Minas Gerais', 'Belo Horizonte', 1);

        // JAPAN - Major Cities
        addCity('JP', 'Tokyo', 'Tokyo', 1);
        addCity('JP', 'Osaka', 'Osaka', 1);
        addCity('JP', 'Kanagawa', 'Yokohama', 1);
        addCity('JP', 'Aichi', 'Nagoya', 1);
        addCity('JP', 'Hokkaido', 'Sapporo', 1);
        addCity('JP', 'Fukuoka', 'Fukuoka', 1);

        // MEXICO - Major Cities
        addCity('MX', 'Mexico City', 'Mexico City', 1);
        addCity('MX', 'Jalisco', 'Guadalajara', 1);
        addCity('MX', 'Nuevo León', 'Monterrey', 1);
        addCity('MX', 'Puebla', 'Puebla', 1);
        addCity('MX', 'Yucatán', 'Mérida', 1);

        // ITALY - Major Cities
        addCity('IT', 'Lazio', 'Rome', 1);
        addCity('IT', 'Lombardy', 'Milan', 1);
        addCity('IT', 'Campania', 'Naples', 1);
        addCity('IT', 'Sicily', 'Palermo', 1);
        addCity('IT', 'Veneto', 'Venice', 1);

        // SPAIN - Major Cities
        addCity('ES', 'Madrid', 'Madrid', 1);
        addCity('ES', 'Catalonia', 'Barcelona', 1);
        addCity('ES', 'Valencian Community', 'Valencia', 1);
        addCity('ES', 'Andalusia', 'Seville', 1);

        // SOUTH AFRICA - Major Cities
        addCity('ZA', 'Gauteng', 'Johannesburg', 1);
        addCity('ZA', 'Gauteng', 'Pretoria', 2);
        addCity('ZA', 'Western Cape', 'Cape Town', 1);
        addCity('ZA', 'KwaZulu-Natal', 'Durban', 1);

        // NIGERIA - Major Cities
        addCity('NG', 'Lagos', 'Lagos', 1);
        addCity('NG', 'Kano', 'Kano', 1);
        addCity('NG', 'Rivers', 'Port Harcourt', 1);
        addCity('NG', 'Federal Capital Territory', 'Abuja', 1);

        // PAKISTAN - Major Cities
        addCity('PK', 'Sindh', 'Karachi', 1);
        addCity('PK', 'Punjab', 'Lahore', 1);
        addCity('PK', 'Punjab', 'Faisalabad', 2);
        addCity('PK', 'Islamabad Capital Territory', 'Islamabad', 1);

        // RUSSIA - Major Cities
        addCity('RU', 'Moscow', 'Moscow', 1);
        addCity('RU', 'Saint Petersburg', 'Saint Petersburg', 1);
        addCity('RU', 'Novosibirsk Oblast', 'Novosibirsk', 1);

        // TURKEY - Major Cities
        addCity('TR', 'Istanbul', 'Istanbul', 1);
        addCity('TR', 'Ankara', 'Ankara', 1);
        addCity('TR', 'İzmir', 'Izmir', 1);

        // ARGENTINA - Major Cities
        addCity('AR', 'Ciudad Autónoma de Buenos Aires', 'Buenos Aires', 1);
        addCity('AR', 'Córdoba', 'Córdoba', 1);
        addCity('AR', 'Santa Fe', 'Rosario', 1);

        // INDONESIA - Major Cities
        addCity('ID', 'Jakarta', 'Jakarta', 1);
        addCity('ID', 'East Java', 'Surabaya', 1);
        addCity('ID', 'West Java', 'Bandung', 1);

        // BANGLADESH - Major Cities
        addCity('BD', 'Dhaka', 'Dhaka', 1);
        addCity('BD', 'Chittagong', 'Chittagong', 1);

        if (cities.length === 0) {
            console.log('⚠️  No cities to seed - states not found');
            return [];
        }

        // Insert cities using bulkCreate
        // Cities are stored with country_id and state_id (foreign key relationships)
        const result = await HrmsCityMaster.bulkCreate(cities, {
            updateOnDuplicate: ['city_name', 'is_active', 'display_order', 'updated_at']
        });

        console.log(`✓ ${result.length} cities seeded successfully`);
        console.log('✓ City data stored with country_id and state_id mappings');
        console.log('✓ City seeder completed');

        return result;
    } catch (error) {
        console.error('✗ City seeder error:', error.message);
        throw error;
    }
};

// Run seeder if called directly
if (require.main === module) {
    seedCities()
        .then(() => {
            console.log('✓ Seeding completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('✗ Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedCities };
