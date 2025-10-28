const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsLetterTemplate = sequelize.define('HrmsLetterTemplate', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },

    // Step 1: Letter Properties
    letter_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    letter_code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Unique code for template'
    },
    letter_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Reference to hrms_letter_category_master'
    },

    // Page Setup
    page_size: {
        type: DataTypes.ENUM('A4', 'A3', 'A5'),
        defaultValue: 'A4'
    },
    orientation: {
        type: DataTypes.ENUM('portrait', 'landscape'),
        defaultValue: 'portrait'
    },

    // Margins
    has_page_margin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    margin_top: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00
    },
    margin_left: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00
    },
    margin_right: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00
    },
    margin_bottom: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00
    },

    // Border
    has_border: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    border_size: {
        type: DataTypes.STRING(50),
        defaultValue: '1px'
    },
    border_margin_top: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00
    },
    border_margin_left: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00
    },

    // Page Number
    has_page_number: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    page_number_position: {
        type: DataTypes.ENUM('header', 'footer'),
        defaultValue: 'footer'
    },
    page_number_alignment: {
        type: DataTypes.ENUM('left', 'center', 'right'),
        defaultValue: 'center'
    },
    page_number_format: {
        type: DataTypes.STRING(50),
        defaultValue: 'Page {current} of {total}'
    },

    // Step 2: Header & Footer
    has_header: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    header_content: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    header_height: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00
    },

    has_footer: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    footer_content: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    footer_height: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00
    },

    // Step 3: Main Content
    main_content: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },

    // Additional Settings
    auto_generate_letter_number: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    letter_number_prefix: {
        type: DataTypes.STRING(50),
        defaultValue: 'LTR'
    },
    letter_number_format: {
        type: DataTypes.STRING(100),
        defaultValue: '{PREFIX}/{YEAR}/{MONTH}/{SEQ}'
    },

    // Watermark
    has_watermark: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    watermark_text: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    watermark_opacity: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.10
    },

    // Digital Signature
    requires_signature: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    signature_position: {
        type: DataTypes.ENUM('left', 'center', 'right'),
        defaultValue: 'right'
    },
    signatory_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    signatory_designation: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    signature_image_path: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },

    // Approval Workflow
    requires_approval: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    approval_workflow_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },

    // Status
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_system_template: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_draft: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    updated_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    }
}, {
    tableName: 'hrms_letter_templates',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['company_id'] },
        { fields: ['is_active'] },
        { fields: ['letter_code'] },
        { fields: ['category_id'] },
        { fields: ['company_id', 'letter_code'], unique: true }
    ]
});

module.exports = HrmsLetterTemplate;
