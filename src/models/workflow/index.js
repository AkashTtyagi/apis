/**
 * Workflow Models Index
 * Exports all workflow-related models
 *
 * Note: Associations are set up in the main models/index.js
 * This file only exports the models for convenience
 */

const { HrmsWorkflowMaster } = require('./HrmsWorkflowMaster');
const { HrmsWorkflowConfig } = require('./HrmsWorkflowConfig');
const { HrmsWorkflowStage } = require('./HrmsWorkflowStage');
const { HrmsWorkflowStageApprover } = require('./HrmsWorkflowStageApprover');
const { HrmsWorkflowCondition } = require('./HrmsWorkflowCondition');
const { HrmsWorkflowConditionRule } = require('./HrmsWorkflowConditionRule');
const { HrmsWorkflowApplicability } = require('./HrmsWorkflowApplicability');
const { HrmsWorkflowRequest } = require('./HrmsWorkflowRequest');
const { HrmsWorkflowAction } = require('./HrmsWorkflowAction');
const { HrmsWorkflowEmailTemplate } = require('./HrmsWorkflowEmailTemplate');
const { HrmsWorkflowVersion } = require('./HrmsWorkflowVersion');
const { HrmsWorkflowStageAssignment } = require('./HrmsWorkflowStageAssignment');

module.exports = {
    HrmsWorkflowMaster,
    HrmsWorkflowConfig,
    HrmsWorkflowStage,
    HrmsWorkflowStageApprover,
    HrmsWorkflowCondition,
    HrmsWorkflowConditionRule,
    HrmsWorkflowApplicability,
    HrmsWorkflowRequest,
    HrmsWorkflowAction,
    HrmsWorkflowEmailTemplate,
    HrmsWorkflowVersion,
    HrmsWorkflowStageAssignment
};
