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

// ➕ Створити сповіщення
router.post("/", addNotification);

// 📥 Отримати всі сповіщення користувача по id (без токена)
router.get("/:user_id", getUserNotifications);

// ✅ Оновити статус
router.patch("/:id/status", updateNotificationStatus);

// 🔔 Позначити як прочитане
router.patch("/:id/read", markAsRead);

// 💬 Додати коментар
router.patch("/:id/comment", addCommentToNotification);

// 🗑 Видалити всі сповіщення по user_id
router.delete("/:user_id", deleteAllNotifications);

module.exports = router;
