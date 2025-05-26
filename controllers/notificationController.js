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

  console.log("🔔 [CREATE] Запит на створення сповіщення:", {
    headers: req.headers,
    body: req.body,
    userFromToken: req.user,
    resolvedUserId: user_id,
  });

  if (!user_id || !message) {
    const msg = "Потрібен user_id та message.";
    console.warn("⚠️", msg);
    return res.status(400).json({
      message: msg,
      debug: { user_id, message, user: req.user },
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`,
      [user_id, message]
    );

    const notification = result.rows[0];
    console.log("✅ [CREATE] Створено сповіщення:", notification);

    io.emit(`notification_${user_id}`, notification);
    io.emit("notification_all", notification);

    return res.status(201).json(notification);
  } catch (error) {
    console.error("❌ [CREATE] SQL-помилка:", error);
    return res.status(500).json({
      message: "Помилка при створенні сповіщення.",
      error: error.message,
    });
  }
};

// 📥 Отримати сповіщення авторизованого користувача
const getUserNotifications = async (req, res) => {
  const userId = extractUserId(req);

  console.log("📥 [ME] Отримання сповіщень:", {
    headers: req.headers,
    userFromToken: req.user,
    resolvedUserId: userId,
  });

  if (!userId) {
    const msg = "Користувач не авторизований.";
    console.warn("⛔", msg);
    return res.status(401).json({
      message: msg,
      debug: { user: req.user },
    });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    console.log("✅ [ME] Знайдено сповіщень:", result.rows.length);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ [ME] SQL-помилка:", error);
    return res.status(500).json({
      message: "Помилка при отриманні сповіщень.",
      error: error.message,
    });
  }
};

// 📥 Отримати сповіщення іншого користувача (для адміна)
const getNotificationsByUserId = async (req, res) => {
  const { id } = req.params;

  console.log("📥 [ADMIN] Запит сповіщень для user_id:", id);

  if (!id) return res.status(400).json({ message: "Не передано user_id." });

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ [ADMIN] SQL-помилка:", error);
    return res.status(500).json({
      message: "Помилка при запиті сповіщень.",
      error: error.message,
    });
  }
};

// 🔄 Оновити статус
const updateNotificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log("🔄 [STATUS] Оновлення статусу:", { id, status });

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

    return res.status(200).json({
      message: "Статус оновлено",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ [STATUS] SQL-помилка:", error);
    return res.status(500).json({ message: "Помилка при оновленні статусу", error: error.message });
  }
};

// ✅ Позначити як прочитане
const markAsRead = async (req, res) => {
  const { id } = req.params;
  console.log("📘 [READ] Позначити як прочитане:", id);

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
    console.error("❌ [READ] SQL-помилка:", error);
    return res.status(500).json({ message: "Помилка при оновленні статусу прочитаності", error: error.message });
  }
};

// 💬 Додати коментар
const addCommentToNotification = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  console.log("💬 [COMMENT] Додавання коментаря:", { id, comment });

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
    console.error("❌ [COMMENT] SQL-помилка:", error);
    return res.status(500).json({ message: "Помилка при додаванні коментаря", error: error.message });
  }
};

// 🗑 Видалити всі сповіщення для поточного користувача
const deleteAllNotifications = async (req, res) => {
  const userId = extractUserId(req);

  console.log("🗑 [DELETE] Видалення сповіщень:", {
    headers: req.headers,
    resolvedUserId: userId,
    userFromToken: req.user,
  });

  if (!userId) {
    return res.status(401).json({
      message: "Не авторизований.",
      debug: { user: req.user },
    });
  }

  try {
    await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);
    return res.json({ success: true });
  } catch (error) {
    console.error("❌ [DELETE] SQL-помилка:", error);
    return res.status(500).json({ message: "Помилка при видаленні", error: error.message });
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
