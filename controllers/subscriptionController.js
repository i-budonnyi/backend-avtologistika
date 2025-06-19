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

    return decoded.user_id || decoded.id || null;
  } catch (err) {
    console.error("❌ JWT помилка:", err.message);
    return null;
  }
};

// ✅ Отримати всі підписки користувача
const getSubscriptions = async (req, res) => {
  try {
    console.log("📥 Отримано запит до getSubscriptions");

    const user_id = getUserIdFromToken(req);
    if (!user_id) {
      console.warn("⚠️ Неавторизований запит (user_id не знайдено)");
      return res.status(401).json({ error: "Необхідно авторизуватися." });
    }

    console.log("🔍 Отримуємо підписки для user_id:", user_id);

    const sql = `
      SELECT 
        s.blog_id, s.idea_id, s.problem_id,
        COALESCE(b.title, i.title, p.title) AS title,
        COALESCE(b.description, i.description, p.description) AS description,
        COALESCE(i.status, p.status, 'N/A') AS status,
        CASE 
          WHEN s.blog_id IS NOT NULL THEN 'blog' 
          WHEN s.idea_id IS NOT NULL THEN 'idea' 
          WHEN s.problem_id IS NOT NULL THEN 'problem'
        END AS type,
        COALESCE(b.user_id, i.user_id, p.user_id) AS author_id,
        u.first_name AS author_first_name,
        u.last_name AS author_last_name
      FROM subscriptions s
      LEFT JOIN blog b ON s.blog_id = b.id
      LEFT JOIN ideas i ON s.idea_id = i.id
      LEFT JOIN problems p ON s.problem_id = p.id
      LEFT JOIN users u ON u.id = COALESCE(b.user_id, i.user_id, p.user_id)
      WHERE s.user_id = :user_id
    `;

    console.log("📄 SQL Query to execute:\n", sql);
    console.log("📌 Заміна параметрів:", { user_id });

    const subscriptions = await sequelize.query(sql, {
      replacements: { user_id },
      type: QueryTypes.SELECT,
      logging: console.log, // виводить сирий SQL-запит
    });

    console.log("✅ Отримано підписки:", subscriptions);
    res.status(200).json({ subscriptions });
  } catch (err) {
    console.error("❌ Помилка при отриманні підписок:", {
      error: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      error: "Помилка при отриманні підписок",
      details: err.message,
    });
  }
};

// ✅ Підписатися
const subscribeToEntry = async (req, res) => {
  try {
    console.log("📥 Запит на підписку:", req.body);

    const { entry_id, entry_type } = req.body;
    const user_id = getUserIdFromToken(req);

    if (!user_id) {
      console.warn("⚠️ Неавторизований запит при підписці");
      return res.status(401).json({ error: "Необхідно авторизуватися." });
    }

    const column = entry_type === "blog" ? "blog_id" : entry_type === "idea" ? "idea_id" : "problem_id";

    console.log(`📌 Додаємо підписку: user_id=${user_id}, entry_id=${entry_id}, type=${entry_type}, column=${column}`);

    await sequelize.query(
      `INSERT INTO subscriptions (user_id, ${column}) VALUES (:user_id, :entry_id)
       ON CONFLICT DO NOTHING`,
      {
        replacements: { user_id, entry_id },
        type: QueryTypes.INSERT,
        logging: console.log,
      }
    );

    console.log("✅ Підписка додана до БД");

    io.emit("subscription_added", {
      user_id,
      entry_id,
      entry_type,
      timestamp: new Date(),
    });

    console.log("📡 Відправлено сокет-подію: subscription_added");
    res.status(200).json({ message: "Підписка додана." });
  } catch (err) {
    console.error("❌ Помилка при підписці:", err);
    res.status(500).json({ error: "Не вдалося підписатися", details: err.message });
  }
};

// ✅ Відписатися
const unsubscribeFromEntry = async (req, res) => {
  try {
    console.log("📥 Запит на відписку:", req.body);

    const { entry_id, entry_type } = req.body;
    const user_id = getUserIdFromToken(req);

    if (!user_id) {
      console.warn("⚠️ Неавторизований запит при відписці");
      return res.status(401).json({ error: "Необхідно авторизуватися." });
    }

    const column = entry_type === "blog" ? "blog_id" : entry_type === "idea" ? "idea_id" : "problem_id";

    console.log(`🗑️ Видаляємо підписку: user_id=${user_id}, entry_id=${entry_id}, type=${entry_type}, column=${column}`);

    await sequelize.query(
      `DELETE FROM subscriptions WHERE user_id = :user_id AND ${column} = :entry_id`,
      {
        replacements: { user_id, entry_id },
        type: QueryTypes.DELETE,
        logging: console.log,
      }
    );

    console.log("✅ Підписка видалена з БД");

    io.emit("subscription_removed", {
      user_id,
      entry_id,
      entry_type,
      timestamp: new Date(),
    });

    console.log("📡 Відправлено сокет-подію: subscription_removed");
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
