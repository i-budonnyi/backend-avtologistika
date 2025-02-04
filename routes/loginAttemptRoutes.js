const express = require('express');
const router = express.Router();
const {
    addLoginAttempt,
    getAllLoginAttempts,
    getUserLoginAttempts,
    checkFailedAttempts,
} = require('../controllers/loginAttemptController');

// Роут для додавання запису про спробу входу
router.post('/', addLoginAttempt);

// Роут для отримання всіх спроб входу
router.get('/', getAllLoginAttempts);

// Роут для отримання спроб входу конкретного користувача
router.get('/:user_id', getUserLoginAttempts);

// Роут для перевірки кількості невдалих спроб входу
router.get('/:user_id/failed', checkFailedAttempts);

module.exports = router;
