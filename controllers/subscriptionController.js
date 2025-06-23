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

// ✅ Отримати всі підписки користувача з деталями (з дебагом)
const getSubscriptions = async (req, res) => {
  const user_id = getUserIdFromToken(req);
  console.log("🧾 Отримано JWT, user_id:", user_id);

  if (!user_id) {
    console.warn("⚠️ Відсутній або некоректний токен авторизації.");
    return res.status(401).json({ error: "Необхідно авторизуватися." });
  }

  const sql = `
  SELECT 
    s.*,
    COALESCE(po.title, b.title, i.title, p.title) AS title,
    COALESCE(po.description, b.description, i.description, p.description) AS description,
    COALESCE(po.status, i.status, p.status, 'N/A') AS status,
    COALESCE(po.user_id, b.user_id, i.user_id, p.user_id) AS author_id,
    u.first_name AS author_first_name,
    u.last_name AS author_last_name
  FROM subscriptions s
  LEFT JOIN posts po ON s.post_id = po.id
  LEFT JOIN blogs b ON s.blog_id = b.id
  LEFT JOIN ideas i ON s.idea_id = i.id
  LEFT JOIN problems p ON s.problem_id = p.id
  LEFT JOIN users u ON u.id = COALESCE(po.user_id, b.user_id, i.user_id, p.user_id)
  WHERE s.user_id = :user_id
    AND (po.id IS NOT NULL OR b.id IS NOT NULL OR i.id IS NOT NULL OR p.id IS NOT NULL)
  ORDER BY s.updated_at DESC
`;


  console.log("📥 SQL-запит до subscriptions з JOIN-ами сформовано.");
  console.log("🔍 SQL:\n", sql);
  console.log("📦 Параметри:", { user_id });

  try {
    const subscriptions = await sequelize.query(sql, {
      replacements: { user_id },
      type: QueryTypes.SELECT,
      logging: console.log, // покаже виконання SQL у консолі
    });

    console.log(`✅ Отримано ${subscriptions.length} підписок для user_id = ${user_id}`);
    console.log("📋 Перша підписка (якщо є):", subscriptions[0] || "Немає даних");

    res.status(200).json({ subscriptions });
  } catch (err) {
    console.error("❌ SQL помилка при отриманні підписок:", err.message);
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
  console.log("🔐 Отримано user_id:", user_id);

  if (!user_id)
    return res.status(401).json({ error: "Необхідно авторизуватися." });

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

  console.log("📌 Визначено колонку для підписки:", column);
  console.log("📌 Значення ID для підписки:", value);

  if (!column || !value)
    return res
      .status(400)
      .json({ error: "Не вказано ID сутності для підписки." });

  try {
    const [result, metadata] = await sequelize.query(
      `INSERT INTO subscriptions (user_id, ${column}) VALUES (:user_id, :value)
       ON CONFLICT DO NOTHING`,
      {
        replacements: { user_id, value },
        type: QueryTypes.INSERT,
        logging: console.log, // 🔍 Покажемо SQL
      }
    );

    console.log("✅ Запит INSERT виконано. Результат:", result, "Метадані:", metadata);

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
  if (!user_id)
    return res.status(401).json({ error: "Необхідно авторизуватися." });

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

  if (!column || !value)
    return res
      .status(400)
      .json({ error: "Не вказано ID сутності для відписки." });

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
