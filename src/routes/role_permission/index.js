/**
 * Role & Permission Routes Index
 * Central router for all role and permission related routes
 */

const express = require('express');
const router = express.Router();

const roleRoutes = require('./role.routes');
const permissionRoutes = require('./permission.routes');
const menuRoutes = require('./menu.routes');

// Role routes
router.use('/roles', roleRoutes);

// Permission routes
router.use('/permissions', permissionRoutes);

// Menu routes
router.use('/menus', menuRoutes);

module.exports = router;
