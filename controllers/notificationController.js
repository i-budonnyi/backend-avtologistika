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

  console.log("📥 [POST /notification] Запит на створення сповіщення");
  console.log("🧾 Headers:", req.headers);
  console.log("👤 Payload:", req.user);
  console.log("📦 Body:", req.body);

  if (!user_id || !message) {
    console.warn("⚠️ Не вистачає обов'язкових полів: user_id або message");
    return res.status(400).json({ message: "Потрібен user_id та message." });
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
    console.error("❌ Помилка SQL:", error);
    res.status(500).json({ message: "Помилка при створенні сповіщення.", error: error.message });
  }
};

// 📥 Сповіщення для авторизованого користувача (/me)
const getUserNotifications = async (req, res) => {
  const userId = req.user?.id;

  console.log("📥 [GET /notification/me] Отримання сповіщень користувача");
  console.log("👤 Payload:", req.user);

  if (!userId) {
    return res.status(401).json({ message: "Не авторизований." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    console.log(`✅ Знайдено ${result.rowCount} сповіщень`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ SQL-помилка:", error);
    res.status(500).json({ message: "Помилка при отриманні сповіщень.", error: error.message });
  }
};

// 📩 Сповіщення за ID користувача (з фронтенду /user/:id)
const getNotificationsByUserId = async (req, res) => {
  const { id } = req.params;

  console.log("📥 [GET /notification/user/:id] Отримання за user_id:", id);

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    console.log(`✅ Знайдено ${result.rowCount} сповіщень`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ SQL-помилка:", error);
    res.status(500).json({ message: "Помилка при запиті сповіщень за user_id", error: error.message });
  }
};

// 🔄 Оновлення статусу
const updateNotificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log("🔄 [PATCH /notification/:id/status] Оновлення статусу", { id, status });

  if (!status) return res.status(400).json({ message: "Статус обов’язковий." });

  try {
    const result = await pool.query(
      `UPDATE notifications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (!result.rowCount) return res.status(404).json({ message: "Сповіщення не знайдено." });

    res.status(200).json({ message: "Статус оновлено", data: result.rows[0] });
  } catch (error) {
    console.error("❌ SQL-помилка:", error);
    res.status(500).json({ message: "Помилка при оновленні статусу", error: error.message });
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

    if (!result.rowCount) return res.status(404).json({ message: "Не знайдено." });

    res.json({ success: true });
  } catch (error) {
    console.error("❌ SQL-помилка:", error);
    res.status(500).json({ message: "Помилка при оновленні статусу прочитаності", error: error.message });
  }
};

// 💬 Додати коментар
const addCommentToNotification = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  console.log("💬 [PATCH /notification/:id/comment] Додавання коментаря:", { id, comment });

  if (!comment) return res.status(400).json({ message: "Коментар обов’язковий." });

  try {
    const result = await pool.query(
      `UPDATE notifications SET comment = $1 WHERE id = $2 RETURNING *`,
      [comment, id]
    );

    if (!result.rowCount) return res.status(404).json({ message: "Не знайдено." });

    res.status(200).json({ message: "Коментар додано", data: result.rows[0] });
  } catch (error) {
    console.error("❌ SQL-помилка:", error);
    res.status(500).json({ message: "Помилка при додаванні коментаря", error: error.message });
  }
};

// 🗑 Видалити всі сповіщення користувача
const deleteAllNotifications = async (req, res) => {
  const userId = req.user?.id;
  console.log("🗑 [DELETE /notification/me] Видалення всіх сповіщень для:", userId);

  if (!userId) return res.status(401).json({ message: "Не авторизований." });

  try {
    await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ SQL-помилка:", error);
    res.status(500).json({ message: "Помилка при видаленні сповіщень", error: error.message });
  }
};

// Експорт
module.exports = {
  addNotification: createNotification,
  getUserNotifications,
  getNotificationsByUserId,
  updateNotificationStatus,
  markAsRead,
  addCommentToNotification,
  deleteAllNotifications,
};
