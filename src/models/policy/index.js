/**
 * Policy Models Index
 * Exports all policy-related models
 */

const { HrmsPolicyCategory } = require('./HrmsPolicyCategory');
const { HrmsPolicy } = require('./HrmsPolicy');
const { HrmsPolicyVersion } = require('./HrmsPolicyVersion');
const { HrmsPolicyAttachment } = require('./HrmsPolicyAttachment');
const { HrmsPolicyApplicability } = require('./HrmsPolicyApplicability');
const { HrmsEmployeePolicyAcknowledgment } = require('./HrmsEmployeePolicyAcknowledgment');
const { HrmsPolicyAcknowledgmentAudit } = require('./HrmsPolicyAcknowledgmentAudit');
const { HrmsPolicyNotification } = require('./HrmsPolicyNotification');

module.exports = {
    HrmsPolicyCategory,
    HrmsPolicy,
    HrmsPolicyVersion,
    HrmsPolicyAttachment,
    HrmsPolicyApplicability,
    HrmsEmployeePolicyAcknowledgment,
    HrmsPolicyAcknowledgmentAudit,
    HrmsPolicyNotification
};
