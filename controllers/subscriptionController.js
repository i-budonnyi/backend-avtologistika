const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");

let io;
try {
  const shared = require("../index");
  io = shared.io;
} catch (err) {
  console.warn("⚠️ Socket.io не ініціалізовано (без WebSocket)");
}

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const getUserIdFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.user_id ?? decoded.id ?? null;
  } catch (err) {
    console.error("❌ JWT помилка:", err.message);
    return null;
  }
};

const getSubscriptions = async (req, res) => {
  const user_id = getUserIdFromToken(req);
  if (!user_id) return res.status(401).json({ error: "Необхідно авторизуватися." });

  const sql = `
    SELECT s.id AS subscription_id, s.blog_id AS entry_id, 'blog' AS entry_type, 
           b.title, b.description, b.status, b.created_at,
           u.id AS author_id, u.first_name, u.last_name
    FROM subscriptions s
    JOIN blog b ON s.blog_id = b.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE s.user_id = :user_id AND s.blog_id IS NOT NULL

    UNION ALL

    SELECT s.id, s.idea_id, 'idea', 
           i.title, i.description, i.status, i.created_at,
           u.id, u.first_name, u.last_name
    FROM subscriptions s
    JOIN ideas i ON s.idea_id = i.id
    LEFT JOIN users u ON i.user_id = u.id
    WHERE s.user_id = :user_id AND s.idea_id IS NOT NULL

    UNION ALL

    SELECT s.id, s.problem_id, 'problem', 
           p.title, p.description, p.status, p.created_at,
           u.id, u.first_name, u.last_name
    FROM subscriptions s
    JOIN problems p ON s.problem_id = p.id
    LEFT JOIN users u ON p.user_id = u.id
    WHERE s.user_id = :user_id AND s.problem_id IS NOT NULL

    UNION ALL

    SELECT s.id, s.post_id, 'post', 
           po.title, po.description, po.status, po.created_at,
           u.id, u.first_name, u.last_name
    FROM subscriptions s
    JOIN posts po ON s.post_id = po.id
    LEFT JOIN users u ON po.user_id = u.id
    WHERE s.user_id = :user_id AND s.post_id IS NOT NULL

    ORDER BY created_at DESC
  `;

  try {
    const subscriptions = await sequelize.query(sql, {
      replacements: { user_id },
      type: QueryTypes.SELECT,
    });
    res.status(200).json(subscriptions);
  } catch (err) {
    console.error("❌ SQL помилка:", err.message);
    res.status(500).json({ error: "Помилка при отриманні підписок", details: err.message });
  }
};

const subscribeToEntry = async (req, res) => {
  const user_id = getUserIdFromToken(req);
  if (!user_id) return res.status(401).json({ error: "Необхідно авторизуватися." });

  const { entry_id, entry_type } = req.body;

  const columnMap = {
    blog: "blog_id",
    idea: "idea_id",
    problem: "problem_id",
    post: "post_id",
  };

  const tableMap = {
    blog: "blog",
    idea: "ideas",
    problem: "problems",
    post: "posts",
  };

  const column = columnMap[entry_type];
  const table = tableMap[entry_type];

  if (!column || !table || !entry_id) {
    return res.status(400).json({ error: "Некоректні тип або ID сутності." });
  }

  try {
    const checkSql = `SELECT id FROM ${table} WHERE id = :entry_id LIMIT 1`;
    const result = await sequelize.query(checkSql, {
      replacements: { entry_id },
      type: QueryTypes.SELECT,
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ error: `Немає відповідного запису у ${table} з ID ${entry_id}` });
    }

    const insertSql = `
      INSERT INTO subscriptions (user_id, ${column})
      VALUES (:user_id, :entry_id)
      ON CONFLICT DO NOTHING
    `;
    await sequelize.query(insertSql, {
      replacements: { user_id, entry_id },
      type: QueryTypes.INSERT,
    });

    if (io) {
      io.emit("subscription_added", {
        user_id,
        entry_id,
        entry_type,
        timestamp: new Date(),
      });
    }

    res.status(200).json({ message: `✅ Підписка додана до ${entry_type}.` });
  } catch (err) {
    console.error("❌ Помилка підписки:", err.message);
    res.status(500).json({ error: "Не вдалося підписатися", details: err.message });
  }
};

const unsubscribeFromEntry = async (req, res) => {
  const user_id = getUserIdFromToken(req);
  if (!user_id) return res.status(401).json({ error: "Необхідно авторизуватися." });

  const { entry_id, entry_type } = req.body;

  const columnMap = {
    blog: "blog_id",
    idea: "idea_id",
    problem: "problem_id",
    post: "post_id",
  };

  const column = columnMap[entry_type];

  if (!column || !entry_id) {
    return res.status(400).json({ error: "Не вказано ID або тип сутності для відписки." });
  }

  try {
    await sequelize.query(
      `DELETE FROM subscriptions WHERE user_id = :user_id AND ${column} = :entry_id`,
      {
        replacements: { user_id, entry_id },
        type: QueryTypes.DELETE,
      }
    );

    if (io) {
      io.emit("subscription_removed", {
        user_id,
        entry_id,
        entry_type,
        timestamp: new Date(),
      });
    }

    res.status(200).json({ message: "Підписка видалена." });
  } catch (err) {
    console.error("❌ Помилка при відписці:", err.message);
    res.status(500).json({ error: "Не вдалося відписатися", details: err.message });
  }
};

module.exports = {
  getSubscriptions,
  subscribeToEntry,
  unsubscribeFromEntry,
};
