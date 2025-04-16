const express = require('express');
const router = express.Router();
const {
  loginUser, // 👈 контролер входу користувача
} = require('../controllers/authController'); // 👈 або твій контролер логіну

const {
  addLoginAttempt,
  getAllLoginAttempts,
  getUserLoginAttempts,
  checkFailedAttempts,
} = require('../controllers/loginAttemptController');

// ✅ Основний логін
router.post('/login', loginUser);

// 📌 Додати запис про спробу входу
router.post('/', addLoginAttempt);

// 📌 Отримати всі спроби входу
router.get('/', getAllLoginAttempts);

// 📌 Отримати спроби входу конкретного користувача
router.get('/:user_id', getUserLoginAttempts);

// 📌 Перевірити кількість невдалих спроб
router.get('/:user_id/failed', checkFailedAttempts);

module.exports = router;
