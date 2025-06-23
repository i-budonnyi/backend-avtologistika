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

// ✅ Отримати всі підписки користувача з уточненим CASE-логуванням
const getSubscriptions = async (req, res) => {
  const user_id = getUserIdFromToken(req);
  console.log("🧾 JWT -> user_id:", user_id);

  if (!user_id) {
    console.warn("⚠️ Немає авторизації.");
    return res.status(401).json({ error: "Необхідно авторизуватися." });
  }

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
    LEFT JOIN users u ON u.id = CASE
      WHEN s.post_id IS NOT NULL THEN po.user_id
      WHEN s.blog_id IS NOT NULL THEN b.user_id
      WHEN s.idea_id IS NOT NULL THEN i.user_id
      WHEN s.problem_id IS NOT NULL THEN p.user_id
    END
    WHERE s.user_id = :user_id
    ORDER BY s.updated_at DESC
  `;

  console.log("📥 SQL сформовано. Параметри:", { user_id });
  console.log("📜 SQL:\n", sql);

  try {
    const subscriptions = await sequelize.query(sql, {
      replacements: { user_id },
      type: QueryTypes.SELECT,
      logging: console.log,
    });

    console.log(`✅ Отримано ${subscriptions.length} підписок`);
    if (subscriptions.length > 0) {
      console.log("🧾 Перша:", subscriptions[0]);
    }

    res.status(200).json({ subscriptions });
  } catch (err) {
    console.error("❌ Помилка SQL:", err.message);
    res.status(500).json({
      error: "Помилка при отриманні підписок",
      message: err.message,
    });
  }
};

// ✅ Підписка
const subscribeToEntry = async (req, res) => {
  const { post_id, blog_id, idea_id, problem_id } = req.body;
  const user_id = getUserIdFromToken(req);

  console.log("📥 Запит на підписку:", { post_id, blog_id, idea_id, problem_id });
  console.log("🔐 user_id:", user_id);

  if (!user_id) {
    return res.status(401).json({ error: "Необхідно авторизуватися." });
  }

  const column = post_id
    ? "post_id"
    : blog_id
    ? "blog_id"
    : idea_id
    ? "idea_id"
    : problem_id
    ? "problem_id"
    : null;
  const value = post_id || blog_id || idea_id || problem_id;

  if (!column || !value) {
    console.warn("⚠️ Не вказано ID об'єкта для підписки.");
    return res
      .status(400)
      .json({ error: "Не вказано ID сутності для підписки." });
  }

  try {
    const [result, metadata] = await sequelize.query(
      `INSERT INTO subscriptions (user_id, ${column}) 
       VALUES (:user_id, :value) 
       ON CONFLICT DO NOTHING`,
      {
        replacements: { user_id, value },
        type: QueryTypes.INSERT,
        logging: console.log,
      }
    );

    console.log("✅ INSERT виконано:", result);
    io.emit("subscription_added", {
      user_id,
      entry_id: value,
      column,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "✅ Підписка додана." });
  } catch (err) {
    console.error("❌ Помилка при підписці:", err.message);
    res.status(500).json({
      error: "Не вдалося підписатися",
      details: err.message,
    });
  }
};

// ✅ Відписка
const unsubscribeFromEntry = async (req, res) => {
  const { post_id, blog_id, idea_id, problem_id } = req.body;
  const user_id = getUserIdFromToken(req);

  if (!user_id) {
    return res.status(401).json({ error: "Необхідно авторизуватися." });
  }

  const column = post_id
    ? "post_id"
    : blog_id
    ? "blog_id"
    : idea_id
    ? "idea_id"
    : problem_id
    ? "problem_id"
    : null;
  const value = post_id || blog_id || idea_id || problem_id;

  if (!column || !value) {
    return res
      .status(400)
      .json({ error: "Не вказано ID сутності для відписки." });
  }

  try {
    await sequelize.query(
      `DELETE FROM subscriptions WHERE user_id = :user_id AND ${column} = :value`,
      {
        replacements: { user_id, value },
        type: QueryTypes.DELETE,
        logging: false,
      }
    );

    io.emit("subscription_removed", {
      user_id,
      entry_id: value,
      column,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Підписка видалена." });
  } catch (err) {
    console.error("❌ Помилка при відписці:", err.message);
    res.status(500).json({
      error: "Не вдалося відписатися",
      details: err.message,
    });
  }
};

module.exports = {
  getSubscriptions,
  subscribeToEntry,
  unsubscribeFromEntry,
};
