// controllers/notificationController.js

const { QueryTypes } = require("sequelize");
const sequelize      = require("../config/db");
const { io }         = require("../index"); // Підключення до socket.io

// 📬 Створення сповіщення в базі та надсилання через сокет
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
      io.to(`${userId}`).emit("notification", notification);
    }
  } catch (err) {
    console.error("❌ createNotification error:", err.message);
  }
};

// 🔍 Пошук нових активностей (блогів, коментарів тощо)
const checkBlogActivityAndNotify = async () => {
  try {
    // 📝 Нові блоги
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

    // 💬 Нові коментарі
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

    // 🛠 Можна розширити аналогічно на лайки, підписки, проблеми...

  } catch (err) {
    console.error("❌ checkBlogActivityAndNotify error:", err.message);
  }
};

// ⏱ Запуск перевірки кожні 60 секунд
setInterval(checkBlogActivityAndNotify, 60_000);

module.exports = {
  createNotification,
  checkBlogActivityAndNotify,
};
