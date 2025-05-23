const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authenticateUser = require("../middleware/authenticateToken"); // 🔹 Імпорт названо authenticateUser

// ➕ Створити сповіщення
router.post("/", authenticateUser, notificationController.addNotification);

// 📥 Отримати всі сповіщення користувача
router.get("/me", authenticateUser, notificationController.getUserNotifications);

// ✅ Оновити статус
router.patch("/:id/status", authenticateUser, notificationController.updateNotificationStatus);

// 🔔 Позначити як прочитане
router.patch("/:id/read", authenticateUser, notificationController.markAsRead);

// 💬 Додати коментар
router.patch("/:id/comment", authenticateUser, notificationController.addCommentToNotification);

// 🗑 Видалити всі сповіщення
router.delete("/me", authenticateUser, notificationController.deleteAllNotifications);

module.exports = router;
