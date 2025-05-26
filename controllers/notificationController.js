const pool = require("../config/db");

// 🔐 Отримати user_id з JWT або body
const extractUserId = (req) => {
  if (req.user?.id) return req.user.id;
  if (req.body?.user_id) return req.body.user_id;
  return null;
};

// ➕ Створення сповіщення
const createNotification = async (req, res) => {
  const io = req.app.get("io");
  const user_id = extractUserId(req);
  const { message } = req.body;

  if (!user_id || !message) {
    return res.status(400).json({ message: "Потрібен user_id та message." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`,
      [user_id, message]
    );
    const notification = result.rows[0];

    // 🔔 WebSocket
    io.emit(`notification_${user_id}`, notification);
    io.emit("notification_all", notification);

    return res.status(201).json(notification);
  } catch (error) {
    console.error("❌ SQL-помилка (createNotification):", error);
    return res.status(500).json({ message: "Помилка при створенні сповіщення.", error: error.message });
  }
};

// 📥 Отримати сповіщення по конкретному userId (для адміністратора)
const getNotificationsByUserId = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "Не передано user_id в параметрах." });

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ SQL-помилка (getNotificationsByUserId):", error);
    return res.status(500).json({ message: "Помилка при запиті сповіщень за user_id", error: error.message });
  }
};

// 📥 Отримати сповіщення для авторизованого користувача (/notification/me)
const getUserNotifications = async (req, res) => {
  const userId = extractUserId(req);

  console.log("🔎 [getUserNotifications] userId:", userId);

  if (!userId) {
    console.warn("⛔ [getUserNotifications] Користувач не авторизований.");
    return res.status(401).json({ message: "Не авторизований." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    console.log("✅ [getUserNotifications] Сповіщення знайдено:", result.rows.length);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ SQL-помилка (getUserNotifications):", error);
    return res.status(500).json({
      message: "Помилка при отриманні сповіщень.",
      error: error.message,
    });
  }
};


// 🔄 Оновити статус (довільний статус)
const updateNotificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Статус обов’язковий." });
  }

  try {
    const result = await pool.query(
      `UPDATE notifications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Сповіщення не знайдено." });
    }

    return res.status(200).json({ message: "Статус оновлено", data: result.rows[0] });
  } catch (error) {
    console.error("❌ SQL-помилка (updateNotificationStatus):", error);
    return res.status(500).json({ message: "Помилка при оновленні статусу", error: error.message });
  }
};

// ✅ Позначити як прочитане
const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *`,
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Сповіщення не знайдено." });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ SQL-помилка (markAsRead):", error);
    return res.status(500).json({ message: "Помилка при оновленні статусу прочитаності", error: error.message });
  }
};

// 💬 Додати коментар
const addCommentToNotification = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ message: "Коментар обов’язковий." });
  }

  try {
    const result = await pool.query(
      `UPDATE notifications SET comment = $1 WHERE id = $2 RETURNING *`,
      [comment, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Сповіщення не знайдено." });
    }

    return res.status(200).json({ message: "Коментар додано", data: result.rows[0] });
  } catch (error) {
    console.error("❌ SQL-помилка (addCommentToNotification):", error);
    return res.status(500).json({ message: "Помилка при додаванні коментаря", error: error.message });
  }
};

// 🗑 Видалити всі сповіщення поточного користувача
const deleteAllNotifications = async (req, res) => {
  const userId = extractUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Не авторизований." });
  }

  try {
    await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);
    return res.json({ success: true });
  } catch (error) {
    console.error("❌ SQL-помилка (deleteAllNotifications):", error);
    return res.status(500).json({ message: "Помилка при видаленні сповіщень", error: error.message });
  }
};

module.exports = {
  addNotification: createNotification,
  getUserNotifications,
  getNotificationsByUserId,
  updateNotificationStatus,
  markAsRead,
  addCommentToNotification,
  deleteAllNotifications,
};
