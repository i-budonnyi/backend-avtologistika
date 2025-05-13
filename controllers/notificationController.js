const pool = require("../config/db");

// ➕ Створити сповіщення
const createNotification = async (req, res) => {
  const { user_id, message } = req.body;
  console.log("📥 [POST] Створення сповіщення:", { user_id, message });

  if (!user_id || !message) {
    console.warn("⚠️ Відсутні обов’язкові поля user_id або message");
    return res.status(400).json({ message: "user_id та message є обов’язковими." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`,
      [user_id, message]
    );
    console.log("✅ Створено сповіщення:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ createNotification:", error);
    res.status(500).json({ message: "Помилка при створенні сповіщення.", error: error.message });
  }
};

// 📥 Отримати всі сповіщення користувача
const getUserNotifications = async (req, res) => {
  const { userId } = req.params;
  console.log("📡 [GET] Отримання сповіщень для userId:", userId);

  if (!userId) {
    console.warn("⚠️ userId не передано у params");
    return res.status(400).json({ message: "Не вказано userId." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    console.log(`✅ Отримано ${result.rows.length} сповіщень для користувача ${userId}`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ getUserNotifications:", error);
    res.status(500).json({ message: "Помилка сервера при отриманні сповіщень.", error: error.message });
  }
};

// ✅ Оновити статус сповіщення
const updateNotificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log("🔧 [PATCH] Оновлення статусу сповіщення:", { id, status });

  if (!status) {
    console.warn("⚠️ Відсутній статус у запиті");
    return res.status(400).json({ message: "Статус є обов’язковим." });
  }

  try {
    await pool.query(`UPDATE notifications SET status = $1 WHERE id = $2`, [status, id]);
    console.log(`✅ Статус оновлено для сповіщення ID ${id} на '${status}'`);
    res.status(200).json({ message: "Статус оновлено.", id, status });
  } catch (error) {
    console.error("❌ updateNotificationStatus:", error);
    res.status(500).json({ message: "Помилка при оновленні статусу.", error: error.message });
  }
};

// 🔔 Позначити сповіщення як прочитане
const markAsRead = async (req, res) => {
  const { id } = req.params;
  console.log("👁 [PATCH] Позначити прочитаним сповіщення ID:", id);

  try {
    await pool.query(`UPDATE notifications SET is_read = true WHERE id = $1`, [id]);
    console.log(`✅ Сповіщення ID ${id} позначено як прочитане`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ markAsRead:", error);
    res.status(500).json({ message: "Не вдалося оновити статус прочитаності", error: error.message });
  }
};

// 💬 Додати коментар до сповіщення
const addCommentToNotification = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  console.log("✏️ [PATCH] Додавання коментаря:", { id, comment });

  if (!comment) {
    console.warn("⚠️ Коментар не вказано");
    return res.status(400).json({ message: "Коментар є обов’язковим." });
  }

  try {
    await pool.query(`UPDATE notifications SET comment = $1 WHERE id = $2`, [comment, id]);
    console.log(`✅ Коментар додано до сповіщення ID ${id}`);
    res.status(200).json({ message: "Коментар додано.", id, comment });
  } catch (error) {
    console.error("❌ addCommentToNotification:", error);
    res.status(500).json({ message: "Помилка при додаванні коментаря", error: error.message });
  }
};

// 🗑 Видалити всі сповіщення користувача
const deleteAllNotifications = async (req, res) => {
  const { userId } = req.params;
  console.log("🗑 [DELETE] Видалення всіх сповіщень користувача:", userId);

  if (!userId) {
    return res.status(400).json({ message: "userId є обов’язковим для видалення." });
  }

  try {
    await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);
    console.log(`✅ Усі сповіщення користувача ${userId} видалено`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ deleteAllNotifications:", error);
    res.status(500).json({ message: "Не вдалося видалити сповіщення", error: error.message });
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
