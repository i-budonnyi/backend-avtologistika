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

const verifyAccessToken = require("../middleware/verifyAccessToken"); // 🔐 Перевірка JWT токена

// 🔔 Створити нове сповіщення (наприклад, коли подано ідею)
router.post("/", verifyAccessToken, addNotification);

// 📩 Отримати всі сповіщення для поточного користувача
router.get("/me", verifyAccessToken, getUserNotifications);

// 🔄 Оновити статус сповіщення (наприклад, переглянуто/нове)
router.patch("/:id/status", verifyAccessToken, updateNotificationStatus);

// ✅ Позначити сповіщення як прочитане
router.patch("/:id/read", verifyAccessToken, markAsRead);

// 💬 Додати коментар до сповіщення (наприклад, реакція користувача)
router.patch("/:id/comment", verifyAccessToken, addCommentToNotification);

// 🗑 Видалити всі сповіщення користувача
router.delete("/me", verifyAccessToken, deleteAllNotifications);

module.exports = router;
