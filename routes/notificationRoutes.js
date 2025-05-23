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

const authenticateUser = require("../middleware/authenticateToken"); // або authenticateToken — головне, щоб збігалося з використанням

// ➕ Створити сповіщення
router.post("/", authenticateUser, addNotification);

// 📥 Отримати всі сповіщення користувача
router.get("/me", authenticateUser, getUserNotifications);

// ✅ Оновити статус
router.patch("/:id/status", authenticateUser, updateNotificationStatus);

// 🔔 Позначити як прочитане
router.patch("/:id/read", authenticateUser, markAsRead);

// 💬 Додати коментар
router.patch("/:id/comment", authenticateUser, addCommentToNotification);

// 🗑 Видалити всі сповіщення
router.delete("/me", authenticateUser, deleteAllNotifications);

module.exports = router;
