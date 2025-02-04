const express = require("express");
const { register, login, notFound } = require("../controllers/authController"); // Імпортуємо функції з контролера

const router = express.Router();

// Маршрут для реєстрації
router.post("/register", register);

// Маршрут для входу
router.post("/login", login);

// Обробка неіснуючих маршрутів
router.all("*", notFound);

module.exports = router;
