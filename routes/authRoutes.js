const express = require("express");
const { register, login, notFound } = require("../controllers/authController"); // Імпорт логіки

const router = express.Router();

// ✅ Реєстрація користувача
router.post("/register", register);

// ✅ Вхід користувача
router.post("/login", login);

// ❌ Обробка неіснуючих маршрутів
router.all("*", notFound);

module.exports = router;
