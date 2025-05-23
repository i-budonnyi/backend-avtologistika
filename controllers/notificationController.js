const pool = require("../config/db");

// ➕ Створити сповіщення з WebSocket
const createNotification = async (req, res) => {
  const { message } = req.body;
  const user_id = req.user?.id;
  const io = req.app.get("io");

  if (!user_id || !message) {
    return res.status(400).json({ message: "user_id та message є обов’язковими." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`,
      [user_id, message]
    );

    const notification = result.rows[0];

    // 🔔 Надіслати сповіщення автору
    io.emit(`notification_${user_id}`, notification);

    // 🌍 Надіслати сповіщення всім (глобальний канал)
    io.emit("notification_all", notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error("❌ [createNotification] Помилка:", error);
    res.status(500).json({ message: "Помилка при створенні сповіщення.", error: error.message });
  }
};

// 📥 Отримати всі сповіщення користувача з токена
const getUserNotifications = async (req, res) => {
  const user_id = req.user?.id;

  if (!user_id) {
    return res.status(401).json({ message: "Користувач не авторизований." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("[getUserNotifications] SQL помилка:", error.message);
    res.status(500).json({ message: "Помилка при отриманні сповіщень.", error: error.message });
  }
};

// ✅ Оновити статус сповіщення
const updateNotificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Статус є обов’язковим." });
  }

  try {
    const result = await pool.query(
      `UPDATE notifications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Сповіщення не знайдено." });
    }

    res.status(200).json({ message: "Статус оновлено", data: result.rows[0] });
  } catch (error) {
    console.error("❌ [updateNotificationStatus] Помилка:", error);
    res.status(500).json({ message: "Помилка при оновленні статусу.", error: error.message });
  }
};

// 🔔 Позначити сповіщення як прочитане
const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Сповіщення не знайдено." });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ [markAsRead] Помилка:", error);
    res.status(500).json({ message: "Не вдалося оновити статус прочитаності.", error: error.message });
  }
};

// 💬 Додати коментар до сповіщення
const addCommentToNotification = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ message: "Коментар є обов’язковим." });
  }

  try {
    const result = await pool.query(
      `UPDATE notifications SET comment = $1 WHERE id = $2 RETURNING *`,
      [comment, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Сповіщення не знайдено." });
    }

    res.status(200).json({ message: "Коментар додано.", data: result.rows[0] });
  } catch (error) {
    console.error("❌ [addCommentToNotification] Помилка:", error);
    res.status(500).json({ message: "Помилка при додаванні коментаря.", error: error.message });
  }
};

// 🗑 Видалити всі сповіщення користувача
const deleteAllNotifications = async (req, res) => {
  const user_id = req.user?.id;

  if (!user_id) {
    return res.status(401).json({ message: "Користувач не авторизований." });
  }

  try {
    await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [user_id]);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ [deleteAllNotifications] Помилка:", error);
    res.status(500).json({ message: "Помилка при видаленні сповіщень.", error: error.message });
  }
};

module.exports = {
  addNotification: createNotification,
  getUserNotifications,
  updateNotificationStatus,
  markAsRead,
  addCommentToNotification,
  deleteAllNotifications,
};
