const express = require("express");
const router = express.Router();

const {
  addNotification,
  getUserNotifications,
  getNotificationsByUserId,
  updateNotificationStatus,
  markAsRead,
  addCommentToNotification,
  deleteAllNotifications,
} = require("../controllers/notificationController");

const { getUserProfile, logout } = require("../controllers/userController"); // ✅ Підключено з іншого маршруту
const verifyAccessToken = require("../middleware/verifyAccessToken");

// ✅ Додаткові маршрути профілю, якщо потрібно
router.get("/user/profile", verifyAccessToken, getUserProfile);
router.post("/user/logout", verifyAccessToken, logout);

// 🔔 Створити нове сповіщення
router.post("/", verifyAccessToken, addNotification);

// 📩 Отримати всі сповіщення поточного користувача
router.get("/me", verifyAccessToken, getUserNotifications);

// 📥 Отримати сповіщення по userId (наприклад, для адміністратора)
router.get("/user/:id", verifyAccessToken, getNotificationsByUserId);

// 🔄 Оновити статус
router.patch("/:id/status", verifyAccessToken, updateNotificationStatus);

// ✅ Позначити як прочитане
router.patch("/:id/read", verifyAccessToken, markAsRead);

// 💬 Додати коментар
router.patch("/:id/comment", verifyAccessToken, addCommentToNotification);

// 🗑 Видалити всі сповіщення
router.delete("/me", verifyAccessToken, deleteAllNotifications);

module.exports = router;
