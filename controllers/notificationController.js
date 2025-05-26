const pool = require("../config/db");

// 🔐 Отримати user_id з JWT, body, query або params
const extractUserId = (req) => {
  const fromToken = req.user?.id;
  const fromBody = req.body?.user_id;
  const fromQuery = req.query?.user_id;
  const fromParams = req.params?.id;

  const resolved = fromToken || fromBody || fromQuery || fromParams || null;

  console.log("🔍 [extractUserId] Вилучення user_id:", {
    fromToken,
    fromBody,
    fromQuery,
    fromParams,
    resolved,
  });

  return resolved;
};

// 🔔 Створити сповіщення
const createNotification = async (req, res) => {
  const io = req.app.get("io");
  const user_id = extractUserId(req);
  const { message } = req.body;

  console.log("📥 [POST /notification] Створення:", {
    headers: req.headers,
    body: req.body,
    userFromToken: req.user,
    resolvedUserId: user_id,
  });

  if (!user_id || !message) {
    return res.status(400).json({
      message: "❗ Потрібен user_id та message.",
      debug: { user_id, message, user: req.user },
      fix: "Передай user_id через JWT, body, query або params.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`,
      [user_id, message]
    );

    const notification = result.rows[0];
    io.emit(`notification_${user_id}`, notification);
    io.emit("notification_all", notification);

    return res.status(201).json(notification);
  } catch (error) {
    console.error("❌ [CREATE] SQL-помилка:", error);
    return res.status(500).json({ message: "Помилка при створенні", error: error.message });
  }
};

// 📩 Отримати всі сповіщення користувача
const getUserNotifications = async (req, res) => {
  const userId = extractUserId(req);

  console.log("📥 [GET /notification/me] Запит:", {
    headers: req.headers,
    userFromToken: req.user,
    resolvedUserId: userId,
  });

  if (!userId) {
    return res.status(401).json({
      message: "Користувач не авторизований.",
      debug: { user: req.user },
      fix: "JWT має містити id або надішли user_id в query/body.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ [GET /notification/me] SQL-помилка:", error);
    return res.status(500).json({ message: "Помилка при запиті", error: error.message });
  }
};

// 📥 Отримати сповіщення по user_id (адміністратор)
const getNotificationsByUserId = async (req, res) => {
  const { id } = req.params;

  console.log("📥 [GET /notification/user/:id] Запит:", { id });

  if (!id) {
    return res.status(400).json({
      message: "user_id в параметрах відсутній.",
      fix: "Перевір URL: /notification/user/:id",
    });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ [ADMIN] SQL-помилка:", error);
    return res.status(500).json({ message: "Помилка при запиті", error: error.message });
  }
};

// 🔄 Оновити статус сповіщення
const updateNotificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log("🔄 [PATCH /notification/:id/status] Запит:", { id, status });

  if (!status) {
    return res.status(400).json({
      message: "Статус обов’язковий.",
      fix: "Надішли status у body (напр. { status: 'approved' })",
    });
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
    console.error("❌ [STATUS] SQL-помилка:", error);
    return res.status(500).json({ message: "Помилка при оновленні", error: error.message });
  }
};

// ✅ Позначити як прочитане
const markAsRead = async (req, res) => {
  const { id } = req.params;

  console.log("📘 [PATCH /notification/:id/read] Запит:", { id });

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
    return res.status(500).json({ message: "Помилка при оновленні", error: error.message });
  }
};

// 💬 Додати коментар до сповіщення
const addCommentToNotification = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  console.log("💬 [PATCH /notification/:id/comment] Запит:", { id, comment });

  if (!comment) {
    return res.status(400).json({
      message: "Коментар обов’язковий.",
      fix: "Додай у body: { comment: '...' }",
    });
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
    return res.status(500).json({ message: "Помилка при оновленні", error: error.message });
  }
};

// 🗑 Видалити всі сповіщення користувача
const deleteAllNotifications = async (req, res) => {
  const userId = extractUserId(req);

  console.log("🗑 [DELETE /notification/me] Запит:", {
    headers: req.headers,
    resolvedUserId: userId,
    userFromToken: req.user,
  });

  if (!userId) {
    return res.status(401).json({
      message: "Не авторизований.",
      debug: { user: req.user },
      fix: "JWT має містити user_id або передай явно.",
    });
  }

  try {
    await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);
    return res.status(200).json({ success: true });
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
