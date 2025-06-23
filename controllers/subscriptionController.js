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

// ✅ Отримати всі підписки користувача (без JOIN)
const getSubscriptions = async (req, res) => {
  const user_id = getUserIdFromToken(req);
  if (!user_id)
    return res.status(401).json({ error: "Необхідно авторизуватися." });

  const sql = `
    SELECT * FROM subscriptions
    WHERE user_id = :user_id
    ORDER BY updated_at DESC
  `;

  try {
    const subscriptions = await sequelize.query(sql, {
      replacements: { user_id },
      type: QueryTypes.SELECT,
    });

    res.status(200).json({ subscriptions });
  } catch (err) {
    console.error("❌ SQL помилка:", err.message);
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
