const express = require("express");
const userController = require("../controllers/userController"); // імпортуємо як об'єкт
const authMiddleware = require("../middleware/auth"); 

const router = express.Router();

// Захист маршруту профілю
router.get("/profile", authMiddleware, userController.getUserProfile);

// Вихід
router.post("/logout", userController.logout);

module.exports = router;
