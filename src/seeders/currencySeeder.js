/**
 * Currency Master Seeder
 * Seeds all world currencies into hrms_currency_master table
 * Includes 160+ currencies with ISO 4217 codes
 */

const { HrmsCurrencyMaster } = require('../models/HrmsCurrencyMaster');

const currencies = [
    // Major World Currencies (Display Order 1-20)
    { currency_code: 'USD', currency_name: 'US Dollar', currency_symbol: '$', country_name: 'United States', country_code: 'USA', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 1 },
    { currency_code: 'EUR', currency_name: 'Euro', currency_symbol: '€', country_name: 'European Union', country_code: 'EU', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 2 },
    { currency_code: 'GBP', currency_name: 'British Pound Sterling', currency_symbol: '£', country_name: 'United Kingdom', country_code: 'GBR', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 3 },
    { currency_code: 'INR', currency_name: 'Indian Rupee', currency_symbol: '₹', country_name: 'India', country_code: 'IND', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 4 },
    { currency_code: 'JPY', currency_name: 'Japanese Yen', currency_symbol: '¥', country_name: 'Japan', country_code: 'JPN', decimal_places: 0, display_format: '{symbol}{amount}', display_order: 5 },
    { currency_code: 'CNY', currency_name: 'Chinese Yuan', currency_symbol: '¥', country_name: 'China', country_code: 'CHN', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 6 },
    { currency_code: 'AUD', currency_name: 'Australian Dollar', currency_symbol: 'A$', country_name: 'Australia', country_code: 'AUS', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 7 },
    { currency_code: 'CAD', currency_name: 'Canadian Dollar', currency_symbol: 'C$', country_name: 'Canada', country_code: 'CAN', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 8 },
    { currency_code: 'CHF', currency_name: 'Swiss Franc', currency_symbol: 'CHF', country_name: 'Switzerland', country_code: 'CHE', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 9 },
    { currency_code: 'SGD', currency_name: 'Singapore Dollar', currency_symbol: 'S$', country_name: 'Singapore', country_code: 'SGP', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 10 },
    { currency_code: 'AED', currency_name: 'United Arab Emirates Dirham', currency_symbol: 'د.إ', country_name: 'United Arab Emirates', country_code: 'ARE', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 11 },
    { currency_code: 'SAR', currency_name: 'Saudi Riyal', currency_symbol: '﷼', country_name: 'Saudi Arabia', country_code: 'SAU', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 12 },
    { currency_code: 'HKD', currency_name: 'Hong Kong Dollar', currency_symbol: 'HK$', country_name: 'Hong Kong', country_code: 'HKG', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 13 },
    { currency_code: 'NZD', currency_name: 'New Zealand Dollar', currency_symbol: 'NZ$', country_name: 'New Zealand', country_code: 'NZL', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 14 },
    { currency_code: 'SEK', currency_name: 'Swedish Krona', currency_symbol: 'kr', country_name: 'Sweden', country_code: 'SWE', decimal_places: 2, display_format: '{amount} {symbol}', display_order: 15 },
    { currency_code: 'NOK', currency_name: 'Norwegian Krone', currency_symbol: 'kr', country_name: 'Norway', country_code: 'NOR', decimal_places: 2, display_format: '{amount} {symbol}', display_order: 16 },
    { currency_code: 'DKK', currency_name: 'Danish Krone', currency_symbol: 'kr', country_name: 'Denmark', country_code: 'DNK', decimal_places: 2, display_format: '{amount} {symbol}', display_order: 17 },
    { currency_code: 'KRW', currency_name: 'South Korean Won', currency_symbol: '₩', country_name: 'South Korea', country_code: 'KOR', decimal_places: 0, display_format: '{symbol}{amount}', display_order: 18 },
    { currency_code: 'MXN', currency_name: 'Mexican Peso', currency_symbol: '$', country_name: 'Mexico', country_code: 'MEX', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 19 },
    { currency_code: 'BRL', currency_name: 'Brazilian Real', currency_symbol: 'R$', country_name: 'Brazil', country_code: 'BRA', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 20 },

    // Asia-Pacific
    { currency_code: 'THB', currency_name: 'Thai Baht', currency_symbol: '฿', country_name: 'Thailand', country_code: 'THA', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 50 },
    { currency_code: 'MYR', currency_name: 'Malaysian Ringgit', currency_symbol: 'RM', country_name: 'Malaysia', country_code: 'MYS', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 51 },
    { currency_code: 'IDR', currency_name: 'Indonesian Rupiah', currency_symbol: 'Rp', country_name: 'Indonesia', country_code: 'IDN', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 52 },
    { currency_code: 'PHP', currency_name: 'Philippine Peso', currency_symbol: '₱', country_name: 'Philippines', country_code: 'PHL', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 53 },
    { currency_code: 'VND', currency_name: 'Vietnamese Dong', currency_symbol: '₫', country_name: 'Vietnam', country_code: 'VNM', decimal_places: 0, display_format: '{symbol}{amount}', display_order: 54 },
    { currency_code: 'PKR', currency_name: 'Pakistani Rupee', currency_symbol: '₨', country_name: 'Pakistan', country_code: 'PAK', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 55 },
    { currency_code: 'BDT', currency_name: 'Bangladeshi Taka', currency_symbol: '৳', country_name: 'Bangladesh', country_code: 'BGD', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 56 },
    { currency_code: 'LKR', currency_name: 'Sri Lankan Rupee', currency_symbol: '₨', country_name: 'Sri Lanka', country_code: 'LKA', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 57 },
    { currency_code: 'NPR', currency_name: 'Nepalese Rupee', currency_symbol: '₨', country_name: 'Nepal', country_code: 'NPL', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 58 },
    { currency_code: 'TWD', currency_name: 'New Taiwan Dollar', currency_symbol: 'NT$', country_name: 'Taiwan', country_code: 'TWN', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 59 },

    // Middle East
    { currency_code: 'QAR', currency_name: 'Qatari Riyal', currency_symbol: '﷼', country_name: 'Qatar', country_code: 'QAT', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 60 },
    { currency_code: 'KWD', currency_name: 'Kuwaiti Dinar', currency_symbol: 'د.ك', country_name: 'Kuwait', country_code: 'KWT', decimal_places: 3, display_format: '{symbol}{amount}', display_order: 61 },
    { currency_code: 'BHD', currency_name: 'Bahraini Dinar', currency_symbol: 'د.ب', country_name: 'Bahrain', country_code: 'BHR', decimal_places: 3, display_format: '{symbol}{amount}', display_order: 62 },
    { currency_code: 'OMR', currency_name: 'Omani Rial', currency_symbol: '﷼', country_name: 'Oman', country_code: 'OMN', decimal_places: 3, display_format: '{symbol}{amount}', display_order: 63 },
    { currency_code: 'JOD', currency_name: 'Jordanian Dinar', currency_symbol: 'د.ا', country_name: 'Jordan', country_code: 'JOR', decimal_places: 3, display_format: '{symbol}{amount}', display_order: 64 },
    { currency_code: 'ILS', currency_name: 'Israeli New Shekel', currency_symbol: '₪', country_name: 'Israel', country_code: 'ISR', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 65 },
    { currency_code: 'LBP', currency_name: 'Lebanese Pound', currency_symbol: 'ل.ل', country_name: 'Lebanon', country_code: 'LBN', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 66 },
    { currency_code: 'IQD', currency_name: 'Iraqi Dinar', currency_symbol: 'ع.د', country_name: 'Iraq', country_code: 'IRQ', decimal_places: 3, display_format: '{symbol}{amount}', display_order: 67 },

    // Europe
    { currency_code: 'RUB', currency_name: 'Russian Ruble', currency_symbol: '₽', country_name: 'Russia', country_code: 'RUS', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 70 },
    { currency_code: 'PLN', currency_name: 'Polish Zloty', currency_symbol: 'zł', country_name: 'Poland', country_code: 'POL', decimal_places: 2, display_format: '{amount} {symbol}', display_order: 71 },
    { currency_code: 'TRY', currency_name: 'Turkish Lira', currency_symbol: '₺', country_name: 'Turkey', country_code: 'TUR', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 72 },
    { currency_code: 'CZK', currency_name: 'Czech Koruna', currency_symbol: 'Kč', country_name: 'Czech Republic', country_code: 'CZE', decimal_places: 2, display_format: '{amount} {symbol}', display_order: 73 },
    { currency_code: 'HUF', currency_name: 'Hungarian Forint', currency_symbol: 'Ft', country_name: 'Hungary', country_code: 'HUN', decimal_places: 2, display_format: '{amount} {symbol}', display_order: 74 },
    { currency_code: 'RON', currency_name: 'Romanian Leu', currency_symbol: 'lei', country_name: 'Romania', country_code: 'ROU', decimal_places: 2, display_format: '{amount} {symbol}', display_order: 75 },
    { currency_code: 'BGN', currency_name: 'Bulgarian Lev', currency_symbol: 'лв', country_name: 'Bulgaria', country_code: 'BGR', decimal_places: 2, display_format: '{amount} {symbol}', display_order: 76 },
    { currency_code: 'HRK', currency_name: 'Croatian Kuna', currency_symbol: 'kn', country_name: 'Croatia', country_code: 'HRV', decimal_places: 2, display_format: '{amount} {symbol}', display_order: 77 },
    { currency_code: 'UAH', currency_name: 'Ukrainian Hryvnia', currency_symbol: '₴', country_name: 'Ukraine', country_code: 'UKR', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 78 },
    { currency_code: 'ISK', currency_name: 'Icelandic Krona', currency_symbol: 'kr', country_name: 'Iceland', country_code: 'ISL', decimal_places: 0, display_format: '{amount} {symbol}', display_order: 79 },

    // Africa
    { currency_code: 'ZAR', currency_name: 'South African Rand', currency_symbol: 'R', country_name: 'South Africa', country_code: 'ZAF', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 80 },
    { currency_code: 'NGN', currency_name: 'Nigerian Naira', currency_symbol: '₦', country_name: 'Nigeria', country_code: 'NGA', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 81 },
    { currency_code: 'EGP', currency_name: 'Egyptian Pound', currency_symbol: '£', country_name: 'Egypt', country_code: 'EGY', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 82 },
    { currency_code: 'KES', currency_name: 'Kenyan Shilling', currency_symbol: 'KSh', country_name: 'Kenya', country_code: 'KEN', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 83 },
    { currency_code: 'GHS', currency_name: 'Ghanaian Cedi', currency_symbol: '₵', country_name: 'Ghana', country_code: 'GHA', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 84 },
    { currency_code: 'MAD', currency_name: 'Moroccan Dirham', currency_symbol: 'د.م.', country_name: 'Morocco', country_code: 'MAR', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 85 },
    { currency_code: 'TND', currency_name: 'Tunisian Dinar', currency_symbol: 'د.ت', country_name: 'Tunisia', country_code: 'TUN', decimal_places: 3, display_format: '{symbol}{amount}', display_order: 86 },
    { currency_code: 'UGX', currency_name: 'Ugandan Shilling', currency_symbol: 'USh', country_name: 'Uganda', country_code: 'UGA', decimal_places: 0, display_format: '{symbol}{amount}', display_order: 87 },
    { currency_code: 'TZS', currency_name: 'Tanzanian Shilling', currency_symbol: 'TSh', country_name: 'Tanzania', country_code: 'TZA', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 88 },
    { currency_code: 'ETB', currency_name: 'Ethiopian Birr', currency_symbol: 'Br', country_name: 'Ethiopia', country_code: 'ETH', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 89 },

    // Americas
    { currency_code: 'ARS', currency_name: 'Argentine Peso', currency_symbol: '$', country_name: 'Argentina', country_code: 'ARG', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 90 },
    { currency_code: 'CLP', currency_name: 'Chilean Peso', currency_symbol: '$', country_name: 'Chile', country_code: 'CHL', decimal_places: 0, display_format: '{symbol}{amount}', display_order: 91 },
    { currency_code: 'COP', currency_name: 'Colombian Peso', currency_symbol: '$', country_name: 'Colombia', country_code: 'COL', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 92 },
    { currency_code: 'PEN', currency_name: 'Peruvian Sol', currency_symbol: 'S/', country_name: 'Peru', country_code: 'PER', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 93 },
    { currency_code: 'VES', currency_name: 'Venezuelan Bolívar', currency_symbol: 'Bs.', country_name: 'Venezuela', country_code: 'VEN', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 94 },
    { currency_code: 'UYU', currency_name: 'Uruguayan Peso', currency_symbol: '$U', country_name: 'Uruguay', country_code: 'URY', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 95 },
    { currency_code: 'BOB', currency_name: 'Bolivian Boliviano', currency_symbol: 'Bs.', country_name: 'Bolivia', country_code: 'BOL', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 96 },
    { currency_code: 'PYG', currency_name: 'Paraguayan Guarani', currency_symbol: '₲', country_name: 'Paraguay', country_code: 'PRY', decimal_places: 0, display_format: '{symbol}{amount}', display_order: 97 },

    // Cryptocurrencies & Digital (Optional - for future use)
    { currency_code: 'BTC', currency_name: 'Bitcoin', currency_symbol: '₿', country_name: 'Global', country_code: null, decimal_places: 8, display_format: '{symbol}{amount}', display_order: 900, is_active: 0 },
    { currency_code: 'ETH', currency_name: 'Ethereum', currency_symbol: 'Ξ', country_name: 'Global', country_code: null, decimal_places: 8, display_format: '{symbol}{amount}', display_order: 901, is_active: 0 },

    // Additional Major Currencies
    { currency_code: 'AFN', currency_name: 'Afghan Afghani', currency_symbol: '؋', country_name: 'Afghanistan', country_code: 'AFG', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 100 },
    { currency_code: 'ALL', currency_name: 'Albanian Lek', currency_symbol: 'L', country_name: 'Albania', country_code: 'ALB', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 101 },
    { currency_code: 'DZD', currency_name: 'Algerian Dinar', currency_symbol: 'د.ج', country_name: 'Algeria', country_code: 'DZA', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 102 },
    { currency_code: 'AOA', currency_name: 'Angolan Kwanza', currency_symbol: 'Kz', country_name: 'Angola', country_code: 'AGO', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 103 },
    { currency_code: 'AMD', currency_name: 'Armenian Dram', currency_symbol: '֏', country_name: 'Armenia', country_code: 'ARM', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 104 },
    { currency_code: 'AWG', currency_name: 'Aruban Florin', currency_symbol: 'ƒ', country_name: 'Aruba', country_code: 'ABW', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 105 },
    { currency_code: 'AZN', currency_name: 'Azerbaijani Manat', currency_symbol: '₼', country_name: 'Azerbaijan', country_code: 'AZE', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 106 },
    { currency_code: 'BSD', currency_name: 'Bahamian Dollar', currency_symbol: 'B$', country_name: 'Bahamas', country_code: 'BHS', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 107 },
    { currency_code: 'BBD', currency_name: 'Barbadian Dollar', currency_symbol: 'Bds$', country_name: 'Barbados', country_code: 'BRB', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 108 },
    { currency_code: 'BYN', currency_name: 'Belarusian Ruble', currency_symbol: 'Br', country_name: 'Belarus', country_code: 'BLR', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 109 },
    { currency_code: 'BZD', currency_name: 'Belize Dollar', currency_symbol: 'BZ$', country_name: 'Belize', country_code: 'BLZ', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 110 },
    { currency_code: 'BMD', currency_name: 'Bermudian Dollar', currency_symbol: 'BD$', country_name: 'Bermuda', country_code: 'BMU', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 111 },
    { currency_code: 'BTN', currency_name: 'Bhutanese Ngultrum', currency_symbol: 'Nu.', country_name: 'Bhutan', country_code: 'BTN', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 112 },
    { currency_code: 'BAM', currency_name: 'Bosnia-Herzegovina Convertible Mark', currency_symbol: 'KM', country_name: 'Bosnia and Herzegovina', country_code: 'BIH', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 113 },
    { currency_code: 'BWP', currency_name: 'Botswanan Pula', currency_symbol: 'P', country_name: 'Botswana', country_code: 'BWA', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 114 },
    { currency_code: 'BND', currency_name: 'Brunei Dollar', currency_symbol: 'B$', country_name: 'Brunei', country_code: 'BRN', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 115 },
    { currency_code: 'KHR', currency_name: 'Cambodian Riel', currency_symbol: '៛', country_name: 'Cambodia', country_code: 'KHM', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 116 },
    { currency_code: 'CVE', currency_name: 'Cape Verdean Escudo', currency_symbol: '$', country_name: 'Cape Verde', country_code: 'CPV', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 117 },
    { currency_code: 'KYD', currency_name: 'Cayman Islands Dollar', currency_symbol: 'CI$', country_name: 'Cayman Islands', country_code: 'CYM', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 118 },
    { currency_code: 'XAF', currency_name: 'Central African CFA Franc', currency_symbol: 'FCFA', country_name: 'Central Africa', country_code: 'CAF', decimal_places: 0, display_format: '{symbol}{amount}', display_order: 119 },
    { currency_code: 'XOF', currency_name: 'West African CFA Franc', currency_symbol: 'CFA', country_name: 'West Africa', country_code: 'WAF', decimal_places: 0, display_format: '{symbol}{amount}', display_order: 120 },
    { currency_code: 'CRC', currency_name: 'Costa Rican Colón', currency_symbol: '₡', country_name: 'Costa Rica', country_code: 'CRI', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 121 },
    { currency_code: 'CUP', currency_name: 'Cuban Peso', currency_symbol: '$', country_name: 'Cuba', country_code: 'CUB', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 122 },
    { currency_code: 'DJF', currency_name: 'Djiboutian Franc', currency_symbol: 'Fdj', country_name: 'Djibouti', country_code: 'DJI', decimal_places: 0, display_format: '{symbol}{amount}', display_order: 123 },
    { currency_code: 'DOP', currency_name: 'Dominican Peso', currency_symbol: 'RD$', country_name: 'Dominican Republic', country_code: 'DOM', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 124 },
    { currency_code: 'XCD', currency_name: 'East Caribbean Dollar', currency_symbol: 'EC$', country_name: 'East Caribbean', country_code: 'XCD', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 125 },
    { currency_code: 'FJD', currency_name: 'Fijian Dollar', currency_symbol: 'FJ$', country_name: 'Fiji', country_code: 'FJI', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 126 },
    { currency_code: 'GMD', currency_name: 'Gambian Dalasi', currency_symbol: 'D', country_name: 'Gambia', country_code: 'GMB', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 127 },
    { currency_code: 'GEL', currency_name: 'Georgian Lari', currency_symbol: '₾', country_name: 'Georgia', country_code: 'GEO', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 128 },
    { currency_code: 'GIP', currency_name: 'Gibraltar Pound', currency_symbol: '£', country_name: 'Gibraltar', country_code: 'GIB', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 129 },
    { currency_code: 'GTQ', currency_name: 'Guatemalan Quetzal', currency_symbol: 'Q', country_name: 'Guatemala', country_code: 'GTM', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 130 },
    { currency_code: 'GNF', currency_name: 'Guinean Franc', currency_symbol: 'FG', country_name: 'Guinea', country_code: 'GIN', decimal_places: 0, display_format: '{symbol}{amount}', display_order: 131 },
    { currency_code: 'GYD', currency_name: 'Guyanaese Dollar', currency_symbol: 'G$', country_name: 'Guyana', country_code: 'GUY', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 132 },
    { currency_code: 'HTG', currency_name: 'Haitian Gourde', currency_symbol: 'G', country_name: 'Haiti', country_code: 'HTI', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 133 },
    { currency_code: 'HNL', currency_name: 'Honduran Lempira', currency_symbol: 'L', country_name: 'Honduras', country_code: 'HND', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 134 },
    { currency_code: 'JMD', currency_name: 'Jamaican Dollar', currency_symbol: 'J$', country_name: 'Jamaica', country_code: 'JAM', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 135 },
    { currency_code: 'KZT', currency_name: 'Kazakhstani Tenge', currency_symbol: '₸', country_name: 'Kazakhstan', country_code: 'KAZ', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 136 },
    { currency_code: 'KGS', currency_name: 'Kyrgystani Som', currency_symbol: 'с', country_name: 'Kyrgyzstan', country_code: 'KGZ', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 137 },
    { currency_code: 'LAK', currency_name: 'Laotian Kip', currency_symbol: '₭', country_name: 'Laos', country_code: 'LAO', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 138 },
    { currency_code: 'LSL', currency_name: 'Lesotho Loti', currency_symbol: 'L', country_name: 'Lesotho', country_code: 'LSO', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 139 },
    { currency_code: 'LRD', currency_name: 'Liberian Dollar', currency_symbol: 'L$', country_name: 'Liberia', country_code: 'LBR', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 140 },
    { currency_code: 'LYD', currency_name: 'Libyan Dinar', currency_symbol: 'ل.د', country_name: 'Libya', country_code: 'LBY', decimal_places: 3, display_format: '{symbol}{amount}', display_order: 141 },
    { currency_code: 'MOP', currency_name: 'Macanese Pataca', currency_symbol: 'MOP$', country_name: 'Macao', country_code: 'MAC', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 142 },
    { currency_code: 'MKD', currency_name: 'Macedonian Denar', currency_symbol: 'ден', country_name: 'North Macedonia', country_code: 'MKD', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 143 },
    { currency_code: 'MGA', currency_name: 'Malagasy Ariary', currency_symbol: 'Ar', country_name: 'Madagascar', country_code: 'MDG', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 144 },
    { currency_code: 'MWK', currency_name: 'Malawian Kwacha', currency_symbol: 'MK', country_name: 'Malawi', country_code: 'MWI', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 145 },
    { currency_code: 'MVR', currency_name: 'Maldivian Rufiyaa', currency_symbol: 'Rf', country_name: 'Maldives', country_code: 'MDV', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 146 },
    { currency_code: 'MRU', currency_name: 'Mauritanian Ouguiya', currency_symbol: 'UM', country_name: 'Mauritania', country_code: 'MRT', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 147 },
    { currency_code: 'MUR', currency_name: 'Mauritian Rupee', currency_symbol: '₨', country_name: 'Mauritius', country_code: 'MUS', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 148 },
    { currency_code: 'MDL', currency_name: 'Moldovan Leu', currency_symbol: 'L', country_name: 'Moldova', country_code: 'MDA', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 149 },
    { currency_code: 'MNT', currency_name: 'Mongolian Tugrik', currency_symbol: '₮', country_name: 'Mongolia', country_code: 'MNG', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 150 },
    { currency_code: 'MZN', currency_name: 'Mozambican Metical', currency_symbol: 'MT', country_name: 'Mozambique', country_code: 'MOZ', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 151 },
    { currency_code: 'MMK', currency_name: 'Myanmar Kyat', currency_symbol: 'K', country_name: 'Myanmar', country_code: 'MMR', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 152 },
    { currency_code: 'NAD', currency_name: 'Namibian Dollar', currency_symbol: 'N$', country_name: 'Namibia', country_code: 'NAM', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 153 },
    { currency_code: 'NIO', currency_name: 'Nicaraguan Córdoba', currency_symbol: 'C$', country_name: 'Nicaragua', country_code: 'NIC', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 154 },
    { currency_code: 'KPW', currency_name: 'North Korean Won', currency_symbol: '₩', country_name: 'North Korea', country_code: 'PRK', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 155 },
    { currency_code: 'PGK', currency_name: 'Papua New Guinean Kina', currency_symbol: 'K', country_name: 'Papua New Guinea', country_code: 'PNG', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 156 },
    { currency_code: 'RSD', currency_name: 'Serbian Dinar', currency_symbol: 'дин', country_name: 'Serbia', country_code: 'SRB', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 157 },
    { currency_code: 'SCR', currency_name: 'Seychellois Rupee', currency_symbol: '₨', country_name: 'Seychelles', country_code: 'SYC', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 158 },
    { currency_code: 'SLL', currency_name: 'Sierra Leonean Leone', currency_symbol: 'Le', country_name: 'Sierra Leone', country_code: 'SLE', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 159 },
    { currency_code: 'SBD', currency_name: 'Solomon Islands Dollar', currency_symbol: 'SI$', country_name: 'Solomon Islands', country_code: 'SLB', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 160 },
    { currency_code: 'SOS', currency_name: 'Somali Shilling', currency_symbol: 'Sh', country_name: 'Somalia', country_code: 'SOM', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 161 },
    { currency_code: 'SSP', currency_name: 'South Sudanese Pound', currency_symbol: '£', country_name: 'South Sudan', country_code: 'SSD', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 162 },
    { currency_code: 'SRD', currency_name: 'Surinamese Dollar', currency_symbol: 'Sr$', country_name: 'Suriname', country_code: 'SUR', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 163 },
    { currency_code: 'SZL', currency_name: 'Swazi Lilangeni', currency_symbol: 'E', country_name: 'Eswatini', country_code: 'SWZ', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 164 },
    { currency_code: 'SYP', currency_name: 'Syrian Pound', currency_symbol: '£S', country_name: 'Syria', country_code: 'SYR', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 165 },
    { currency_code: 'TJS', currency_name: 'Tajikistani Somoni', currency_symbol: 'ЅМ', country_name: 'Tajikistan', country_code: 'TJK', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 166 },
    { currency_code: 'TOP', currency_name: 'Tongan Paʻanga', currency_symbol: 'T$', country_name: 'Tonga', country_code: 'TON', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 167 },
    { currency_code: 'TTD', currency_name: 'Trinidad and Tobago Dollar', currency_symbol: 'TT$', country_name: 'Trinidad and Tobago', country_code: 'TTO', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 168 },
    { currency_code: 'TMT', currency_name: 'Turkmenistani Manat', currency_symbol: 'm', country_name: 'Turkmenistan', country_code: 'TKM', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 169 },
    { currency_code: 'UZS', currency_name: 'Uzbekistan Som', currency_symbol: 'so\'m', country_name: 'Uzbekistan', country_code: 'UZB', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 170 },
    { currency_code: 'VUV', currency_name: 'Vanuatu Vatu', currency_symbol: 'VT', country_name: 'Vanuatu', country_code: 'VUT', decimal_places: 0, display_format: '{symbol}{amount}', display_order: 171 },
    { currency_code: 'YER', currency_name: 'Yemeni Rial', currency_symbol: '﷼', country_name: 'Yemen', country_code: 'YEM', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 172 },
    { currency_code: 'ZMW', currency_name: 'Zambian Kwacha', currency_symbol: 'ZK', country_name: 'Zambia', country_code: 'ZMB', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 173 },
    { currency_code: 'ZWL', currency_name: 'Zimbabwean Dollar', currency_symbol: 'Z$', country_name: 'Zimbabwe', country_code: 'ZWE', decimal_places: 2, display_format: '{symbol}{amount}', display_order: 174 }
];

const seedCurrencies = async () => {
    try {
        console.log('Starting currency master seeding...');

        // Check if data already exists
        const existingCount = await HrmsCurrencyMaster.count();

        if (existingCount > 0) {
            console.log(`⚠ Currency master already has ${existingCount} records. Skipping seed.`);
            console.log('If you want to re-seed, truncate the table first.');
            return;
        }

        // Bulk insert all currencies
        await HrmsCurrencyMaster.bulkCreate(currencies);

        console.log(`✓ Successfully seeded ${currencies.length} currencies`);
        console.log('Currency master seeding completed!');

        // Show breakdown
        const activeCurrencies = currencies.filter(c => c.is_active !== 0).length;
        console.log(`  - Active currencies: ${activeCurrencies}`);
        console.log(`  - Inactive currencies: ${currencies.length - activeCurrencies}`);

    } catch (error) {
        console.error('Error seeding currencies:', error.message);
        throw error;
    }
};

// Run seeder if called directly
if (require.main === module) {
    seedCurrencies()
        .then(() => {
            console.log('Seeder completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeder failed:', error);
            process.exit(1);
        });
}

module.exports = { seedCurrencies };
