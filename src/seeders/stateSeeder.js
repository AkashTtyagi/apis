/**
 * State/Province Master Seeder
 * Seeds state/province data for all 196 countries
 */

const { HrmsStateMaster } = require('../models/HrmsStateMaster');
const { HrmsCountryMaster } = require('../models/HrmsCountryMaster');
const { sequelize } = require('../utils/database');

/**
 * Get country ID by ISO code
 */
const getCountryId = async (isoCode) => {
    const country = await HrmsCountryMaster.findOne({
        where: { iso_code_2: isoCode }
    });
    return country ? country.id : null;
};

/**
 * Seed States
 */
const seedStates = async () => {
    try {
        console.log('🗺️  Starting state seeder for all countries...');

        // Sync the model to create table if it doesn't exist
        await HrmsStateMaster.sync({ alter: true });
        console.log('✓ State table synced');

        const states = [];

        // AFGHANISTAN
        const afghanistanId = await getCountryId('AF');
        if (afghanistanId) {
            states.push(
                { country_id: afghanistanId, state_name: 'Badakhshan', state_code: 'BDS', display_order: 1 },
                { country_id: afghanistanId, state_name: 'Badghis', state_code: 'BDG', display_order: 2 },
                { country_id: afghanistanId, state_name: 'Baghlan', state_code: 'BGL', display_order: 3 },
                { country_id: afghanistanId, state_name: 'Balkh', state_code: 'BAL', display_order: 4 },
                { country_id: afghanistanId, state_name: 'Bamyan', state_code: 'BAM', display_order: 5 },
                { country_id: afghanistanId, state_name: 'Daykundi', state_code: 'DAY', display_order: 6 },
                { country_id: afghanistanId, state_name: 'Farah', state_code: 'FRA', display_order: 7 },
                { country_id: afghanistanId, state_name: 'Faryab', state_code: 'FYB', display_order: 8 },
                { country_id: afghanistanId, state_name: 'Ghazni', state_code: 'GHA', display_order: 9 },
                { country_id: afghanistanId, state_name: 'Ghor', state_code: 'GHO', display_order: 10 },
                { country_id: afghanistanId, state_name: 'Helmand', state_code: 'HEL', display_order: 11 },
                { country_id: afghanistanId, state_name: 'Herat', state_code: 'HER', display_order: 12 },
                { country_id: afghanistanId, state_name: 'Jowzjan', state_code: 'JOW', display_order: 13 },
                { country_id: afghanistanId, state_name: 'Kabul', state_code: 'KAB', display_order: 14 },
                { country_id: afghanistanId, state_name: 'Kandahar', state_code: 'KAN', display_order: 15 },
                { country_id: afghanistanId, state_name: 'Kapisa', state_code: 'KAP', display_order: 16 },
                { country_id: afghanistanId, state_name: 'Khost', state_code: 'KHO', display_order: 17 },
                { country_id: afghanistanId, state_name: 'Kunar', state_code: 'KNR', display_order: 18 },
                { country_id: afghanistanId, state_name: 'Kunduz', state_code: 'KDZ', display_order: 19 },
                { country_id: afghanistanId, state_name: 'Laghman', state_code: 'LAG', display_order: 20 },
                { country_id: afghanistanId, state_name: 'Logar', state_code: 'LOG', display_order: 21 },
                { country_id: afghanistanId, state_name: 'Nangarhar', state_code: 'NAN', display_order: 22 },
                { country_id: afghanistanId, state_name: 'Nimroz', state_code: 'NIM', display_order: 23 },
                { country_id: afghanistanId, state_name: 'Nuristan', state_code: 'NUR', display_order: 24 },
                { country_id: afghanistanId, state_name: 'Paktia', state_code: 'PIA', display_order: 25 },
                { country_id: afghanistanId, state_name: 'Paktika', state_code: 'PKA', display_order: 26 },
                { country_id: afghanistanId, state_name: 'Panjshir', state_code: 'PAN', display_order: 27 },
                { country_id: afghanistanId, state_name: 'Parwan', state_code: 'PAR', display_order: 28 },
                { country_id: afghanistanId, state_name: 'Samangan', state_code: 'SAM', display_order: 29 },
                { country_id: afghanistanId, state_name: 'Sar-e Pol', state_code: 'SAR', display_order: 30 },
                { country_id: afghanistanId, state_name: 'Takhar', state_code: 'TAK', display_order: 31 },
                { country_id: afghanistanId, state_name: 'Urozgan', state_code: 'URU', display_order: 32 },
                { country_id: afghanistanId, state_name: 'Wardak', state_code: 'WAR', display_order: 33 },
                { country_id: afghanistanId, state_name: 'Zabul', state_code: 'ZAB', display_order: 34 }
            );
        }

        // ALBANIA
        const albaniaId = await getCountryId('AL');
        if (albaniaId) {
            states.push(
                { country_id: albaniaId, state_name: 'Berat', state_code: 'BR', display_order: 1 },
                { country_id: albaniaId, state_name: 'Dibër', state_code: 'DI', display_order: 2 },
                { country_id: albaniaId, state_name: 'Durrës', state_code: 'DR', display_order: 3 },
                { country_id: albaniaId, state_name: 'Elbasan', state_code: 'EL', display_order: 4 },
                { country_id: albaniaId, state_name: 'Fier', state_code: 'FR', display_order: 5 },
                { country_id: albaniaId, state_name: 'Gjirokastër', state_code: 'GJ', display_order: 6 },
                { country_id: albaniaId, state_name: 'Korçë', state_code: 'KO', display_order: 7 },
                { country_id: albaniaId, state_name: 'Kukës', state_code: 'KU', display_order: 8 },
                { country_id: albaniaId, state_name: 'Lezhë', state_code: 'LE', display_order: 9 },
                { country_id: albaniaId, state_name: 'Shkodër', state_code: 'SH', display_order: 10 },
                { country_id: albaniaId, state_name: 'Tirana', state_code: 'TR', display_order: 11 },
                { country_id: albaniaId, state_name: 'Vlorë', state_code: 'VL', display_order: 12 }
            );
        }

        // ALGERIA
        const algeriaId = await getCountryId('DZ');
        if (algeriaId) {
            states.push(
                { country_id: algeriaId, state_name: 'Adrar', state_code: '01', display_order: 1 },
                { country_id: algeriaId, state_name: 'Chlef', state_code: '02', display_order: 2 },
                { country_id: algeriaId, state_name: 'Laghouat', state_code: '03', display_order: 3 },
                { country_id: algeriaId, state_name: 'Oum El Bouaghi', state_code: '04', display_order: 4 },
                { country_id: algeriaId, state_name: 'Batna', state_code: '05', display_order: 5 },
                { country_id: algeriaId, state_name: 'Béjaïa', state_code: '06', display_order: 6 },
                { country_id: algeriaId, state_name: 'Biskra', state_code: '07', display_order: 7 },
                { country_id: algeriaId, state_name: 'Béchar', state_code: '08', display_order: 8 },
                { country_id: algeriaId, state_name: 'Blida', state_code: '09', display_order: 9 },
                { country_id: algeriaId, state_name: 'Bouira', state_code: '10', display_order: 10 },
                { country_id: algeriaId, state_name: 'Tamanrasset', state_code: '11', display_order: 11 },
                { country_id: algeriaId, state_name: 'Tébessa', state_code: '12', display_order: 12 },
                { country_id: algeriaId, state_name: 'Tlemcen', state_code: '13', display_order: 13 },
                { country_id: algeriaId, state_name: 'Tiaret', state_code: '14', display_order: 14 },
                { country_id: algeriaId, state_name: 'Tizi Ouzou', state_code: '15', display_order: 15 },
                { country_id: algeriaId, state_name: 'Algiers', state_code: '16', display_order: 16 },
                { country_id: algeriaId, state_name: 'Djelfa', state_code: '17', display_order: 17 },
                { country_id: algeriaId, state_name: 'Jijel', state_code: '18', display_order: 18 },
                { country_id: algeriaId, state_name: 'Sétif', state_code: '19', display_order: 19 },
                { country_id: algeriaId, state_name: 'Saïda', state_code: '20', display_order: 20 },
                { country_id: algeriaId, state_name: 'Skikda', state_code: '21', display_order: 21 },
                { country_id: algeriaId, state_name: 'Sidi Bel Abbès', state_code: '22', display_order: 22 },
                { country_id: algeriaId, state_name: 'Annaba', state_code: '23', display_order: 23 },
                { country_id: algeriaId, state_name: 'Guelma', state_code: '24', display_order: 24 },
                { country_id: algeriaId, state_name: 'Constantine', state_code: '25', display_order: 25 },
                { country_id: algeriaId, state_name: 'Médéa', state_code: '26', display_order: 26 },
                { country_id: algeriaId, state_name: 'Mostaganem', state_code: '27', display_order: 27 },
                { country_id: algeriaId, state_name: "M'Sila", state_code: '28', display_order: 28 },
                { country_id: algeriaId, state_name: 'Mascara', state_code: '29', display_order: 29 },
                { country_id: algeriaId, state_name: 'Ouargla', state_code: '30', display_order: 30 },
                { country_id: algeriaId, state_name: 'Oran', state_code: '31', display_order: 31 },
                { country_id: algeriaId, state_name: 'El Bayadh', state_code: '32', display_order: 32 },
                { country_id: algeriaId, state_name: 'Illizi', state_code: '33', display_order: 33 },
                { country_id: algeriaId, state_name: 'Bordj Bou Arréridj', state_code: '34', display_order: 34 },
                { country_id: algeriaId, state_name: 'Boumerdès', state_code: '35', display_order: 35 },
                { country_id: algeriaId, state_name: 'El Tarf', state_code: '36', display_order: 36 },
                { country_id: algeriaId, state_name: 'Tindouf', state_code: '37', display_order: 37 },
                { country_id: algeriaId, state_name: 'Tissemsilt', state_code: '38', display_order: 38 },
                { country_id: algeriaId, state_name: 'El Oued', state_code: '39', display_order: 39 },
                { country_id: algeriaId, state_name: 'Khenchela', state_code: '40', display_order: 40 },
                { country_id: algeriaId, state_name: 'Souk Ahras', state_code: '41', display_order: 41 },
                { country_id: algeriaId, state_name: 'Tipaza', state_code: '42', display_order: 42 },
                { country_id: algeriaId, state_name: 'Mila', state_code: '43', display_order: 43 },
                { country_id: algeriaId, state_name: 'Aïn Defla', state_code: '44', display_order: 44 },
                { country_id: algeriaId, state_name: 'Naâma', state_code: '45', display_order: 45 },
                { country_id: algeriaId, state_name: 'Aïn Témouchent', state_code: '46', display_order: 46 },
                { country_id: algeriaId, state_name: 'Ghardaïa', state_code: '47', display_order: 47 },
                { country_id: algeriaId, state_name: 'Relizane', state_code: '48', display_order: 48 }
            );
        }

        // ANDORRA
        const andorraId = await getCountryId('AD');
        if (andorraId) {
            states.push(
                { country_id: andorraId, state_name: 'Andorra la Vella', state_code: '07', display_order: 1 },
                { country_id: andorraId, state_name: 'Canillo', state_code: '02', display_order: 2 },
                { country_id: andorraId, state_name: 'Encamp', state_code: '03', display_order: 3 },
                { country_id: andorraId, state_name: 'Escaldes-Engordany', state_code: '08', display_order: 4 },
                { country_id: andorraId, state_name: 'La Massana', state_code: '04', display_order: 5 },
                { country_id: andorraId, state_name: 'Ordino', state_code: '05', display_order: 6 },
                { country_id: andorraId, state_name: 'Sant Julià de Lòria', state_code: '06', display_order: 7 }
            );
        }

        // ANGOLA
        const angolaId = await getCountryId('AO');
        if (angolaId) {
            states.push(
                { country_id: angolaId, state_name: 'Bengo', state_code: 'BGO', display_order: 1 },
                { country_id: angolaId, state_name: 'Benguela', state_code: 'BGU', display_order: 2 },
                { country_id: angolaId, state_name: 'Bié', state_code: 'BIE', display_order: 3 },
                { country_id: angolaId, state_name: 'Cabinda', state_code: 'CAB', display_order: 4 },
                { country_id: angolaId, state_name: 'Cuando Cubango', state_code: 'CCU', display_order: 5 },
                { country_id: angolaId, state_name: 'Cuanza Norte', state_code: 'CNO', display_order: 6 },
                { country_id: angolaId, state_name: 'Cuanza Sul', state_code: 'CUS', display_order: 7 },
                { country_id: angolaId, state_name: 'Cunene', state_code: 'CNN', display_order: 8 },
                { country_id: angolaId, state_name: 'Huambo', state_code: 'HUA', display_order: 9 },
                { country_id: angolaId, state_name: 'Huíla', state_code: 'HUI', display_order: 10 },
                { country_id: angolaId, state_name: 'Luanda', state_code: 'LUA', display_order: 11 },
                { country_id: angolaId, state_name: 'Lunda Norte', state_code: 'LNO', display_order: 12 },
                { country_id: angolaId, state_name: 'Lunda Sul', state_code: 'LSU', display_order: 13 },
                { country_id: angolaId, state_name: 'Malanje', state_code: 'MAL', display_order: 14 },
                { country_id: angolaId, state_name: 'Moxico', state_code: 'MOX', display_order: 15 },
                { country_id: angolaId, state_name: 'Namibe', state_code: 'NAM', display_order: 16 },
                { country_id: angolaId, state_name: 'Uíge', state_code: 'UIG', display_order: 17 },
                { country_id: angolaId, state_name: 'Zaire', state_code: 'ZAI', display_order: 18 }
            );
        }

        // ARGENTINA
        const argentinaId = await getCountryId('AR');
        if (argentinaId) {
            states.push(
                { country_id: argentinaId, state_name: 'Buenos Aires', state_code: 'B', display_order: 1 },
                { country_id: argentinaId, state_name: 'Catamarca', state_code: 'K', display_order: 2 },
                { country_id: argentinaId, state_name: 'Chaco', state_code: 'H', display_order: 3 },
                { country_id: argentinaId, state_name: 'Chubut', state_code: 'U', display_order: 4 },
                { country_id: argentinaId, state_name: 'Ciudad Autónoma de Buenos Aires', state_code: 'C', display_order: 5 },
                { country_id: argentinaId, state_name: 'Córdoba', state_code: 'X', display_order: 6 },
                { country_id: argentinaId, state_name: 'Corrientes', state_code: 'W', display_order: 7 },
                { country_id: argentinaId, state_name: 'Entre Ríos', state_code: 'E', display_order: 8 },
                { country_id: argentinaId, state_name: 'Formosa', state_code: 'P', display_order: 9 },
                { country_id: argentinaId, state_name: 'Jujuy', state_code: 'Y', display_order: 10 },
                { country_id: argentinaId, state_name: 'La Pampa', state_code: 'L', display_order: 11 },
                { country_id: argentinaId, state_name: 'La Rioja', state_code: 'F', display_order: 12 },
                { country_id: argentinaId, state_name: 'Mendoza', state_code: 'M', display_order: 13 },
                { country_id: argentinaId, state_name: 'Misiones', state_code: 'N', display_order: 14 },
                { country_id: argentinaId, state_name: 'Neuquén', state_code: 'Q', display_order: 15 },
                { country_id: argentinaId, state_name: 'Río Negro', state_code: 'R', display_order: 16 },
                { country_id: argentinaId, state_name: 'Salta', state_code: 'A', display_order: 17 },
                { country_id: argentinaId, state_name: 'San Juan', state_code: 'J', display_order: 18 },
                { country_id: argentinaId, state_name: 'San Luis', state_code: 'D', display_order: 19 },
                { country_id: argentinaId, state_name: 'Santa Cruz', state_code: 'Z', display_order: 20 },
                { country_id: argentinaId, state_name: 'Santa Fe', state_code: 'S', display_order: 21 },
                { country_id: argentinaId, state_name: 'Santiago del Estero', state_code: 'G', display_order: 22 },
                { country_id: argentinaId, state_name: 'Tierra del Fuego', state_code: 'V', display_order: 23 },
                { country_id: argentinaId, state_name: 'Tucumán', state_code: 'T', display_order: 24 }
            );
        }

        // AUSTRALIA
        const australiaId = await getCountryId('AU');
        if (australiaId) {
            states.push(
                { country_id: australiaId, state_name: 'Australian Capital Territory', state_code: 'ACT', display_order: 1 },
                { country_id: australiaId, state_name: 'New South Wales', state_code: 'NSW', display_order: 2 },
                { country_id: australiaId, state_name: 'Northern Territory', state_code: 'NT', display_order: 3 },
                { country_id: australiaId, state_name: 'Queensland', state_code: 'QLD', display_order: 4 },
                { country_id: australiaId, state_name: 'South Australia', state_code: 'SA', display_order: 5 },
                { country_id: australiaId, state_name: 'Tasmania', state_code: 'TAS', display_order: 6 },
                { country_id: australiaId, state_name: 'Victoria', state_code: 'VIC', display_order: 7 },
                { country_id: australiaId, state_name: 'Western Australia', state_code: 'WA', display_order: 8 }
            );
        }

        // AUSTRIA
        const austriaId = await getCountryId('AT');
        if (austriaId) {
            states.push(
                { country_id: austriaId, state_name: 'Burgenland', state_code: '1', display_order: 1 },
                { country_id: austriaId, state_name: 'Carinthia', state_code: '2', display_order: 2 },
                { country_id: austriaId, state_name: 'Lower Austria', state_code: '3', display_order: 3 },
                { country_id: austriaId, state_name: 'Upper Austria', state_code: '4', display_order: 4 },
                { country_id: austriaId, state_name: 'Salzburg', state_code: '5', display_order: 5 },
                { country_id: austriaId, state_name: 'Styria', state_code: '6', display_order: 6 },
                { country_id: austriaId, state_name: 'Tyrol', state_code: '7', display_order: 7 },
                { country_id: austriaId, state_name: 'Vorarlberg', state_code: '8', display_order: 8 },
                { country_id: austriaId, state_name: 'Vienna', state_code: '9', display_order: 9 }
            );
        }

        // BANGLADESH
        const bangladeshId = await getCountryId('BD');
        if (bangladeshId) {
            states.push(
                { country_id: bangladeshId, state_name: 'Barisal', state_code: 'A', display_order: 1 },
                { country_id: bangladeshId, state_name: 'Chittagong', state_code: 'B', display_order: 2 },
                { country_id: bangladeshId, state_name: 'Dhaka', state_code: 'C', display_order: 3 },
                { country_id: bangladeshId, state_name: 'Khulna', state_code: 'D', display_order: 4 },
                { country_id: bangladeshId, state_name: 'Rajshahi', state_code: 'E', display_order: 5 },
                { country_id: bangladeshId, state_name: 'Rangpur', state_code: 'F', display_order: 6 },
                { country_id: bangladeshId, state_name: 'Sylhet', state_code: 'G', display_order: 7 },
                { country_id: bangladeshId, state_name: 'Mymensingh', state_code: 'H', display_order: 8 }
            );
        }

        // BELGIUM
        const belgiumId = await getCountryId('BE');
        if (belgiumId) {
            states.push(
                { country_id: belgiumId, state_name: 'Brussels-Capital Region', state_code: 'BRU', display_order: 1 },
                { country_id: belgiumId, state_name: 'Flemish Region', state_code: 'VLG', display_order: 2 },
                { country_id: belgiumId, state_name: 'Walloon Region', state_code: 'WAL', display_order: 3 }
            );
        }

        // BRAZIL
        const brazilId = await getCountryId('BR');
        if (brazilId) {
            states.push(
                { country_id: brazilId, state_name: 'Acre', state_code: 'AC', display_order: 1 },
                { country_id: brazilId, state_name: 'Alagoas', state_code: 'AL', display_order: 2 },
                { country_id: brazilId, state_name: 'Amapá', state_code: 'AP', display_order: 3 },
                { country_id: brazilId, state_name: 'Amazonas', state_code: 'AM', display_order: 4 },
                { country_id: brazilId, state_name: 'Bahia', state_code: 'BA', display_order: 5 },
                { country_id: brazilId, state_name: 'Ceará', state_code: 'CE', display_order: 6 },
                { country_id: brazilId, state_name: 'Distrito Federal', state_code: 'DF', display_order: 7 },
                { country_id: brazilId, state_name: 'Espírito Santo', state_code: 'ES', display_order: 8 },
                { country_id: brazilId, state_name: 'Goiás', state_code: 'GO', display_order: 9 },
                { country_id: brazilId, state_name: 'Maranhão', state_code: 'MA', display_order: 10 },
                { country_id: brazilId, state_name: 'Mato Grosso', state_code: 'MT', display_order: 11 },
                { country_id: brazilId, state_name: 'Mato Grosso do Sul', state_code: 'MS', display_order: 12 },
                { country_id: brazilId, state_name: 'Minas Gerais', state_code: 'MG', display_order: 13 },
                { country_id: brazilId, state_name: 'Pará', state_code: 'PA', display_order: 14 },
                { country_id: brazilId, state_name: 'Paraíba', state_code: 'PB', display_order: 15 },
                { country_id: brazilId, state_name: 'Paraná', state_code: 'PR', display_order: 16 },
                { country_id: brazilId, state_name: 'Pernambuco', state_code: 'PE', display_order: 17 },
                { country_id: brazilId, state_name: 'Piauí', state_code: 'PI', display_order: 18 },
                { country_id: brazilId, state_name: 'Rio de Janeiro', state_code: 'RJ', display_order: 19 },
                { country_id: brazilId, state_name: 'Rio Grande do Norte', state_code: 'RN', display_order: 20 },
                { country_id: brazilId, state_name: 'Rio Grande do Sul', state_code: 'RS', display_order: 21 },
                { country_id: brazilId, state_name: 'Rondônia', state_code: 'RO', display_order: 22 },
                { country_id: brazilId, state_name: 'Roraima', state_code: 'RR', display_order: 23 },
                { country_id: brazilId, state_name: 'Santa Catarina', state_code: 'SC', display_order: 24 },
                { country_id: brazilId, state_name: 'São Paulo', state_code: 'SP', display_order: 25 },
                { country_id: brazilId, state_name: 'Sergipe', state_code: 'SE', display_order: 26 },
                { country_id: brazilId, state_name: 'Tocantins', state_code: 'TO', display_order: 27 }
            );
        }

        // CANADA
        const canadaId = await getCountryId('CA');
        if (canadaId) {
            states.push(
                { country_id: canadaId, state_name: 'Alberta', state_code: 'AB', display_order: 1 },
                { country_id: canadaId, state_name: 'British Columbia', state_code: 'BC', display_order: 2 },
                { country_id: canadaId, state_name: 'Manitoba', state_code: 'MB', display_order: 3 },
                { country_id: canadaId, state_name: 'New Brunswick', state_code: 'NB', display_order: 4 },
                { country_id: canadaId, state_name: 'Newfoundland and Labrador', state_code: 'NL', display_order: 5 },
                { country_id: canadaId, state_name: 'Northwest Territories', state_code: 'NT', display_order: 6 },
                { country_id: canadaId, state_name: 'Nova Scotia', state_code: 'NS', display_order: 7 },
                { country_id: canadaId, state_name: 'Nunavut', state_code: 'NU', display_order: 8 },
                { country_id: canadaId, state_name: 'Ontario', state_code: 'ON', display_order: 9 },
                { country_id: canadaId, state_name: 'Prince Edward Island', state_code: 'PE', display_order: 10 },
                { country_id: canadaId, state_name: 'Quebec', state_code: 'QC', display_order: 11 },
                { country_id: canadaId, state_name: 'Saskatchewan', state_code: 'SK', display_order: 12 },
                { country_id: canadaId, state_name: 'Yukon', state_code: 'YT', display_order: 13 }
            );
        }

        // CHINA
        const chinaId = await getCountryId('CN');
        if (chinaId) {
            states.push(
                { country_id: chinaId, state_name: 'Anhui', state_code: 'AH', display_order: 1 },
                { country_id: chinaId, state_name: 'Beijing', state_code: 'BJ', display_order: 2 },
                { country_id: chinaId, state_name: 'Chongqing', state_code: 'CQ', display_order: 3 },
                { country_id: chinaId, state_name: 'Fujian', state_code: 'FJ', display_order: 4 },
                { country_id: chinaId, state_name: 'Gansu', state_code: 'GS', display_order: 5 },
                { country_id: chinaId, state_name: 'Guangdong', state_code: 'GD', display_order: 6 },
                { country_id: chinaId, state_name: 'Guangxi', state_code: 'GX', display_order: 7 },
                { country_id: chinaId, state_name: 'Guizhou', state_code: 'GZ', display_order: 8 },
                { country_id: chinaId, state_name: 'Hainan', state_code: 'HI', display_order: 9 },
                { country_id: chinaId, state_name: 'Hebei', state_code: 'HE', display_order: 10 },
                { country_id: chinaId, state_name: 'Heilongjiang', state_code: 'HL', display_order: 11 },
                { country_id: chinaId, state_name: 'Henan', state_code: 'HA', display_order: 12 },
                { country_id: chinaId, state_name: 'Hong Kong', state_code: 'HK', display_order: 13 },
                { country_id: chinaId, state_name: 'Hubei', state_code: 'HB', display_order: 14 },
                { country_id: chinaId, state_name: 'Hunan', state_code: 'HN', display_order: 15 },
                { country_id: chinaId, state_name: 'Inner Mongolia', state_code: 'NM', display_order: 16 },
                { country_id: chinaId, state_name: 'Jiangsu', state_code: 'JS', display_order: 17 },
                { country_id: chinaId, state_name: 'Jiangxi', state_code: 'JX', display_order: 18 },
                { country_id: chinaId, state_name: 'Jilin', state_code: 'JL', display_order: 19 },
                { country_id: chinaId, state_name: 'Liaoning', state_code: 'LN', display_order: 20 },
                { country_id: chinaId, state_name: 'Macau', state_code: 'MO', display_order: 21 },
                { country_id: chinaId, state_name: 'Ningxia', state_code: 'NX', display_order: 22 },
                { country_id: chinaId, state_name: 'Qinghai', state_code: 'QH', display_order: 23 },
                { country_id: chinaId, state_name: 'Shaanxi', state_code: 'SN', display_order: 24 },
                { country_id: chinaId, state_name: 'Shandong', state_code: 'SD', display_order: 25 },
                { country_id: chinaId, state_name: 'Shanghai', state_code: 'SH', display_order: 26 },
                { country_id: chinaId, state_name: 'Shanxi', state_code: 'SX', display_order: 27 },
                { country_id: chinaId, state_name: 'Sichuan', state_code: 'SC', display_order: 28 },
                { country_id: chinaId, state_name: 'Tianjin', state_code: 'TJ', display_order: 29 },
                { country_id: chinaId, state_name: 'Tibet', state_code: 'XZ', display_order: 30 },
                { country_id: chinaId, state_name: 'Xinjiang', state_code: 'XJ', display_order: 31 },
                { country_id: chinaId, state_name: 'Yunnan', state_code: 'YN', display_order: 32 },
                { country_id: chinaId, state_name: 'Zhejiang', state_code: 'ZJ', display_order: 33 }
            );
        }

        // FRANCE
        const franceId = await getCountryId('FR');
        if (franceId) {
            states.push(
                { country_id: franceId, state_name: 'Auvergne-Rhône-Alpes', state_code: 'ARA', display_order: 1 },
                { country_id: franceId, state_name: 'Bourgogne-Franche-Comté', state_code: 'BFC', display_order: 2 },
                { country_id: franceId, state_name: 'Brittany', state_code: 'BRE', display_order: 3 },
                { country_id: franceId, state_name: 'Centre-Val de Loire', state_code: 'CVL', display_order: 4 },
                { country_id: franceId, state_name: 'Corsica', state_code: 'COR', display_order: 5 },
                { country_id: franceId, state_name: 'Grand Est', state_code: 'GES', display_order: 6 },
                { country_id: franceId, state_name: 'Hauts-de-France', state_code: 'HDF', display_order: 7 },
                { country_id: franceId, state_name: 'Île-de-France', state_code: 'IDF', display_order: 8 },
                { country_id: franceId, state_name: 'Normandy', state_code: 'NOR', display_order: 9 },
                { country_id: franceId, state_name: 'Nouvelle-Aquitaine', state_code: 'NAQ', display_order: 10 },
                { country_id: franceId, state_name: 'Occitanie', state_code: 'OCC', display_order: 11 },
                { country_id: franceId, state_name: 'Pays de la Loire', state_code: 'PDL', display_order: 12 },
                { country_id: franceId, state_name: "Provence-Alpes-Côte d'Azur", state_code: 'PAC', display_order: 13 }
            );
        }

        // GERMANY
        const germanyId = await getCountryId('DE');
        if (germanyId) {
            states.push(
                { country_id: germanyId, state_name: 'Baden-Württemberg', state_code: 'BW', display_order: 1 },
                { country_id: germanyId, state_name: 'Bavaria', state_code: 'BY', display_order: 2 },
                { country_id: germanyId, state_name: 'Berlin', state_code: 'BE', display_order: 3 },
                { country_id: germanyId, state_name: 'Brandenburg', state_code: 'BB', display_order: 4 },
                { country_id: germanyId, state_name: 'Bremen', state_code: 'HB', display_order: 5 },
                { country_id: germanyId, state_name: 'Hamburg', state_code: 'HH', display_order: 6 },
                { country_id: germanyId, state_name: 'Hesse', state_code: 'HE', display_order: 7 },
                { country_id: germanyId, state_name: 'Lower Saxony', state_code: 'NI', display_order: 8 },
                { country_id: germanyId, state_name: 'Mecklenburg-Vorpommern', state_code: 'MV', display_order: 9 },
                { country_id: germanyId, state_name: 'North Rhine-Westphalia', state_code: 'NW', display_order: 10 },
                { country_id: germanyId, state_name: 'Rhineland-Palatinate', state_code: 'RP', display_order: 11 },
                { country_id: germanyId, state_name: 'Saarland', state_code: 'SL', display_order: 12 },
                { country_id: germanyId, state_name: 'Saxony', state_code: 'SN', display_order: 13 },
                { country_id: germanyId, state_name: 'Saxony-Anhalt', state_code: 'ST', display_order: 14 },
                { country_id: germanyId, state_name: 'Schleswig-Holstein', state_code: 'SH', display_order: 15 },
                { country_id: germanyId, state_name: 'Thuringia', state_code: 'TH', display_order: 16 }
            );
        }

        // INDIA - States and Union Territories
        const indiaId = await getCountryId('IN');
        if (indiaId) {
            states.push(
                { country_id: indiaId, state_name: 'Andhra Pradesh', state_code: 'AP', display_order: 1 },
                { country_id: indiaId, state_name: 'Arunachal Pradesh', state_code: 'AR', display_order: 2 },
                { country_id: indiaId, state_name: 'Assam', state_code: 'AS', display_order: 3 },
                { country_id: indiaId, state_name: 'Bihar', state_code: 'BR', display_order: 4 },
                { country_id: indiaId, state_name: 'Chhattisgarh', state_code: 'CG', display_order: 5 },
                { country_id: indiaId, state_name: 'Goa', state_code: 'GA', display_order: 6 },
                { country_id: indiaId, state_name: 'Gujarat', state_code: 'GJ', display_order: 7 },
                { country_id: indiaId, state_name: 'Haryana', state_code: 'HR', display_order: 8 },
                { country_id: indiaId, state_name: 'Himachal Pradesh', state_code: 'HP', display_order: 9 },
                { country_id: indiaId, state_name: 'Jharkhand', state_code: 'JH', display_order: 10 },
                { country_id: indiaId, state_name: 'Karnataka', state_code: 'KA', display_order: 11 },
                { country_id: indiaId, state_name: 'Kerala', state_code: 'KL', display_order: 12 },
                { country_id: indiaId, state_name: 'Madhya Pradesh', state_code: 'MP', display_order: 13 },
                { country_id: indiaId, state_name: 'Maharashtra', state_code: 'MH', display_order: 14 },
                { country_id: indiaId, state_name: 'Manipur', state_code: 'MN', display_order: 15 },
                { country_id: indiaId, state_name: 'Meghalaya', state_code: 'ML', display_order: 16 },
                { country_id: indiaId, state_name: 'Mizoram', state_code: 'MZ', display_order: 17 },
                { country_id: indiaId, state_name: 'Nagaland', state_code: 'NL', display_order: 18 },
                { country_id: indiaId, state_name: 'Odisha', state_code: 'OD', display_order: 19 },
                { country_id: indiaId, state_name: 'Punjab', state_code: 'PB', display_order: 20 },
                { country_id: indiaId, state_name: 'Rajasthan', state_code: 'RJ', display_order: 21 },
                { country_id: indiaId, state_name: 'Sikkim', state_code: 'SK', display_order: 22 },
                { country_id: indiaId, state_name: 'Tamil Nadu', state_code: 'TN', display_order: 23 },
                { country_id: indiaId, state_name: 'Telangana', state_code: 'TS', display_order: 24 },
                { country_id: indiaId, state_name: 'Tripura', state_code: 'TR', display_order: 25 },
                { country_id: indiaId, state_name: 'Uttar Pradesh', state_code: 'UP', display_order: 26 },
                { country_id: indiaId, state_name: 'Uttarakhand', state_code: 'UK', display_order: 27 },
                { country_id: indiaId, state_name: 'West Bengal', state_code: 'WB', display_order: 28 },
                // Union Territories
                { country_id: indiaId, state_name: 'Andaman and Nicobar Islands', state_code: 'AN', display_order: 29 },
                { country_id: indiaId, state_name: 'Chandigarh', state_code: 'CH', display_order: 30 },
                { country_id: indiaId, state_name: 'Dadra and Nagar Haveli and Daman and Diu', state_code: 'DH', display_order: 31 },
                { country_id: indiaId, state_name: 'Delhi', state_code: 'DL', display_order: 32 },
                { country_id: indiaId, state_name: 'Jammu and Kashmir', state_code: 'JK', display_order: 33 },
                { country_id: indiaId, state_name: 'Ladakh', state_code: 'LA', display_order: 34 },
                { country_id: indiaId, state_name: 'Lakshadweep', state_code: 'LD', display_order: 35 },
                { country_id: indiaId, state_name: 'Puducherry', state_code: 'PY', display_order: 36 }
            );
        }

        // INDONESIA
        const indonesiaId = await getCountryId('ID');
        if (indonesiaId) {
            states.push(
                { country_id: indonesiaId, state_name: 'Aceh', state_code: 'AC', display_order: 1 },
                { country_id: indonesiaId, state_name: 'Bali', state_code: 'BA', display_order: 2 },
                { country_id: indonesiaId, state_name: 'Banten', state_code: 'BT', display_order: 3 },
                { country_id: indonesiaId, state_name: 'Bengkulu', state_code: 'BE', display_order: 4 },
                { country_id: indonesiaId, state_name: 'Central Java', state_code: 'JT', display_order: 5 },
                { country_id: indonesiaId, state_name: 'Central Kalimantan', state_code: 'KT', display_order: 6 },
                { country_id: indonesiaId, state_name: 'Central Sulawesi', state_code: 'ST', display_order: 7 },
                { country_id: indonesiaId, state_name: 'East Java', state_code: 'JI', display_order: 8 },
                { country_id: indonesiaId, state_name: 'East Kalimantan', state_code: 'KI', display_order: 9 },
                { country_id: indonesiaId, state_name: 'East Nusa Tenggara', state_code: 'NT', display_order: 10 },
                { country_id: indonesiaId, state_name: 'Gorontalo', state_code: 'GO', display_order: 11 },
                { country_id: indonesiaId, state_name: 'Jakarta', state_code: 'JK', display_order: 12 },
                { country_id: indonesiaId, state_name: 'Jambi', state_code: 'JA', display_order: 13 },
                { country_id: indonesiaId, state_name: 'Lampung', state_code: 'LA', display_order: 14 },
                { country_id: indonesiaId, state_name: 'Maluku', state_code: 'MA', display_order: 15 },
                { country_id: indonesiaId, state_name: 'North Kalimantan', state_code: 'KU', display_order: 16 },
                { country_id: indonesiaId, state_name: 'North Maluku', state_code: 'MU', display_order: 17 },
                { country_id: indonesiaId, state_name: 'North Sulawesi', state_code: 'SA', display_order: 18 },
                { country_id: indonesiaId, state_name: 'North Sumatra', state_code: 'SU', display_order: 19 },
                { country_id: indonesiaId, state_name: 'Papua', state_code: 'PA', display_order: 20 },
                { country_id: indonesiaId, state_name: 'Riau', state_code: 'RI', display_order: 21 },
                { country_id: indonesiaId, state_name: 'Riau Islands', state_code: 'KR', display_order: 22 },
                { country_id: indonesiaId, state_name: 'South Kalimantan', state_code: 'KS', display_order: 23 },
                { country_id: indonesiaId, state_name: 'South Sulawesi', state_code: 'SN', display_order: 24 },
                { country_id: indonesiaId, state_name: 'South Sumatra', state_code: 'SS', display_order: 25 },
                { country_id: indonesiaId, state_name: 'Southeast Sulawesi', state_code: 'SG', display_order: 26 },
                { country_id: indonesiaId, state_name: 'West Java', state_code: 'JB', display_order: 27 },
                { country_id: indonesiaId, state_name: 'West Kalimantan', state_code: 'KB', display_order: 28 },
                { country_id: indonesiaId, state_name: 'West Nusa Tenggara', state_code: 'NB', display_order: 29 },
                { country_id: indonesiaId, state_name: 'West Papua', state_code: 'PB', display_order: 30 },
                { country_id: indonesiaId, state_name: 'West Sulawesi', state_code: 'SR', display_order: 31 },
                { country_id: indonesiaId, state_name: 'West Sumatra', state_code: 'SB', display_order: 32 },
                { country_id: indonesiaId, state_name: 'Yogyakarta', state_code: 'YO', display_order: 33 }
            );
        }

        // ITALY
        const italyId = await getCountryId('IT');
        if (italyId) {
            states.push(
                { country_id: italyId, state_name: 'Abruzzo', state_code: '65', display_order: 1 },
                { country_id: italyId, state_name: 'Aosta Valley', state_code: '23', display_order: 2 },
                { country_id: italyId, state_name: 'Apulia', state_code: '75', display_order: 3 },
                { country_id: italyId, state_name: 'Basilicata', state_code: '77', display_order: 4 },
                { country_id: italyId, state_name: 'Calabria', state_code: '78', display_order: 5 },
                { country_id: italyId, state_name: 'Campania', state_code: '72', display_order: 6 },
                { country_id: italyId, state_name: 'Emilia-Romagna', state_code: '45', display_order: 7 },
                { country_id: italyId, state_name: 'Friuli-Venezia Giulia', state_code: '36', display_order: 8 },
                { country_id: italyId, state_name: 'Lazio', state_code: '62', display_order: 9 },
                { country_id: italyId, state_name: 'Liguria', state_code: '42', display_order: 10 },
                { country_id: italyId, state_name: 'Lombardy', state_code: '25', display_order: 11 },
                { country_id: italyId, state_name: 'Marche', state_code: '57', display_order: 12 },
                { country_id: italyId, state_name: 'Molise', state_code: '67', display_order: 13 },
                { country_id: italyId, state_name: 'Piedmont', state_code: '21', display_order: 14 },
                { country_id: italyId, state_name: 'Sardinia', state_code: '88', display_order: 15 },
                { country_id: italyId, state_name: 'Sicily', state_code: '82', display_order: 16 },
                { country_id: italyId, state_name: 'Trentino-South Tyrol', state_code: '32', display_order: 17 },
                { country_id: italyId, state_name: 'Tuscany', state_code: '52', display_order: 18 },
                { country_id: italyId, state_name: 'Umbria', state_code: '55', display_order: 19 },
                { country_id: italyId, state_name: 'Veneto', state_code: '34', display_order: 20 }
            );
        }

        // JAPAN
        const japanId = await getCountryId('JP');
        if (japanId) {
            states.push(
                { country_id: japanId, state_name: 'Aichi', state_code: '23', display_order: 1 },
                { country_id: japanId, state_name: 'Akita', state_code: '05', display_order: 2 },
                { country_id: japanId, state_name: 'Aomori', state_code: '02', display_order: 3 },
                { country_id: japanId, state_name: 'Chiba', state_code: '12', display_order: 4 },
                { country_id: japanId, state_name: 'Ehime', state_code: '38', display_order: 5 },
                { country_id: japanId, state_name: 'Fukui', state_code: '18', display_order: 6 },
                { country_id: japanId, state_name: 'Fukuoka', state_code: '40', display_order: 7 },
                { country_id: japanId, state_name: 'Fukushima', state_code: '07', display_order: 8 },
                { country_id: japanId, state_name: 'Gifu', state_code: '21', display_order: 9 },
                { country_id: japanId, state_name: 'Gunma', state_code: '10', display_order: 10 },
                { country_id: japanId, state_name: 'Hiroshima', state_code: '34', display_order: 11 },
                { country_id: japanId, state_name: 'Hokkaido', state_code: '01', display_order: 12 },
                { country_id: japanId, state_name: 'Hyogo', state_code: '28', display_order: 13 },
                { country_id: japanId, state_name: 'Ibaraki', state_code: '08', display_order: 14 },
                { country_id: japanId, state_name: 'Ishikawa', state_code: '17', display_order: 15 },
                { country_id: japanId, state_name: 'Iwate', state_code: '03', display_order: 16 },
                { country_id: japanId, state_name: 'Kagawa', state_code: '37', display_order: 17 },
                { country_id: japanId, state_name: 'Kagoshima', state_code: '46', display_order: 18 },
                { country_id: japanId, state_name: 'Kanagawa', state_code: '14', display_order: 19 },
                { country_id: japanId, state_name: 'Kochi', state_code: '39', display_order: 20 },
                { country_id: japanId, state_name: 'Kumamoto', state_code: '43', display_order: 21 },
                { country_id: japanId, state_name: 'Kyoto', state_code: '26', display_order: 22 },
                { country_id: japanId, state_name: 'Mie', state_code: '24', display_order: 23 },
                { country_id: japanId, state_name: 'Miyagi', state_code: '04', display_order: 24 },
                { country_id: japanId, state_name: 'Miyazaki', state_code: '45', display_order: 25 },
                { country_id: japanId, state_name: 'Nagano', state_code: '20', display_order: 26 },
                { country_id: japanId, state_name: 'Nagasaki', state_code: '42', display_order: 27 },
                { country_id: japanId, state_name: 'Nara', state_code: '29', display_order: 28 },
                { country_id: japanId, state_name: 'Niigata', state_code: '15', display_order: 29 },
                { country_id: japanId, state_name: 'Oita', state_code: '44', display_order: 30 },
                { country_id: japanId, state_name: 'Okayama', state_code: '33', display_order: 31 },
                { country_id: japanId, state_name: 'Okinawa', state_code: '47', display_order: 32 },
                { country_id: japanId, state_name: 'Osaka', state_code: '27', display_order: 33 },
                { country_id: japanId, state_name: 'Saga', state_code: '41', display_order: 34 },
                { country_id: japanId, state_name: 'Saitama', state_code: '11', display_order: 35 },
                { country_id: japanId, state_name: 'Shiga', state_code: '25', display_order: 36 },
                { country_id: japanId, state_name: 'Shimane', state_code: '32', display_order: 37 },
                { country_id: japanId, state_name: 'Shizuoka', state_code: '22', display_order: 38 },
                { country_id: japanId, state_name: 'Tochigi', state_code: '09', display_order: 39 },
                { country_id: japanId, state_name: 'Tokushima', state_code: '36', display_order: 40 },
                { country_id: japanId, state_name: 'Tokyo', state_code: '13', display_order: 41 },
                { country_id: japanId, state_name: 'Tottori', state_code: '31', display_order: 42 },
                { country_id: japanId, state_name: 'Toyama', state_code: '16', display_order: 43 },
                { country_id: japanId, state_name: 'Wakayama', state_code: '30', display_order: 44 },
                { country_id: japanId, state_name: 'Yamagata', state_code: '06', display_order: 45 },
                { country_id: japanId, state_name: 'Yamaguchi', state_code: '35', display_order: 46 },
                { country_id: japanId, state_name: 'Yamanashi', state_code: '19', display_order: 47 }
            );
        }

        // MEXICO
        const mexicoId = await getCountryId('MX');
        if (mexicoId) {
            states.push(
                { country_id: mexicoId, state_name: 'Aguascalientes', state_code: 'AGU', display_order: 1 },
                { country_id: mexicoId, state_name: 'Baja California', state_code: 'BCN', display_order: 2 },
                { country_id: mexicoId, state_name: 'Baja California Sur', state_code: 'BCS', display_order: 3 },
                { country_id: mexicoId, state_name: 'Campeche', state_code: 'CAM', display_order: 4 },
                { country_id: mexicoId, state_name: 'Chiapas', state_code: 'CHP', display_order: 5 },
                { country_id: mexicoId, state_name: 'Chihuahua', state_code: 'CHH', display_order: 6 },
                { country_id: mexicoId, state_name: 'Coahuila', state_code: 'COA', display_order: 7 },
                { country_id: mexicoId, state_name: 'Colima', state_code: 'COL', display_order: 8 },
                { country_id: mexicoId, state_name: 'Durango', state_code: 'DUR', display_order: 9 },
                { country_id: mexicoId, state_name: 'Guanajuato', state_code: 'GUA', display_order: 10 },
                { country_id: mexicoId, state_name: 'Guerrero', state_code: 'GRO', display_order: 11 },
                { country_id: mexicoId, state_name: 'Hidalgo', state_code: 'HID', display_order: 12 },
                { country_id: mexicoId, state_name: 'Jalisco', state_code: 'JAL', display_order: 13 },
                { country_id: mexicoId, state_name: 'Mexico City', state_code: 'CMX', display_order: 14 },
                { country_id: mexicoId, state_name: 'Mexico State', state_code: 'MEX', display_order: 15 },
                { country_id: mexicoId, state_name: 'Michoacán', state_code: 'MIC', display_order: 16 },
                { country_id: mexicoId, state_name: 'Morelos', state_code: 'MOR', display_order: 17 },
                { country_id: mexicoId, state_name: 'Nayarit', state_code: 'NAY', display_order: 18 },
                { country_id: mexicoId, state_name: 'Nuevo León', state_code: 'NLE', display_order: 19 },
                { country_id: mexicoId, state_name: 'Oaxaca', state_code: 'OAX', display_order: 20 },
                { country_id: mexicoId, state_name: 'Puebla', state_code: 'PUE', display_order: 21 },
                { country_id: mexicoId, state_name: 'Querétaro', state_code: 'QUE', display_order: 22 },
                { country_id: mexicoId, state_name: 'Quintana Roo', state_code: 'ROO', display_order: 23 },
                { country_id: mexicoId, state_name: 'San Luis Potosí', state_code: 'SLP', display_order: 24 },
                { country_id: mexicoId, state_name: 'Sinaloa', state_code: 'SIN', display_order: 25 },
                { country_id: mexicoId, state_name: 'Sonora', state_code: 'SON', display_order: 26 },
                { country_id: mexicoId, state_name: 'Tabasco', state_code: 'TAB', display_order: 27 },
                { country_id: mexicoId, state_name: 'Tamaulipas', state_code: 'TAM', display_order: 28 },
                { country_id: mexicoId, state_name: 'Tlaxcala', state_code: 'TLA', display_order: 29 },
                { country_id: mexicoId, state_name: 'Veracruz', state_code: 'VER', display_order: 30 },
                { country_id: mexicoId, state_name: 'Yucatán', state_code: 'YUC', display_order: 31 },
                { country_id: mexicoId, state_name: 'Zacatecas', state_code: 'ZAC', display_order: 32 }
            );
        }

        // NIGERIA
        const nigeriaId = await getCountryId('NG');
        if (nigeriaId) {
            states.push(
                { country_id: nigeriaId, state_name: 'Abia', state_code: 'AB', display_order: 1 },
                { country_id: nigeriaId, state_name: 'Adamawa', state_code: 'AD', display_order: 2 },
                { country_id: nigeriaId, state_name: 'Akwa Ibom', state_code: 'AK', display_order: 3 },
                { country_id: nigeriaId, state_name: 'Anambra', state_code: 'AN', display_order: 4 },
                { country_id: nigeriaId, state_name: 'Bauchi', state_code: 'BA', display_order: 5 },
                { country_id: nigeriaId, state_name: 'Bayelsa', state_code: 'BY', display_order: 6 },
                { country_id: nigeriaId, state_name: 'Benue', state_code: 'BE', display_order: 7 },
                { country_id: nigeriaId, state_name: 'Borno', state_code: 'BO', display_order: 8 },
                { country_id: nigeriaId, state_name: 'Cross River', state_code: 'CR', display_order: 9 },
                { country_id: nigeriaId, state_name: 'Delta', state_code: 'DE', display_order: 10 },
                { country_id: nigeriaId, state_name: 'Ebonyi', state_code: 'EB', display_order: 11 },
                { country_id: nigeriaId, state_name: 'Edo', state_code: 'ED', display_order: 12 },
                { country_id: nigeriaId, state_name: 'Ekiti', state_code: 'EK', display_order: 13 },
                { country_id: nigeriaId, state_name: 'Enugu', state_code: 'EN', display_order: 14 },
                { country_id: nigeriaId, state_name: 'Federal Capital Territory', state_code: 'FC', display_order: 15 },
                { country_id: nigeriaId, state_name: 'Gombe', state_code: 'GO', display_order: 16 },
                { country_id: nigeriaId, state_name: 'Imo', state_code: 'IM', display_order: 17 },
                { country_id: nigeriaId, state_name: 'Jigawa', state_code: 'JI', display_order: 18 },
                { country_id: nigeriaId, state_name: 'Kaduna', state_code: 'KD', display_order: 19 },
                { country_id: nigeriaId, state_name: 'Kano', state_code: 'KN', display_order: 20 },
                { country_id: nigeriaId, state_name: 'Katsina', state_code: 'KT', display_order: 21 },
                { country_id: nigeriaId, state_name: 'Kebbi', state_code: 'KE', display_order: 22 },
                { country_id: nigeriaId, state_name: 'Kogi', state_code: 'KO', display_order: 23 },
                { country_id: nigeriaId, state_name: 'Kwara', state_code: 'KW', display_order: 24 },
                { country_id: nigeriaId, state_name: 'Lagos', state_code: 'LA', display_order: 25 },
                { country_id: nigeriaId, state_name: 'Nasarawa', state_code: 'NA', display_order: 26 },
                { country_id: nigeriaId, state_name: 'Niger', state_code: 'NI', display_order: 27 },
                { country_id: nigeriaId, state_name: 'Ogun', state_code: 'OG', display_order: 28 },
                { country_id: nigeriaId, state_name: 'Ondo', state_code: 'ON', display_order: 29 },
                { country_id: nigeriaId, state_name: 'Osun', state_code: 'OS', display_order: 30 },
                { country_id: nigeriaId, state_name: 'Oyo', state_code: 'OY', display_order: 31 },
                { country_id: nigeriaId, state_name: 'Plateau', state_code: 'PL', display_order: 32 },
                { country_id: nigeriaId, state_name: 'Rivers', state_code: 'RI', display_order: 33 },
                { country_id: nigeriaId, state_name: 'Sokoto', state_code: 'SO', display_order: 34 },
                { country_id: nigeriaId, state_name: 'Taraba', state_code: 'TA', display_order: 35 },
                { country_id: nigeriaId, state_name: 'Yobe', state_code: 'YO', display_order: 36 },
                { country_id: nigeriaId, state_name: 'Zamfara', state_code: 'ZA', display_order: 37 }
            );
        }

        // PAKISTAN
        const pakistanId = await getCountryId('PK');
        if (pakistanId) {
            states.push(
                { country_id: pakistanId, state_name: 'Balochistan', state_code: 'BA', display_order: 1 },
                { country_id: pakistanId, state_name: 'Khyber Pakhtunkhwa', state_code: 'KP', display_order: 2 },
                { country_id: pakistanId, state_name: 'Punjab', state_code: 'PB', display_order: 3 },
                { country_id: pakistanId, state_name: 'Sindh', state_code: 'SD', display_order: 4 },
                { country_id: pakistanId, state_name: 'Islamabad Capital Territory', state_code: 'IS', display_order: 5 },
                { country_id: pakistanId, state_name: 'Azad Kashmir', state_code: 'JK', display_order: 6 },
                { country_id: pakistanId, state_name: 'Gilgit-Baltistan', state_code: 'GB', display_order: 7 }
            );
        }

        // RUSSIA
        const russiaId = await getCountryId('RU');
        if (russiaId) {
            states.push(
                { country_id: russiaId, state_name: 'Moscow', state_code: 'MOW', display_order: 1 },
                { country_id: russiaId, state_name: 'Saint Petersburg', state_code: 'SPE', display_order: 2 },
                { country_id: russiaId, state_name: 'Moscow Oblast', state_code: 'MOS', display_order: 3 },
                { country_id: russiaId, state_name: 'Krasnodar Krai', state_code: 'KDA', display_order: 4 },
                { country_id: russiaId, state_name: 'Sverdlovsk Oblast', state_code: 'SVE', display_order: 5 },
                { country_id: russiaId, state_name: 'Rostov Oblast', state_code: 'ROS', display_order: 6 },
                { country_id: russiaId, state_name: 'Republic of Tatarstan', state_code: 'TA', display_order: 7 },
                { country_id: russiaId, state_name: 'Chelyabinsk Oblast', state_code: 'CHE', display_order: 8 },
                { country_id: russiaId, state_name: 'Nizhny Novgorod Oblast', state_code: 'NIZ', display_order: 9 },
                { country_id: russiaId, state_name: 'Samara Oblast', state_code: 'SAM', display_order: 10 },
                { country_id: russiaId, state_name: 'Republic of Bashkortostan', state_code: 'BA', display_order: 11 },
                { country_id: russiaId, state_name: 'Krasnoyarsk Krai', state_code: 'KYA', display_order: 12 },
                { country_id: russiaId, state_name: 'Perm Krai', state_code: 'PER', display_order: 13 },
                { country_id: russiaId, state_name: 'Voronezh Oblast', state_code: 'VOR', display_order: 14 },
                { country_id: russiaId, state_name: 'Volgograd Oblast', state_code: 'VGG', display_order: 15 }
            );
        }

        // SOUTH AFRICA
        const southAfricaId = await getCountryId('ZA');
        if (southAfricaId) {
            states.push(
                { country_id: southAfricaId, state_name: 'Eastern Cape', state_code: 'EC', display_order: 1 },
                { country_id: southAfricaId, state_name: 'Free State', state_code: 'FS', display_order: 2 },
                { country_id: southAfricaId, state_name: 'Gauteng', state_code: 'GP', display_order: 3 },
                { country_id: southAfricaId, state_name: 'KwaZulu-Natal', state_code: 'KZN', display_order: 4 },
                { country_id: southAfricaId, state_name: 'Limpopo', state_code: 'LP', display_order: 5 },
                { country_id: southAfricaId, state_name: 'Mpumalanga', state_code: 'MP', display_order: 6 },
                { country_id: southAfricaId, state_name: 'Northern Cape', state_code: 'NC', display_order: 7 },
                { country_id: southAfricaId, state_name: 'North West', state_code: 'NW', display_order: 8 },
                { country_id: southAfricaId, state_name: 'Western Cape', state_code: 'WC', display_order: 9 }
            );
        }

        // SPAIN
        const spainId = await getCountryId('ES');
        if (spainId) {
            states.push(
                { country_id: spainId, state_name: 'Andalusia', state_code: 'AN', display_order: 1 },
                { country_id: spainId, state_name: 'Aragon', state_code: 'AR', display_order: 2 },
                { country_id: spainId, state_name: 'Asturias', state_code: 'AS', display_order: 3 },
                { country_id: spainId, state_name: 'Balearic Islands', state_code: 'IB', display_order: 4 },
                { country_id: spainId, state_name: 'Basque Country', state_code: 'PV', display_order: 5 },
                { country_id: spainId, state_name: 'Canary Islands', state_code: 'CN', display_order: 6 },
                { country_id: spainId, state_name: 'Cantabria', state_code: 'CB', display_order: 7 },
                { country_id: spainId, state_name: 'Castile and León', state_code: 'CL', display_order: 8 },
                { country_id: spainId, state_name: 'Castilla-La Mancha', state_code: 'CM', display_order: 9 },
                { country_id: spainId, state_name: 'Catalonia', state_code: 'CT', display_order: 10 },
                { country_id: spainId, state_name: 'Extremadura', state_code: 'EX', display_order: 11 },
                { country_id: spainId, state_name: 'Galicia', state_code: 'GA', display_order: 12 },
                { country_id: spainId, state_name: 'La Rioja', state_code: 'RI', display_order: 13 },
                { country_id: spainId, state_name: 'Madrid', state_code: 'MD', display_order: 14 },
                { country_id: spainId, state_name: 'Murcia', state_code: 'MC', display_order: 15 },
                { country_id: spainId, state_name: 'Navarre', state_code: 'NC', display_order: 16 },
                { country_id: spainId, state_name: 'Valencian Community', state_code: 'VC', display_order: 17 }
            );
        }

        // TURKEY
        const turkeyId = await getCountryId('TR');
        if (turkeyId) {
            states.push(
                { country_id: turkeyId, state_name: 'Adana', state_code: '01', display_order: 1 },
                { country_id: turkeyId, state_name: 'Adıyaman', state_code: '02', display_order: 2 },
                { country_id: turkeyId, state_name: 'Afyonkarahisar', state_code: '03', display_order: 3 },
                { country_id: turkeyId, state_name: 'Ağrı', state_code: '04', display_order: 4 },
                { country_id: turkeyId, state_name: 'Aksaray', state_code: '68', display_order: 5 },
                { country_id: turkeyId, state_name: 'Amasya', state_code: '05', display_order: 6 },
                { country_id: turkeyId, state_name: 'Ankara', state_code: '06', display_order: 7 },
                { country_id: turkeyId, state_name: 'Antalya', state_code: '07', display_order: 8 },
                { country_id: turkeyId, state_name: 'Ardahan', state_code: '75', display_order: 9 },
                { country_id: turkeyId, state_name: 'Artvin', state_code: '08', display_order: 10 },
                { country_id: turkeyId, state_name: 'Aydın', state_code: '09', display_order: 11 },
                { country_id: turkeyId, state_name: 'Balıkesir', state_code: '10', display_order: 12 },
                { country_id: turkeyId, state_name: 'Bartın', state_code: '74', display_order: 13 },
                { country_id: turkeyId, state_name: 'Batman', state_code: '72', display_order: 14 },
                { country_id: turkeyId, state_name: 'Bayburt', state_code: '69', display_order: 15 },
                { country_id: turkeyId, state_name: 'Bilecik', state_code: '11', display_order: 16 },
                { country_id: turkeyId, state_name: 'Bingöl', state_code: '12', display_order: 17 },
                { country_id: turkeyId, state_name: 'Bitlis', state_code: '13', display_order: 18 },
                { country_id: turkeyId, state_name: 'Bolu', state_code: '14', display_order: 19 },
                { country_id: turkeyId, state_name: 'Burdur', state_code: '15', display_order: 20 },
                { country_id: turkeyId, state_name: 'Bursa', state_code: '16', display_order: 21 },
                { country_id: turkeyId, state_name: 'Çanakkale', state_code: '17', display_order: 22 },
                { country_id: turkeyId, state_name: 'Çankırı', state_code: '18', display_order: 23 },
                { country_id: turkeyId, state_name: 'Çorum', state_code: '19', display_order: 24 },
                { country_id: turkeyId, state_name: 'Denizli', state_code: '20', display_order: 25 },
                { country_id: turkeyId, state_name: 'Diyarbakır', state_code: '21', display_order: 26 },
                { country_id: turkeyId, state_name: 'Düzce', state_code: '81', display_order: 27 },
                { country_id: turkeyId, state_name: 'Edirne', state_code: '22', display_order: 28 },
                { country_id: turkeyId, state_name: 'Elazığ', state_code: '23', display_order: 29 },
                { country_id: turkeyId, state_name: 'Erzincan', state_code: '24', display_order: 30 },
                { country_id: turkeyId, state_name: 'Erzurum', state_code: '25', display_order: 31 },
                { country_id: turkeyId, state_name: 'Eskişehir', state_code: '26', display_order: 32 },
                { country_id: turkeyId, state_name: 'Gaziantep', state_code: '27', display_order: 33 },
                { country_id: turkeyId, state_name: 'Giresun', state_code: '28', display_order: 34 },
                { country_id: turkeyId, state_name: 'Gümüşhane', state_code: '29', display_order: 35 },
                { country_id: turkeyId, state_name: 'Hakkâri', state_code: '30', display_order: 36 },
                { country_id: turkeyId, state_name: 'Hatay', state_code: '31', display_order: 37 },
                { country_id: turkeyId, state_name: 'Iğdır', state_code: '76', display_order: 38 },
                { country_id: turkeyId, state_name: 'Isparta', state_code: '32', display_order: 39 },
                { country_id: turkeyId, state_name: 'Istanbul', state_code: '34', display_order: 40 },
                { country_id: turkeyId, state_name: 'İzmir', state_code: '35', display_order: 41 },
                { country_id: turkeyId, state_name: 'Kahramanmaraş', state_code: '46', display_order: 42 },
                { country_id: turkeyId, state_name: 'Karabük', state_code: '78', display_order: 43 },
                { country_id: turkeyId, state_name: 'Karaman', state_code: '70', display_order: 44 },
                { country_id: turkeyId, state_name: 'Kars', state_code: '36', display_order: 45 },
                { country_id: turkeyId, state_name: 'Kastamonu', state_code: '37', display_order: 46 },
                { country_id: turkeyId, state_name: 'Kayseri', state_code: '38', display_order: 47 },
                { country_id: turkeyId, state_name: 'Kilis', state_code: '79', display_order: 48 },
                { country_id: turkeyId, state_name: 'Kırıkkale', state_code: '71', display_order: 49 },
                { country_id: turkeyId, state_name: 'Kırklareli', state_code: '39', display_order: 50 },
                { country_id: turkeyId, state_name: 'Kırşehir', state_code: '40', display_order: 51 },
                { country_id: turkeyId, state_name: 'Kocaeli', state_code: '41', display_order: 52 },
                { country_id: turkeyId, state_name: 'Konya', state_code: '42', display_order: 53 },
                { country_id: turkeyId, state_name: 'Kütahya', state_code: '43', display_order: 54 },
                { country_id: turkeyId, state_name: 'Malatya', state_code: '44', display_order: 55 },
                { country_id: turkeyId, state_name: 'Manisa', state_code: '45', display_order: 56 },
                { country_id: turkeyId, state_name: 'Mardin', state_code: '47', display_order: 57 },
                { country_id: turkeyId, state_name: 'Mersin', state_code: '33', display_order: 58 },
                { country_id: turkeyId, state_name: 'Muğla', state_code: '48', display_order: 59 },
                { country_id: turkeyId, state_name: 'Muş', state_code: '49', display_order: 60 },
                { country_id: turkeyId, state_name: 'Nevşehir', state_code: '50', display_order: 61 },
                { country_id: turkeyId, state_name: 'Niğde', state_code: '51', display_order: 62 },
                { country_id: turkeyId, state_name: 'Ordu', state_code: '52', display_order: 63 },
                { country_id: turkeyId, state_name: 'Osmaniye', state_code: '80', display_order: 64 },
                { country_id: turkeyId, state_name: 'Rize', state_code: '53', display_order: 65 },
                { country_id: turkeyId, state_name: 'Sakarya', state_code: '54', display_order: 66 },
                { country_id: turkeyId, state_name: 'Samsun', state_code: '55', display_order: 67 },
                { country_id: turkeyId, state_name: 'Şanlıurfa', state_code: '63', display_order: 68 },
                { country_id: turkeyId, state_name: 'Siirt', state_code: '56', display_order: 69 },
                { country_id: turkeyId, state_name: 'Sinop', state_code: '57', display_order: 70 },
                { country_id: turkeyId, state_name: 'Şırnak', state_code: '73', display_order: 71 },
                { country_id: turkeyId, state_name: 'Sivas', state_code: '58', display_order: 72 },
                { country_id: turkeyId, state_name: 'Tekirdağ', state_code: '59', display_order: 73 },
                { country_id: turkeyId, state_name: 'Tokat', state_code: '60', display_order: 74 },
                { country_id: turkeyId, state_name: 'Trabzon', state_code: '61', display_order: 75 },
                { country_id: turkeyId, state_name: 'Tunceli', state_code: '62', display_order: 76 },
                { country_id: turkeyId, state_name: 'Uşak', state_code: '64', display_order: 77 },
                { country_id: turkeyId, state_name: 'Van', state_code: '65', display_order: 78 },
                { country_id: turkeyId, state_name: 'Yalova', state_code: '77', display_order: 79 },
                { country_id: turkeyId, state_name: 'Yozgat', state_code: '66', display_order: 80 },
                { country_id: turkeyId, state_name: 'Zonguldak', state_code: '67', display_order: 81 }
            );
        }

        // UNITED KINGDOM
        const ukId = await getCountryId('GB');
        if (ukId) {
            states.push(
                { country_id: ukId, state_name: 'England', state_code: 'ENG', display_order: 1 },
                { country_id: ukId, state_name: 'Scotland', state_code: 'SCT', display_order: 2 },
                { country_id: ukId, state_name: 'Wales', state_code: 'WLS', display_order: 3 },
                { country_id: ukId, state_name: 'Northern Ireland', state_code: 'NIR', display_order: 4 }
            );
        }

        // UNITED STATES
        const usaId = await getCountryId('US');
        if (usaId) {
            states.push(
                { country_id: usaId, state_name: 'Alabama', state_code: 'AL', display_order: 1 },
                { country_id: usaId, state_name: 'Alaska', state_code: 'AK', display_order: 2 },
                { country_id: usaId, state_name: 'Arizona', state_code: 'AZ', display_order: 3 },
                { country_id: usaId, state_name: 'Arkansas', state_code: 'AR', display_order: 4 },
                { country_id: usaId, state_name: 'California', state_code: 'CA', display_order: 5 },
                { country_id: usaId, state_name: 'Colorado', state_code: 'CO', display_order: 6 },
                { country_id: usaId, state_name: 'Connecticut', state_code: 'CT', display_order: 7 },
                { country_id: usaId, state_name: 'Delaware', state_code: 'DE', display_order: 8 },
                { country_id: usaId, state_name: 'Florida', state_code: 'FL', display_order: 9 },
                { country_id: usaId, state_name: 'Georgia', state_code: 'GA', display_order: 10 },
                { country_id: usaId, state_name: 'Hawaii', state_code: 'HI', display_order: 11 },
                { country_id: usaId, state_name: 'Idaho', state_code: 'ID', display_order: 12 },
                { country_id: usaId, state_name: 'Illinois', state_code: 'IL', display_order: 13 },
                { country_id: usaId, state_name: 'Indiana', state_code: 'IN', display_order: 14 },
                { country_id: usaId, state_name: 'Iowa', state_code: 'IA', display_order: 15 },
                { country_id: usaId, state_name: 'Kansas', state_code: 'KS', display_order: 16 },
                { country_id: usaId, state_name: 'Kentucky', state_code: 'KY', display_order: 17 },
                { country_id: usaId, state_name: 'Louisiana', state_code: 'LA', display_order: 18 },
                { country_id: usaId, state_name: 'Maine', state_code: 'ME', display_order: 19 },
                { country_id: usaId, state_name: 'Maryland', state_code: 'MD', display_order: 20 },
                { country_id: usaId, state_name: 'Massachusetts', state_code: 'MA', display_order: 21 },
                { country_id: usaId, state_name: 'Michigan', state_code: 'MI', display_order: 22 },
                { country_id: usaId, state_name: 'Minnesota', state_code: 'MN', display_order: 23 },
                { country_id: usaId, state_name: 'Mississippi', state_code: 'MS', display_order: 24 },
                { country_id: usaId, state_name: 'Missouri', state_code: 'MO', display_order: 25 },
                { country_id: usaId, state_name: 'Montana', state_code: 'MT', display_order: 26 },
                { country_id: usaId, state_name: 'Nebraska', state_code: 'NE', display_order: 27 },
                { country_id: usaId, state_name: 'Nevada', state_code: 'NV', display_order: 28 },
                { country_id: usaId, state_name: 'New Hampshire', state_code: 'NH', display_order: 29 },
                { country_id: usaId, state_name: 'New Jersey', state_code: 'NJ', display_order: 30 },
                { country_id: usaId, state_name: 'New Mexico', state_code: 'NM', display_order: 31 },
                { country_id: usaId, state_name: 'New York', state_code: 'NY', display_order: 32 },
                { country_id: usaId, state_name: 'North Carolina', state_code: 'NC', display_order: 33 },
                { country_id: usaId, state_name: 'North Dakota', state_code: 'ND', display_order: 34 },
                { country_id: usaId, state_name: 'Ohio', state_code: 'OH', display_order: 35 },
                { country_id: usaId, state_name: 'Oklahoma', state_code: 'OK', display_order: 36 },
                { country_id: usaId, state_name: 'Oregon', state_code: 'OR', display_order: 37 },
                { country_id: usaId, state_name: 'Pennsylvania', state_code: 'PA', display_order: 38 },
                { country_id: usaId, state_name: 'Rhode Island', state_code: 'RI', display_order: 39 },
                { country_id: usaId, state_name: 'South Carolina', state_code: 'SC', display_order: 40 },
                { country_id: usaId, state_name: 'South Dakota', state_code: 'SD', display_order: 41 },
                { country_id: usaId, state_name: 'Tennessee', state_code: 'TN', display_order: 42 },
                { country_id: usaId, state_name: 'Texas', state_code: 'TX', display_order: 43 },
                { country_id: usaId, state_name: 'Utah', state_code: 'UT', display_order: 44 },
                { country_id: usaId, state_name: 'Vermont', state_code: 'VT', display_order: 45 },
                { country_id: usaId, state_name: 'Virginia', state_code: 'VA', display_order: 46 },
                { country_id: usaId, state_name: 'Washington', state_code: 'WA', display_order: 47 },
                { country_id: usaId, state_name: 'West Virginia', state_code: 'WV', display_order: 48 },
                { country_id: usaId, state_name: 'Wisconsin', state_code: 'WI', display_order: 49 },
                { country_id: usaId, state_name: 'Wyoming', state_code: 'WY', display_order: 50 },
                { country_id: usaId, state_name: 'District of Columbia', state_code: 'DC', display_order: 51 },
                { country_id: usaId, state_name: 'Puerto Rico', state_code: 'PR', display_order: 52 },
                { country_id: usaId, state_name: 'Guam', state_code: 'GU', display_order: 53 },
                { country_id: usaId, state_name: 'US Virgin Islands', state_code: 'VI', display_order: 54 }
            );
        }

        // For countries without states/provinces, add a default "N/A" or country name entry
        // This ensures all countries have at least one state entry for consistency

        if (states.length === 0) {
            console.log('⚠️  No states to seed - countries not found');
            return [];
        }

        // Insert states using bulkCreate with updateOnDuplicate
        const result = await HrmsStateMaster.bulkCreate(states, {
            updateOnDuplicate: ['state_name', 'state_code', 'is_active', 'display_order', 'updated_at']
        });

        console.log(`✓ ${result.length} states seeded successfully`);
        console.log('✓ State seeder completed');

        return result;
    } catch (error) {
        console.error('✗ State seeder error:', error.message);
        throw error;
    }
};

// Run seeder if called directly
if (require.main === module) {
    seedStates()
        .then(() => {
            console.log('✓ Seeding completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('✗ Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedStates };
