const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const { io } = require("../index");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Витяг user_id з JWT
const getUserIdFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("🔐 Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    console.log("🔐 Extracted Token:", token);

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ JWT decoded:", decoded);

    return decoded.user_id ?? decoded.id ?? null;
  } catch (err) {
    console.error("❌ JWT помилка:", err.message);
    return null;
  }
};

// ✅ Отримати всі підписки користувача
const getSubscriptions = async (req, res) => {
  console.log("📥 Запит: getSubscriptions");
  const user_id = getUserIdFromToken(req);

  if (!user_id) {
    console.warn("⚠️ Неавторизований запит до getSubscriptions");
    return res.status(401).json({ error: "Необхідно авторизуватися." });
  }

  const sql = `
    SELECT 
      s.post_id,
      i.title,
      i.description,
      i.status,
      u.first_name AS author_first_name,
      u.last_name AS author_last_name
    FROM subscriptions s
    JOIN ideas i ON s.post_id = i.id
    JOIN users u ON i.user_id = u.id
    WHERE s.user_id = :user_id
  `;

  console.log("🧪 SQL:", sql);
  console.log("🔁 Заміна:", { user_id });

  try {
    const subscriptions = await sequelize.query(sql, {
      replacements: { user_id },
      type: QueryTypes.SELECT,
      logging: console.log,
    });

    console.log("✅ Підписки:", subscriptions);
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
  console.log("📥 Запит: subscribeToEntry", req.body);
  const { post_id } = req.body;
  const user_id = getUserIdFromToken(req);

  if (!user_id) {
    console.warn("⚠️ Неавторизований запит до subscribeToEntry");
    return res.status(401).json({ error: "Необхідно авторизуватися." });
  }

  try {
    await sequelize.query(
      `INSERT INTO subscriptions (user_id, post_id) VALUES (:user_id, :post_id)
       ON CONFLICT DO NOTHING`,
      {
        replacements: { user_id, post_id },
        type: QueryTypes.INSERT,
        logging: console.log,
      }
    );

    console.log("✅ Додано підписку");
    io.emit("subscription_added", {
      user_id,
      post_id,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Підписка додана." });
  } catch (err) {
    console.error("❌ Помилка при підписці:", err);
    res.status(500).json({ error: "Не вдалося підписатися", details: err.message });
  }
};

// ✅ Відписка
const unsubscribeFromEntry = async (req, res) => {
  console.log("📥 Запит: unsubscribeFromEntry", req.body);
  const { post_id } = req.body;
  const user_id = getUserIdFromToken(req);

  if (!user_id) {
    console.warn("⚠️ Неавторизований запит до unsubscribeFromEntry");
    return res.status(401).json({ error: "Необхідно авторизуватися." });
  }

  try {
    await sequelize.query(
      `DELETE FROM subscriptions WHERE user_id = :user_id AND post_id = :post_id`,
      {
        replacements: { user_id, post_id },
        type: QueryTypes.DELETE,
        logging: console.log,
      }
    );

    console.log("✅ Видалено підписку");
    io.emit("subscription_removed", {
      user_id,
      post_id,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Підписка видалена." });
  } catch (err) {
    console.error("❌ Помилка при відписці:", err);
    res.status(500).json({ error: "Не вдалося відписатися", details: err.message });
  }
};

module.exports = {
  getSubscriptions,
  subscribeToEntry,
  unsubscribeFromEntry,
};
