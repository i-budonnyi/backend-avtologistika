const pool = require("../config/db");

// ➕ Створити сповіщення
const createNotification = async (req, res) => {
  try {
    const { user_id, message } = req.body;

    if (!user_id || !message) {
      return res.status(400).json({ message: "user_id та message є обов’язковими." });
    }

    const result = await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`,
      [user_id, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ createNotification:", error.message);
    res.status(500).json({ message: "Помилка при створенні сповіщення.", error: error.message });
  }
};

// 📥 Отримати всі сповіщення користувача
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ getUserNotifications:", error.message);
    res.status(500).json({ message: "Помилка сервера.", error: error.message });
  }
};

// ✅ Оновити статус (наприклад, на "прочитано")
const updateNotificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Статус є обов’язковим." });
    }

    await pool.query(`UPDATE notifications SET status = $1 WHERE id = $2`, [status, id]);

    res.status(200).json({ message: "Статус оновлено.", id, status });
  } catch (error) {
    console.error("❌ updateNotificationStatus:", error.message);
    res.status(500).json({ message: "Помилка сервера.", error: error.message });
  }
};

// 🔔 Позначити як прочитане (окрема дія)
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`UPDATE notifications SET is_read = true WHERE id = $1`, [id]);

    res.json({ success: true });
  } catch (error) {
    console.error("❌ markAsRead:", error.message);
    res.status(500).json({ message: "Не вдалося оновити статус", error: error.message });
  }
};

// 💬 Додати коментар до сповіщення (опційно)
const addCommentToNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ message: "Коментар є обов’язковим." });
    }

    await pool.query(`UPDATE notifications SET comment = $1 WHERE id = $2`, [comment, id]);

    res.status(200).json({ message: "Коментар додано.", id, comment });
  } catch (error) {
    console.error("❌ addCommentToNotification:", error.message);
    res.status(500).json({ message: "Помилка сервера.", error: error.message });
  }
};

// 🗑 Видалити всі сповіщення користувача
const deleteAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);

    res.json({ success: true });
  } catch (error) {
    console.error("❌ deleteAllNotifications:", error.message);
    res.status(500).json({ message: "Не вдалося видалити", error: error.message });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  updateNotificationStatus,
  markAsRead,
  addCommentToNotification,
  deleteAllNotifications,
};
