const express = require("express");
const router = express.Router();
const {
  addNotification,
  getUserNotifications,
  updateNotificationStatus,
  markAsRead,
  addCommentToNotification,
  deleteAllNotifications,
} = require("../controllers/notificationController");

const authenticate = require("../middleware/auth"); // ✅ Підключення твого кастомного middleware

// ➕ Створити сповіщення
router.post("/", authenticate, addNotification);

// 📥 Отримати всі сповіщення для авторизованого користувача
router.get("/me", authenticate, getUserNotifications);

// ✅ Оновити статус сповіщення
router.patch("/:id/status", authenticate, updateNotificationStatus);

// 🔔 Позначити як прочитане
router.patch("/:id/read", authenticate, markAsRead);

// 💬 Додати коментар
router.patch("/:id/comment", authenticate, addCommentToNotification);

// 🗑 Видалити всі сповіщення користувача
router.delete("/me", authenticate, deleteAllNotifications);

module.exports = router;
