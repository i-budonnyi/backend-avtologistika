// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// ➕ Додати нове сповіщення
router.post("/", notificationController.addNotification);

// 📥 Отримати всі сповіщення користувача
router.get("/:userId", notificationController.getUserNotifications);

// ✅ Позначити одне як прочитане
router.patch("/:id/read", notificationController.markAsRead);

// 🗑 Видалити всі сповіщення користувача
router.delete("/:userId", notificationController.deleteAllNotifications);

module.exports = router;
