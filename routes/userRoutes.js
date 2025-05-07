const express = require("express");
const router = express.Router();

const { getUserProfile, logout } = require("../controllers/userController");
const authenticateUser = require("../middleware/auth");

// 🔐 Отримання профілю поточного користувача (авторизація обов'язкова)
router.get("/profile", authenticateUser, getUserProfile);

// 🔓 Вихід з облікового запису (опціонально — без перевірки токена)
router.post("/logout", logout);

module.exports = router;
