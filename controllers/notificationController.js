// controllers/notificationController.js
/* eslint-disable camelcase */

const { QueryTypes } = require("sequelize");
const sequelize      = require("../config/db");
const { io }         = require("../index"); // Підключення socket.io

/* ────────────────────────────────────────────────────────── */
/* 📬 1. Створення сповіщення + WebSocket-розсилка            */
/* ────────────────────────────────────────────────────────── */
const createNotification = async ({ userId, message, target = null }) => {
  try {
    const [result] = await sequelize.query(
      `INSERT INTO notifications (user_id, message, target, created_at)
       VALUES (:userId, :message, :target, NOW())
       RETURNING *`,
      {
        replacements: { userId, message, target },
        type: QueryTypes.INSERT,
      }
    );

    const notification = result[0];
    console.log("✅ Створено сповіщення:", notification);

    // 🔔 Відправка через WebSocket
    if (target === "all") {
      io.emit("globalNotification", notification);
    } else {
      io.to(String(userId)).emit("notification", notification);
    }
  } catch (err) {
    console.error("❌ createNotification error:", err.message);
  }
};

/* ────────────────────────────────────────────────────────── */
/* 🔒 2. Отримати сповіщення для конкретного користувача      */
/*    (особисті + глобальні)                                 */
/* ────────────────────────────────────────────────────────── */
const getByUser = async (req, res) => {
  const rawId  = req.params.user_id;
  const userId = Number(rawId);

  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ message: "Невалідний ID користувача" });
  }

  try {
    const notifications = await sequelize.query(
      `SELECT *
         FROM notifications
        WHERE (user_id = :userId OR target = 'all')
        ORDER BY created_at DESC`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    );

    return res.json(notifications);
  } catch (err) {
    console.error("❌ getByUser error:", err.message);
    return res.status(500).json({ message: "Помилка сервера сповіщень" });
  }
};

/* ────────────────────────────────────────────────────────── */
/* 🔍 3. Пошук нових активностей                             */
/* ────────────────────────────────────────────────────────── */
const checkBlogActivityAndNotify = async () => {
  try {
    /* 📝 Нові блоги */
    const blogs = await sequelize.query(
      `SELECT b.id, b.title, b.author_id, u.first_name
         FROM blog b
         JOIN users u ON u.id = b.author_id
        WHERE b.created_at >= NOW() - INTERVAL '1 minute'`,
      { type: QueryTypes.SELECT }
    );

    for (const blog of blogs) {
      const message = `🆕 ${blog.first_name} створив новий блог: "${blog.title}"`;
      await createNotification({ userId: blog.author_id, message, target: "all" });
    }

    /* 💬 Нові коментарі */
    const comments = await sequelize.query(
      `SELECT c.id, c.user_id, u.first_name, c.content
         FROM comments c
         JOIN users u ON u.id = c.user_id
        WHERE c.created_at >= NOW() - INTERVAL '1 minute'`,
      { type: QueryTypes.SELECT }
    );

    for (const comment of comments) {
      const message = `💬 ${comment.first_name} залишив коментар: "${comment.content}"`;
      await createNotification({ userId: comment.user_id, message, target: "all" });
    }

    /* 🔧 Додай сюди перевірки лайків, підписок, проблем за потреби */
  } catch (err) {
    console.error("❌ checkBlogActivityAndNotify error:", err.message);
  }
};

/* ────────────────────────────────────────────────────────── */
/* ⏱ 4. Автоматичний скан кожні 60 секунд                    */
/* ────────────────────────────────────────────────────────── */
setInterval(checkBlogActivityAndNotify, 60_000);

module.exports = {
  createNotification,
  getByUser,
  checkBlogActivityAndNotify,
};
