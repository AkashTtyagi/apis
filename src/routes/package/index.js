/**
 * Package Routes Index
 * Central router for all package related routes
 */

const express = require('express');
const router = express.Router();

const packageRoutes = require('./package.routes');
const moduleRoutes = require('./module.routes');
const companyPackageRoutes = require('./companyPackage.routes');

// Package routes
router.use('/packages', packageRoutes);

// Module routes
router.use('/modules', moduleRoutes);

// Company Package routes
router.use('/company-packages', companyPackageRoutes);

module.exports = router;
