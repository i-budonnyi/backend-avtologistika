const express = require('express');
const router = express.Router();
const adminPermissionsController = require('../controllers/adminPermissionsController');

// Роут для отримання всіх записів
router.get('/admin_permissions', adminPermissionsController.getAllAdminPermissions);

// Роут для отримання запису за ID
router.get('/admin_permissions/:admin_id', adminPermissionsController.getAdminPermissionById);

// Роут для створення запису
router.post('/admin_permissions', adminPermissionsController.createAdminPermission);

// Роут для оновлення запису
router.put('/admin_permissions/:admin_id', adminPermissionsController.updateAdminPermission);

// Роут для видалення запису
router.delete('/admin_permissions/:admin_id', adminPermissionsController.deleteAdminPermission);

// Роут для виклику функції для призначення прав
router.post('/assign-full-admin-permissions', adminPermissionsController.assignFullAdminPermissions);

module.exports = router;
