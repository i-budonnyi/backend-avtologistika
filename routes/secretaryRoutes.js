const express = require('express');
const router = express.Router();
const { getSecretaryById, getAllSecretaries } = require('../controllers/secretaryController');

// 📌 Отримання всіх секретарів
router.get('/secretaries', getAllSecretaries);

// 📌 Отримання конкретного секретаря за ID
router.get('/secretary/:id', getSecretaryById);

module.exports = router;
