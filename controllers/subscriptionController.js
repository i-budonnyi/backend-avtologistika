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
console.log("🧪 DEBUG SQL Запит:", sql);
console.log("🔁 Заміна:", { user_id });

try {
  const subscriptions = await sequelize.query(sql, {
    replacements: { user_id },
    type: QueryTypes.SELECT,
    logging: console.log,
  });

  console.log("✅ Отримано підписки:", subscriptions);

  res.status(200).json({ subscriptions });
} catch (err) {
  console.error("❌ ПОМИЛКА SQL:", {
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    error: "Помилка при отриманні підписок",
    message: err.message,
  });
}


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
