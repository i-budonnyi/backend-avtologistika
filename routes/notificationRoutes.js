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

// 🔔 Створити нове сповіщення
router.post("/", verifyAccessToken, addNotification);

// 📩 Отримати всі сповіщення поточного користувача (через req.user)
router.get("/me", verifyAccessToken, getUserNotifications);

// 📥 Отримати сповіщення по userId напряму з URL — для фронту
router.get("/user/:id", verifyAccessToken, async (req, res) => {
  const pool = require("../config/db");
  const userId = req.params.id;

  console.log("📩 [GET /notification/user/:id] Отримання сповіщень для user_id:", userId);
  console.log("🔐 Authorization:", req.headers.authorization);

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    console.log(`✅ Знайдено ${result.rows.length} сповіщень для користувача ${userId}`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Помилка при виконанні SQL:", error);
    res.status(500).json({ message: "Помилка при отриманні сповіщень." });
  }
});

// 🔄 Оновити статус
router.patch("/:id/status", verifyAccessToken, updateNotificationStatus);

// ✅ Позначити як прочитане
router.patch("/:id/read", verifyAccessToken, markAsRead);

// 💬 Додати коментар
router.patch("/:id/comment", verifyAccessToken, addCommentToNotification);

// 🗑 Видалити всі
router.delete("/me", verifyAccessToken, deleteAllNotifications);

module.exports = router;
