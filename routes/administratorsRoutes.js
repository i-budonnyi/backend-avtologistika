const express = require('express');
const router = express.Router();
const administratorsController = require('../controllers/administratorsController');

// Отримати всіх адміністраторів
router.get('/', administratorsController.getAllAdministrators);

// Додати нового адміністратора
router.post('/', administratorsController.createAdministrator);

// Видалити адміністратора
router.delete('/:id', administratorsController.deleteAdministrator);

module.exports = router;
