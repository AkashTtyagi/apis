/**
 * Menu Routes
 * API routes for menu management and user menu access
 */

const express = require('express');
const router = express.Router();
const menuController = require('../../controllers/role_permission/menu.controller');

// All routes are POST type
router.post('/get-by-application', menuController.getMenusByApplication);
router.post('/get-by-id', menuController.getMenuById);
router.post('/create', menuController.createMenu);
router.post('/update', menuController.updateMenu);
router.post('/delete', menuController.deleteMenu);
router.post('/get-user-menus', menuController.getUserMenus);
router.post('/get-user-screen-permissions', menuController.getUserScreenPermissions);

// New split APIs
router.post('/get-user-menus-list', menuController.getUserMenusList);
router.post('/get-user-menus-permissions', menuController.getUserMenusPermissions);

module.exports = router;
