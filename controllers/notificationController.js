const pool = require("../config/db");

// 🔐 Отримати user_id з JWT, body, query або params
const extractUserId = (req) => {
  const fromToken = req.user?.id;
  const fromBody = req.body?.user_id;
  const fromQuery = req.query?.user_id;
  const fromParams = req.params?.id;

  const resolved = fromToken || fromBody || fromQuery || fromParams || null;

  console.log("🔍 [extractUserId] Вилучення user_id:", {
    fromToken, fromBody, fromQuery, fromParams, resolved,
  });

  return resolved;
};

// 🔔 Створити сповіщення
const createNotification = async (req, res) => {
  const io = req.app.get("io");
  const { message, target = "user", user_id, idea_id, problem_id } = req.body;

  console.log("📥 [POST /notification] Запит:", { target, message, user_id, idea_id, problem_id });

  if (!message) {
    return res.status(400).json({ message: "Повідомлення обов’язкове." });
  }

  try {
    if (target === "all") {
      const result = await pool.query(
        `INSERT INTO notifications (user_id, message, created_at) VALUES (NULL, $1, CURRENT_TIMESTAMP) RETURNING *`,
        [message]
      );
      io.emit("notification_all", result.rows[0]);
      return res.status(201).json(result.rows[0]);
    }

    if (target === "user" && user_id) {
      const result = await pool.query(
        `INSERT INTO notifications (user_id, message, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *`,
        [user_id, message]
      );
      io.emit(`notification_${user_id}`, result.rows[0]);
      return res.status(201).json(result.rows[0]);
    }

    if (target === "subscribers") {
      let subscribersQuery = "";
      let id = null;

      if (idea_id) {
        id = idea_id;
        subscribersQuery = `SELECT user_id FROM idea_subscriptions WHERE idea_id = $1`;
      } else if (problem_id) {
        id = problem_id;
        subscribersQuery = `SELECT user_id FROM problem_subscriptions WHERE problem_id = $1`;
      }

      if (!subscribersQuery || !id) {
        return res.status(400).json({ message: "Не вказано idea_id або problem_id." });
      }

      const subRes = await pool.query(subscribersQuery, [id]);
      const subscribers = subRes.rows.map(r => r.user_id);
      const notifications = [];

      for (const uid of subscribers) {
        const result = await pool.query(
          `INSERT INTO notifications (user_id, message, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *`,
          [uid, message]
        );
        notifications.push(result.rows[0]);
        io.emit(`notification_${uid}`, result.rows[0]);
      }

      return res.status(201).json({ message: "Надіслано підписникам", notifications });
    }

    return res.status(400).json({ message: "Невірний тип або user_id відсутній" });
  } catch (error) {
    console.error("❌ [CREATE] SQL-помилка:", error.message);
    return res.status(500).json({ message: "Помилка при створенні", error: error.message });
  }
};

// 📩 Отримати всі сповіщення користувача
const getUserNotifications = async (req, res) => {
  const userId = req.user?.id;

  console.log("📥 [GET /notification/me] ->", { userId, token: req.headers.authorization });

  if (!userId) {
    return res.status(401).json({ message: "Не авторизовано (user_id відсутній)." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ [GET /notification/me] SQL:", error.message);
    return res.status(500).json({ message: "Помилка при отриманні", error: error.message });
  }
};

// 📥 Отримати сповіщення по user_id (адміністратор)
const getNotificationsByUserId = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "user_id відсутній у параметрах." });

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ [ADMIN GET] SQL:", error.message);
    return res.status(500).json({ message: "Помилка при запиті", error: error.message });
  }
};

// 🔄 Оновити статус
const updateNotificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "Статус обов’язковий." });

  try {
    const result = await pool.query(
      `UPDATE notifications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (!result.rowCount) return res.status(404).json({ message: "Сповіщення не знайдено." });
    return res.status(200).json({ message: "Статус оновлено", data: result.rows[0] });
  } catch (error) {
    console.error("❌ [STATUS] SQL:", error.message);
    return res.status(500).json({ message: "Помилка при оновленні", error: error.message });
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
    if (!result.rowCount) return res.status(404).json({ message: "Не знайдено." });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ [READ] SQL:", error.message);
    return res.status(500).json({ message: "Помилка", error: error.message });
  }
};

// 💬 Додати коментар
const addCommentToNotification = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ message: "Коментар обов’язковий." });

  try {
    const result = await pool.query(
      `UPDATE notifications SET comment = $1 WHERE id = $2 RETURNING *`,
      [comment, id]
    );
    if (!result.rowCount) return res.status(404).json({ message: "Не знайдено." });
    return res.status(200).json({ message: "Коментар додано", data: result.rows[0] });
  } catch (error) {
    console.error("❌ [COMMENT] SQL:", error.message);
    return res.status(500).json({ message: "Помилка", error: error.message });
  }
};

// 🗑 Видалити всі сповіщення
const deleteAllNotifications = async (req, res) => {
  const userId = extractUserId(req);
  if (!userId) return res.status(401).json({ message: "user_id обов’язковий або неавторизовано." });

  try {
    await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ [DELETE] SQL:", error.message);
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
