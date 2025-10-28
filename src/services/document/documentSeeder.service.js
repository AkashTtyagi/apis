/**
 * Document Management Seeder Service
 * Creates default folders and document types for new companies
 */

const HrmsDocumentFolder = require('../../models/document/HrmsDocumentFolder');
const HrmsDocumentType = require('../../models/document/HrmsDocumentType');
const HrmsDocumentFolderPermission = require('../../models/document/HrmsDocumentFolderPermission');

/**
 * Default folder and document type structure
 */
const DEFAULT_STRUCTURE = [
    {
        folder_name: 'Employee Documents',
        folder_description: 'All employee related documents',
        is_system_folder: true,
        display_order: 1,
        document_types: [
            {
                document_type_code: 'AADHAAR_CARD',
                document_type_name: 'Aadhaar Card',
                document_description: 'Government issued Aadhaar card',
                allow_single_document: true,
                is_mandatory: true,
                require_expiry_date: false,
                allowed_file_types: 'pdf,jpg,jpeg,png',
                max_file_size_mb: 5.00,
                display_order: 1
            },
            {
                document_type_code: 'PAN_CARD',
                document_type_name: 'PAN Card',
                document_description: 'Permanent Account Number card',
                allow_single_document: true,
                is_mandatory: true,
                require_expiry_date: false,
                allowed_file_types: 'pdf,jpg,jpeg,png',
                max_file_size_mb: 5.00,
                display_order: 2
            },
            {
                document_type_code: 'PASSPORT',
                document_type_name: 'Passport',
                document_description: 'Passport document',
                allow_single_document: true,
                is_mandatory: false,
                allow_not_applicable: true,
                require_expiry_date: true,
                allowed_file_types: 'pdf,jpg,jpeg,png',
                max_file_size_mb: 5.00,
                display_order: 3
            },
            {
                document_type_code: 'DRIVING_LICENSE',
                document_type_name: 'Driving License',
                document_description: 'Driving license document',
                allow_single_document: true,
                is_mandatory: false,
                allow_not_applicable: true,
                require_expiry_date: true,
                allowed_file_types: 'pdf,jpg,jpeg,png',
                max_file_size_mb: 5.00,
                display_order: 4
            },
            {
                document_type_code: 'EDUCATIONAL_CERT',
                document_type_name: 'Educational Certificates',
                document_description: 'Degree and educational certificates',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: true,
                require_expiry_date: false,
                allowed_file_types: 'pdf,jpg,jpeg,png',
                max_file_size_mb: 10.00,
                display_order: 5
            },
            {
                document_type_code: 'EXPERIENCE_LETTER',
                document_type_name: 'Experience Letters',
                document_description: 'Previous employment experience letters',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                allow_not_applicable: true,
                require_expiry_date: false,
                allowed_file_types: 'pdf,jpg,jpeg,png',
                max_file_size_mb: 10.00,
                display_order: 6
            },
            {
                document_type_code: 'BANK_DETAILS',
                document_type_name: 'Bank Account Details',
                document_description: 'Bank account details and cancelled cheque',
                allow_single_document: true,
                is_mandatory: true,
                require_expiry_date: false,
                allowed_file_types: 'pdf,jpg,jpeg,png',
                max_file_size_mb: 5.00,
                display_order: 7
            },
            {
                document_type_code: 'ADDRESS_PROOF',
                document_type_name: 'Address Proof',
                document_description: 'Address verification documents',
                allow_single_document: true,
                is_mandatory: true,
                require_expiry_date: false,
                allowed_file_types: 'pdf,jpg,jpeg,png',
                max_file_size_mb: 5.00,
                display_order: 8
            }
        ]
    },
    {
        folder_name: 'Employment Letters',
        folder_description: 'Employment related letters and communications',
        is_system_folder: true,
        display_order: 2,
        document_types: [
            {
                document_type_code: 'OFFER_LETTER',
                document_type_name: 'Offer Letter',
                document_description: 'Employment offer letter',
                allow_single_document: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf',
                max_file_size_mb: 5.00,
                display_order: 1
            },
            {
                document_type_code: 'APPOINTMENT_LETTER',
                document_type_name: 'Appointment Letter',
                document_description: 'Appointment letter',
                allow_single_document: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf',
                max_file_size_mb: 5.00,
                display_order: 2
            },
            {
                document_type_code: 'CONFIRMATION_LETTER',
                document_type_name: 'Confirmation Letter',
                document_description: 'Probation confirmation letter',
                allow_single_document: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf',
                max_file_size_mb: 5.00,
                display_order: 3
            },
            {
                document_type_code: 'INCREMENT_LETTER',
                document_type_name: 'Increment Letter',
                document_description: 'Salary increment letter',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf',
                max_file_size_mb: 5.00,
                display_order: 4
            },
            {
                document_type_code: 'PROMOTION_LETTER',
                document_type_name: 'Promotion Letter',
                document_description: 'Promotion letter',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf',
                max_file_size_mb: 5.00,
                display_order: 5
            },
            {
                document_type_code: 'TRANSFER_LETTER',
                document_type_name: 'Transfer Letter',
                document_description: 'Transfer letter',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf',
                max_file_size_mb: 5.00,
                display_order: 6
            }
        ]
    },
    {
        folder_name: 'Payroll Documents',
        folder_description: 'Payroll and salary related documents',
        is_system_folder: true,
        display_order: 3,
        document_types: [
            {
                document_type_code: 'SALARY_SLIP',
                document_type_name: 'Salary Slip',
                document_description: 'Monthly salary slip',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf',
                max_file_size_mb: 5.00,
                display_order: 1
            },
            {
                document_type_code: 'FORM_16',
                document_type_name: 'Form 16',
                document_description: 'Annual Form 16 (TDS Certificate)',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf',
                max_file_size_mb: 5.00,
                display_order: 2
            },
            {
                document_type_code: 'INVESTMENT_DECLARATION',
                document_type_name: 'Investment Declaration',
                document_description: 'Tax saving investment declaration',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf,jpg,jpeg,png',
                max_file_size_mb: 10.00,
                display_order: 3
            },
            {
                document_type_code: 'REIMBURSEMENT',
                document_type_name: 'Reimbursement Bills',
                document_description: 'Expense reimbursement bills and receipts',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf,jpg,jpeg,png',
                max_file_size_mb: 10.00,
                display_order: 4
            }
        ]
    },
    {
        folder_name: 'Leave Documents',
        folder_description: 'Leave related documents',
        is_system_folder: true,
        display_order: 4,
        document_types: [
            {
                document_type_code: 'LEAVE_APPLICATION',
                document_type_name: 'Leave Application',
                document_description: 'Leave application form',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf,jpg,jpeg,png',
                max_file_size_mb: 5.00,
                display_order: 1
            },
            {
                document_type_code: 'MEDICAL_CERTIFICATE',
                document_type_name: 'Medical Certificate',
                document_description: 'Medical certificate for sick leave',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf,jpg,jpeg,png',
                max_file_size_mb: 5.00,
                display_order: 2
            }
        ]
    },
    {
        folder_name: 'Performance Documents',
        folder_description: 'Performance and appraisal documents',
        is_system_folder: true,
        display_order: 5,
        document_types: [
            {
                document_type_code: 'APPRAISAL_LETTER',
                document_type_name: 'Appraisal Letter',
                document_description: 'Performance appraisal letter',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf',
                max_file_size_mb: 5.00,
                display_order: 1
            },
            {
                document_type_code: 'PERFORMANCE_REVIEW',
                document_type_name: 'Performance Review',
                document_description: 'Performance review documents',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf,doc,docx',
                max_file_size_mb: 10.00,
                display_order: 2
            }
        ]
    },
    {
        folder_name: 'Exit Documents',
        folder_description: 'Employee exit related documents',
        is_system_folder: true,
        display_order: 6,
        document_types: [
            {
                document_type_code: 'RESIGNATION_LETTER',
                document_type_name: 'Resignation Letter',
                document_description: 'Employee resignation letter',
                allow_single_document: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf,jpg,jpeg,png',
                max_file_size_mb: 5.00,
                display_order: 1
            },
            {
                document_type_code: 'RELIEVING_LETTER',
                document_type_name: 'Relieving Letter',
                document_description: 'Employee relieving letter',
                allow_single_document: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf',
                max_file_size_mb: 5.00,
                display_order: 2
            },
            {
                document_type_code: 'EXPERIENCE_CERTIFICATE',
                document_type_name: 'Experience Certificate',
                document_description: 'Experience certificate issued by company',
                allow_single_document: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf',
                max_file_size_mb: 5.00,
                display_order: 3
            },
            {
                document_type_code: 'FNF_SETTLEMENT',
                document_type_name: 'Full & Final Settlement',
                document_description: 'Full and final settlement documents',
                allow_single_document: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf',
                max_file_size_mb: 5.00,
                display_order: 4
            }
        ]
    },
    {
        folder_name: 'Company Policies',
        folder_description: 'Company policies and handbooks',
        is_system_folder: true,
        display_order: 7,
        document_types: [
            {
                document_type_code: 'EMPLOYEE_HANDBOOK',
                document_type_name: 'Employee Handbook',
                document_description: 'Employee handbook and guidelines',
                allow_single_document: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf',
                max_file_size_mb: 20.00,
                display_order: 1
            },
            {
                document_type_code: 'POLICY_DOCUMENT',
                document_type_name: 'Policy Document',
                document_description: 'Various company policy documents',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                require_expiry_date: false,
                allowed_file_types: 'pdf,doc,docx',
                max_file_size_mb: 10.00,
                display_order: 2
            }
        ]
    },
    {
        folder_name: 'Miscellaneous',
        folder_description: 'Other documents',
        is_system_folder: false,
        display_order: 8,
        document_types: [
            {
                document_type_code: 'OTHER_DOCUMENT',
                document_type_name: 'Other Document',
                document_description: 'Other miscellaneous documents',
                allow_single_document: false,
                allow_multiple_documents: true,
                is_mandatory: false,
                allow_not_applicable: true,
                require_expiry_date: false,
                allowed_file_types: 'pdf,jpg,jpeg,png,doc,docx,xls,xlsx',
                max_file_size_mb: 10.00,
                display_order: 1
            }
        ]
    }
];

