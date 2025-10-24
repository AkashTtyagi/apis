/**
 * Document Management Models
 * Exports all document management models with associations
 */

const HrmsDocumentFolder = require('./HrmsDocumentFolder');
const HrmsDocumentFolderPermission = require('./HrmsDocumentFolderPermission');
const HrmsDocumentType = require('./HrmsDocumentType');
const HrmsDocumentTypeField = require('./HrmsDocumentTypeField');
const HrmsEmployeeDocument = require('./HrmsEmployeeDocument');
const HrmsEmployeeDocumentFieldValue = require('./HrmsEmployeeDocumentFieldValue');
const HrmsDocumentAuditLog = require('./HrmsDocumentAuditLog');
const HrmsDocumentReminder = require('./HrmsDocumentReminder');

// ===================================================
// ASSOCIATIONS
// ===================================================

// Document Folder Associations
HrmsDocumentFolder.hasMany(HrmsDocumentFolderPermission, {
    foreignKey: 'folder_id',
    as: 'permissions'
});

HrmsDocumentFolderPermission.belongsTo(HrmsDocumentFolder, {
    foreignKey: 'folder_id',
    as: 'folder'
});

HrmsDocumentFolder.hasMany(HrmsDocumentType, {
    foreignKey: 'folder_id',
    as: 'documentTypes'
});

HrmsDocumentType.belongsTo(HrmsDocumentFolder, {
    foreignKey: 'folder_id',
    as: 'folder'
});

// Document Type Associations
HrmsDocumentType.hasMany(HrmsDocumentTypeField, {
    foreignKey: 'document_type_id',
    as: 'fields'
});

HrmsDocumentTypeField.belongsTo(HrmsDocumentType, {
    foreignKey: 'document_type_id',
    as: 'documentType'
});

HrmsDocumentType.hasMany(HrmsEmployeeDocument, {
    foreignKey: 'document_type_id',
    as: 'employeeDocuments'
});

HrmsEmployeeDocument.belongsTo(HrmsDocumentType, {
    foreignKey: 'document_type_id',
    as: 'documentType'
});

// Employee Document Associations
HrmsEmployeeDocument.belongsTo(HrmsDocumentFolder, {
    foreignKey: 'folder_id',
    as: 'folder'
});

HrmsDocumentFolder.hasMany(HrmsEmployeeDocument, {
    foreignKey: 'folder_id',
    as: 'employeeDocuments'
});

HrmsEmployeeDocument.hasMany(HrmsEmployeeDocumentFieldValue, {
    foreignKey: 'employee_document_id',
    as: 'fieldValues'
});

HrmsEmployeeDocumentFieldValue.belongsTo(HrmsEmployeeDocument, {
    foreignKey: 'employee_document_id',
    as: 'employeeDocument'
});

HrmsEmployeeDocumentFieldValue.belongsTo(HrmsDocumentTypeField, {
    foreignKey: 'field_id',
    as: 'field'
});

HrmsDocumentTypeField.hasMany(HrmsEmployeeDocumentFieldValue, {
    foreignKey: 'field_id',
    as: 'values'
});

// Reminder Associations
HrmsEmployeeDocument.hasMany(HrmsDocumentReminder, {
    foreignKey: 'employee_document_id',
    as: 'reminders'
});

HrmsDocumentReminder.belongsTo(HrmsEmployeeDocument, {
    foreignKey: 'employee_document_id',
    as: 'employeeDocument'
});

module.exports = {
    HrmsDocumentFolder,
    HrmsDocumentFolderPermission,
    HrmsDocumentType,
    HrmsDocumentTypeField,
    HrmsEmployeeDocument,
    HrmsEmployeeDocumentFieldValue,
    HrmsDocumentAuditLog,
    HrmsDocumentReminder
};
