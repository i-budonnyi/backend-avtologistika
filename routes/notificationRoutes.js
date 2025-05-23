const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authenticateToken = require("../middleware/authenticateToken");

// ➕ Створити сповіщення
router.post("/", authenticateToken, notificationController.addNotification);

// 📥 Отримати всі сповіщення користувача
router.get("/me", authenticateToken, notificationController.getUserNotifications);

// ✅ Оновити статус
router.patch("/:id/status", authenticateToken, notificationController.updateNotificationStatus);

// 🔔 Позначити як прочитане
router.patch("/:id/read", authenticateToken, notificationController.markAsRead);

// 💬 Додати коментар
router.patch("/:id/comment", authenticateToken, notificationController.addCommentToNotification);

// 🗑 Видалити всі сповіщення
router.delete("/me", authenticateToken, notificationController.deleteAllNotifications);

module.exports = router;