/**
 * Default folder permissions
 * These will be applied to all folders
 */
const DEFAULT_PERMISSIONS = [
    {
        role_type: 'employee',
        can_view: true,
        can_add: true,
        can_update: false,
        can_delete: false
    },
    {
        role_type: 'reporting_manager',
        can_view: true,
        can_add: true,
        can_update: true,
        can_delete: false
    },
    {
        role_type: 'hr',
        can_view: true,
        can_add: true,
        can_update: true,
        can_delete: true
    },
    {
        role_type: 'admin',
        can_view: true,
        can_add: true,
        can_update: true,
        can_delete: true
    }
];

/**
 * Seed default folders and document types for a company
 * @param {number} company_id - Company ID
 * @param {number} user_id - User ID who is creating
 * @param {Object} transaction - Sequelize transaction (optional)
 * @returns {Promise<Object>} Created folders and document types count
 */
const seedDefaultDocumentStructure = async (company_id, user_id, transaction = null) => {
    try {
        console.log(`\n📁 Creating default document structure for company ${company_id}...`);

        let totalFolders = 0;
        let totalDocumentTypes = 0;
        let totalPermissions = 0;

        for (const folderConfig of DEFAULT_STRUCTURE) {
            const { document_types, ...folderData } = folderConfig;

            // Create folder
            const folder = await HrmsDocumentFolder.create({
                ...folderData,
                company_id,
                created_by: user_id,
                is_active: true
            }, { transaction });

            totalFolders++;
            console.log(`  ✓ Created folder: ${folder.folder_name}`);

            // Create default permissions for this folder
            const permissions = DEFAULT_PERMISSIONS.map(perm => ({
                folder_id: folder.id,
                ...perm,
                created_by: user_id,
                is_active: true
            }));

            await HrmsDocumentFolderPermission.bulkCreate(permissions, { transaction });
            totalPermissions += permissions.length;
            console.log(`    ✓ Created ${permissions.length} permission rules`);

            // Create document types in this folder
            if (document_types && document_types.length > 0) {
                for (const docType of document_types) {
                    await HrmsDocumentType.create({
                        ...docType,
                        company_id,
                        folder_id: folder.id,
                        is_system_type: folderData.is_system_folder,
                        created_by: user_id,
                        is_active: true
                    }, { transaction });

                    totalDocumentTypes++;
                }
                console.log(`    ✓ Created ${document_types.length} document types`);
            }
        }

        console.log(`\n✅ Document structure created successfully!`);
        console.log(`📊 Summary:`);
        console.log(`   - Folders: ${totalFolders}`);
        console.log(`   - Document Types: ${totalDocumentTypes}`);
        console.log(`   - Permission Rules: ${totalPermissions}\n`);

        return {
            success: true,
            folders_created: totalFolders,
            document_types_created: totalDocumentTypes,
            permissions_created: totalPermissions
        };
    } catch (error) {
        console.error('❌ Error seeding document structure:', error.message);
        throw error;
    }
};

/**
 * Check if document structure already exists for a company
 * @param {number} company_id - Company ID
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
const checkDocumentStructureExists = async (company_id) => {
    try {
        const count = await HrmsDocumentFolder.count({
            where: {
                company_id,
                is_system_folder: true
            }
        });

        return count > 0;
    } catch (error) {
        console.error('Error checking document structure:', error.message);
        return false;
    }
};

module.exports = {
    seedDefaultDocumentStructure,
    checkDocumentStructureExists
};
