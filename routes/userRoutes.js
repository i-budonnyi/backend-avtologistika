const express = require("express");
const { getUserFromToken, logout } = require("../controllers/userController");

const router = express.Router();

// ❗ Додаємо маршрут, який використовує фронтенд
router.get("/user-data", getUserFromToken);

// Старий маршрут профілю (може бути видалений, якщо не використовується)
router.get("/profile", getUserFromToken);

// Маршрут для виходу
router.post("/logout", logout);

module.exports = router;
