const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const { io } = require("../index");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Витяг user_id з JWT
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

// ✅ Отримати всі підписки користувача
const getSubscriptions = async (req, res) => {
  const user_id = getUserIdFromToken(req);
  if (!user_id) return res.status(401).json({ error: "Необхідно авторизуватися." });

  const sql = `
    SELECT 
      s.*,
      CASE
        WHEN s.post_id IS NOT NULL THEN po.title
        WHEN s.blog_id IS NOT NULL THEN b.title
        WHEN s.idea_id IS NOT NULL THEN i.title
        WHEN s.problem_id IS NOT NULL THEN p.title
        ELSE 'Без назви'
      END AS title,
      CASE
        WHEN s.post_id IS NOT NULL THEN po.description
        WHEN s.blog_id IS NOT NULL THEN b.description
        WHEN s.idea_id IS NOT NULL THEN i.description
        WHEN s.problem_id IS NOT NULL THEN p.description
        ELSE 'Без опису'
      END AS description,
      CASE
        WHEN s.post_id IS NOT NULL THEN po.status
        WHEN s.idea_id IS NOT NULL THEN i.status
        WHEN s.problem_id IS NOT NULL THEN p.status
        ELSE 'N/A'
      END AS status,
      CASE
        WHEN s.post_id IS NOT NULL THEN po.user_id
        WHEN s.blog_id IS NOT NULL THEN b.user_id
        WHEN s.idea_id IS NOT NULL THEN i.user_id
        WHEN s.problem_id IS NOT NULL THEN p.user_id
      END AS author_id,
      u.first_name AS author_first_name,
      u.last_name AS author_last_name
    FROM subscriptions s
    LEFT JOIN posts po ON s.post_id = po.id
    LEFT JOIN blogs b ON s.blog_id = b.id
    LEFT JOIN ideas i ON s.idea_id = i.id
    LEFT JOIN problems p ON s.problem_id = p.id
    LEFT JOIN users u ON u.id = COALESCE(po.user_id, b.user_id, i.user_id, p.user_id)
    WHERE s.user_id = :user_id
    ORDER BY s.updated_at DESC;
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

// ✅ Підписка
const subscribeToEntry = async (req, res) => {
  const user_id = getUserIdFromToken(req);
  if (!user_id) return res.status(401).json({ error: "Необхідно авторизуватися." });

  const { entry_id, entry_type } = req.body;

  if (!entry_id || !entry_type) {
    return res.status(400).json({ error: "Не вказано ID або тип сутності для підписки." });
  }

  const columnMap = {
    blog: "blog_id",
    idea: "idea_id",
    problem: "problem_id",
    post: "post_id",
  };

  const tableMap = {
    blog: "blogs",
    idea: "ideas",
    problem: "problems",
    post: "posts",
  };

  const column = columnMap[entry_type];
  const table = tableMap[entry_type];

  if (!column || !table) {
    return res.status(400).json({ error: "Невідомий тип сутності." });
  }

  try {
    const results = await sequelize.query(
      `SELECT title, description FROM ${table} WHERE id = :id LIMIT 1`,
      {
        replacements: { id: entry_id },
        type: QueryTypes.SELECT,
      }
    );

    const entry = results[0];

    if (!entry || (!entry.title && !entry.description)) {
      return res.status(400).json({ error: "Неможливо підписатись — об'єкт не має назви або опису." });
    }

    await sequelize.query(
      `INSERT INTO subscriptions (user_id, ${column}) 
       VALUES (:user_id, :entry_id) 
       ON CONFLICT DO NOTHING`,
      {
        replacements: { user_id, entry_id },
        type: QueryTypes.INSERT,
      }
    );

    io.emit("subscription_added", {
      user_id,
      entry_id,
      entry_type,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "✅ Підписка додана." });
  } catch (err) {
    console.error("❌ Помилка підписки:", err.message);
    res.status(500).json({ error: "Не вдалося підписатися", details: err.message });
  }
};

// ✅ Відписка
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

    io.emit("subscription_removed", {
      user_id,
      entry_id,
      entry_type,
      timestamp: new Date(),
    });

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
