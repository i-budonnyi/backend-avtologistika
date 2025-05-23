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

const verifyAccessToken = require("../middleware/verifyAccessToken"); // ✅ новий middleware

// ➕ Створити сповіщення
router.post("/", verifyAccessToken, addNotification);

// 📥 Отримати всі сповіщення користувача
router.get("/me", verifyAccessToken, getUserNotifications);

// ✅ Оновити статус
router.patch("/:id/status", verifyAccessToken, updateNotificationStatus);

// 🔔 Позначити як прочитане
router.patch("/:id/read", verifyAccessToken, markAsRead);

// 💬 Додати коментар
router.patch("/:id/comment", verifyAccessToken, addCommentToNotification);

// 🗑 Видалити всі сповіщення
router.delete("/me", verifyAccessToken, deleteAllNotifications);

module.exports = router;
