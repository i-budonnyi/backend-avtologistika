const pool = require("../config/db");

// 🔐 Перевірка токена (опційно)
const extractUserId = (req) => {
  if (req.user?.id) return req.user.id;
  if (req.body?.user_id) return req.body.user_id;
  return null;
};

// ➕ Створити сповіщення з WebSocket
const createNotification = async (req, res) => {
  const io = req.app.get("io");
  const user_id = extractUserId(req);
  const message = req.body.message;

  console.log("📥 [POST /notification] Створення сповіщення:");
  console.log("🔐 Headers:", req.headers);
  console.log("👤 req.user:", req.user);
  console.log("📦 body:", req.body);

  if (!user_id || !message) {
    console.warn("⚠️ Відсутній user_id або message");
    return res.status(400).json({ message: "user_id та message є обов’язковими." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`,
      [user_id, message]
    );
    const notification = result.rows[0];

    console.log("✅ Створено сповіщення:", notification);

    io.emit(`notification_${user_id}`, notification);
    io.emit("notification_all", notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error("❌ SQL помилка при створенні:", error);
    res.status(500).json({ message: "Помилка при створенні сповіщення.", error: error.message });
  }
};

// 📥 Отримати сповіщення поточного користувача
const getUserNotifications = async (req, res) => {
  const userId = req.user?.id;

  console.log("📥 [GET /notification/me] Отримання сповіщень:");
  console.log("🔐 Headers:", req.headers);
  console.log("👤 req.user:", req.user);

  if (!userId) {
    console.warn("❌ Не авторизований користувач");
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
    console.error("❌ SQL помилка при отриманні:", error);
    res.status(500).json({ message: "Помилка при отриманні сповіщень.", error: error.message });
  }
};

// 📩 Отримати сповіщення за конкретним user_id (з фронту)
const getNotificationsByUserId = async (req, res) => {
  const { id } = req.params;

  console.log("📥 [GET /notification/user/:id] Отримання сповіщень за ID користувача:", id);

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    if (result.rowCount === 0) {
      console.log(`ℹ️ Для user_id ${id} не знайдено жодного сповіщення`);
    } else {
      console.log(`✅ Знайдено ${result.rows.length} сповіщень для user_id ${id}`);
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ SQL помилка при отриманні по ID:", error);
    res.status(500).json({ message: "Помилка при отриманні сповіщень.", error: error.message });
  }
};

// ✅ Оновити статус сповіщення
const updateNotificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log("🔄 [PATCH /notification/:id/status] Оновлення статусу:", { id, status });

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
    console.error("❌ SQL помилка при оновленні:", error);
    res.status(500).json({ message: "Помилка при оновленні статусу.", error: error.message });
  }
};

// ✅ Позначити як прочитане
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
    console.error("❌ SQL помилка при оновленні прочитаності:", error);
    res.status(500).json({ message: "Не вдалося оновити статус прочитаності.", error: error.message });
  }
};

// 💬 Додати коментар до сповіщення
const addCommentToNotification = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  console.log("💬 [PATCH /notification/:id/comment] Додавання коментаря:", { id, comment });

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
    console.error("❌ SQL помилка при коментуванні:", error);
    res.status(500).json({ message: "Помилка при додаванні коментаря.", error: error.message });
  }
};

// 🗑 Видалити всі сповіщення користувача
const deleteAllNotifications = async (req, res) => {
  const userId = req.user?.id;

  console.log("🗑 [DELETE /notification/me] Видалення сповіщень користувача:", userId);

  if (!userId) {
    return res.status(401).json({ message: "Не авторизований користувач." });
  }

  try {
    await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ SQL помилка при видаленні:", error);
    res.status(500).json({ message: "Помилка при видаленні сповіщень.", error: error.message });
  }
};

module.exports = {
  addNotification: createNotification,
  getUserNotifications,
  getNotificationsByUserId, // ⬅️ додано окремо для /user/:id
  updateNotificationStatus,
  markAsRead,
  addCommentToNotification,
  deleteAllNotifications,
};
