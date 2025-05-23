const pool = require("../config/db");

// ➕ Створити сповіщення з WebSocket
const createNotification = async (req, res) => {
  const io = req.app.get("io");

  const user_id = req.user?.id || req.body.user_id;
  const message = req.body.message;

  console.log("📥 [POST /notification] Створення сповіщення →", {
    headers: req.headers,
    userFromToken: req.user,
    user_id,
    message,
  });

  if (!user_id || !message) {
    console.warn("⚠️ Відсутній user_id або message.");
    return res.status(400).json({ message: "user_id та message є обов’язковими." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`,
      [user_id, message]
    );

    const notification = result.rows[0];
    console.log("✅ [POST /notification] Успішно створено:", notification);

    io.emit(`notification_${user_id}`, notification);
    io.emit("notification_all", notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error("❌ [POST /notification] SQL помилка:", error);
    res.status(500).json({ message: "Помилка при створенні сповіщення.", error: error.message });
  }
};

// 📥 Отримати всі сповіщення користувача
const getUserNotifications = async (req, res) => {
  const userId = req.user?.id;

  console.log("📥 [GET /notification/me] Запит сповіщень:", {
    headers: req.headers,
    userFromToken: req.user,
    userId,
  });

  if (!userId) {
    console.warn("⚠️ [GET /notification/me] Не авторизований користувач.");
    return res.status(401).json({ message: "Не авторизований користувач." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    console.log(`✅ Знайдено ${result.rows.length} сповіщень`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ [GET /notification/me] SQL помилка:", error);
    res.status(500).json({ message: "Помилка при отриманні сповіщень.", error: error.message });
  }
};

// ✅ Оновити статус
const updateNotificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log("🔄 [PATCH /notification/:id/status] Запит оновлення статусу:", { id, status });

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
    console.error("❌ [updateNotificationStatus] SQL помилка:", error);
    res.status(500).json({ message: "Помилка при оновленні статусу.", error: error.message });
  }
};

// 🔔 Позначити як прочитане
const markAsRead = async (req, res) => {
  const { id } = req.params;

  console.log("📘 [PATCH /notification/:id/read] Позначення як прочитане:", id);

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
    console.error("❌ [markAsRead] SQL помилка:", error);
    res.status(500).json({ message: "Не вдалося оновити статус прочитаності.", error: error.message });
  }
};

// 💬 Додати коментар
const addCommentToNotification = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  console.log("💬 [PATCH /notification/:id/comment] Додати коментар:", { id, comment });

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
    console.error("❌ [addCommentToNotification] SQL помилка:", error);
    res.status(500).json({ message: "Помилка при додаванні коментаря.", error: error.message });
  }
};

// 🗑 Видалити всі сповіщення користувача
const deleteAllNotifications = async (req, res) => {
  const userId = req.user?.id;

  console.log("🗑 [DELETE /notification/me] Видалити сповіщення для користувача:", userId);

  if (!userId) {
    return res.status(401).json({ message: "Не авторизований користувач." });
  }

  try {
    await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ [deleteAllNotifications] SQL помилка:", error);
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
