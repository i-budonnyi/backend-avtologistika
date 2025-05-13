const pool = require("../config/db");

// ➕ Створити сповіщення
const createNotification = async (req, res) => {
  const { user_id, message } = req.body;
  console.log("📥 [POST] Створення сповіщення:", { user_id, message });

  if (!user_id || !message) {
    console.warn("⚠️ Відсутні поля: user_id або message");
    return res.status(400).json({ message: "user_id та message є обов’язковими." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`,
      [user_id, message]
    );
    console.log("✅ Сповіщення створено:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ [createNotification] Помилка:", error);
    res.status(500).json({ message: "Помилка при створенні сповіщення.", error: error.message });
  }
};

// 📥 Отримати всі сповіщення користувача
const getUserNotifications = async (req, res) => {
  const { userId } = req.params;
  console.log("📡 [GET] Запит сповіщень для userId:", userId);

  if (!userId || isNaN(Number(userId))) {
    console.warn("⚠️ Некоректний або відсутній userId:", userId);
    return res.status(400).json({ message: "Некоректний userId." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    if (result.rows.length === 0) {
      console.info(`ℹ️ Немає сповіщень для користувача з ID: ${userId}`);
    } else {
      console.log(`✅ Отримано ${result.rows.length} сповіщень`);
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ [getUserNotifications] Помилка:", error);
    res.status(500).json({ message: "Помилка при отриманні сповіщень.", error: error.message });
  }
};

// ✅ Оновити статус сповіщення
const updateNotificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log("🔄 [PATCH] Оновлення статусу сповіщення:", { id, status });

  if (!status) {
    return res.status(400).json({ message: "Статус є обов’язковим." });
  }

  try {
    const result = await pool.query(
      `UPDATE notifications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      console.warn(`⚠️ Сповіщення з ID ${id} не знайдено`);
      return res.status(404).json({ message: "Сповіщення не знайдено." });
    }

    console.log("✅ Статус оновлено:", result.rows[0]);
    res.status(200).json({ message: "Статус оновлено", data: result.rows[0] });
  } catch (error) {
    console.error("❌ [updateNotificationStatus] Помилка:", error);
    res.status(500).json({ message: "Помилка при оновленні статусу.", error: error.message });
  }
};

// 🔔 Позначити сповіщення як прочитане
const markAsRead = async (req, res) => {
  const { id } = req.params;
  console.log("👁 [PATCH] Позначення як прочитаного сповіщення ID:", id);

  try {
    const result = await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      console.warn(`⚠️ Сповіщення з ID ${id} не знайдено`);
      return res.status(404).json({ message: "Сповіщення не знайдено." });
    }

    console.log("✅ Сповіщення позначено як прочитане:", result.rows[0]);
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
  console.log("✏️ [PATCH] Додавання коментаря до сповіщення:", { id, comment });

  if (!comment) {
    return res.status(400).json({ message: "Коментар є обов’язковим." });
  }

  try {
    const result = await pool.query(
      `UPDATE notifications SET comment = $1 WHERE id = $2 RETURNING *`,
      [comment, id]
    );

    if (result.rowCount === 0) {
      console.warn(`⚠️ Сповіщення з ID ${id} не знайдено`);
      return res.status(404).json({ message: "Сповіщення не знайдено." });
    }

    console.log("✅ Коментар додано:", result.rows[0]);
    res.status(200).json({ message: "Коментар додано.", data: result.rows[0] });
  } catch (error) {
    console.error("❌ [addCommentToNotification] Помилка:", error);
    res.status(500).json({ message: "Помилка при додаванні коментаря.", error: error.message });
  }
};

// 🗑 Видалити всі сповіщення користувача
const deleteAllNotifications = async (req, res) => {
  const { userId } = req.params;
  console.log("🗑 [DELETE] Видалення всіх сповіщень користувача:", userId);

  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ message: "Некоректний userId." });
  }

  try {
    await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);
    console.log(`✅ Видалено всі сповіщення для userId: ${userId}`);
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
