const { QueryTypes } = require("sequelize");
const sequelize      = require("../config/db");
const { io }         = require("../index"); // Підключення до socket.io

// Функція створення сповіщення в БД
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

    // Надсилаємо через WebSocket
    if (target === "all") {
      io.emit("globalNotification", notification);
    } else {
      io.to(`${userId}`).emit("notification", notification);
    }
  } catch (err) {
    console.error("❌ createNotification error:", err.message);
  }
};

// Перевірка нових активностей
const checkBlogActivityAndNotify = async () => {
  try {
    // Приклад: знайти всі нові блоги, створені за останні 60 секунд
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

    // Аналогічно для коментарів:
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

    // І так далі для лайків, підписок, проблем тощо...

  } catch (err) {
    console.error("❌ checkBlogActivityAndNotify error:", err.message);
  }
};

// Запускаємо цикл перевірки кожні 60 сек
setInterval(checkBlogActivityAndNotify, 60_000);
