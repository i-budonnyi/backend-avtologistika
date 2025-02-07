const jwt = require("jsonwebtoken");
const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Логування для діагностики
const log = (level, message, details = {}) => {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] ${message}`);
  if (Object.keys(details).length) {
    console[level](`[DETAILS] ${JSON.stringify(details, null, 2)}`);
  }
};

// ✅ Отримання профілю користувача з токена
const getUserProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      log("warn", "❌ Токен відсутній", { ip: req.ip });
      return res.status(401).json({ message: "Токен відсутній. Доступ заборонено." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.id) {
      log("error", "❌ ID користувача не знайдено в токені", { token });
      return res.status(400).json({ message: "ID користувача не знайдено в токені" });
    }

    log("info", "🔍 Отримання повного профілю користувача", { user_id: decoded.id });

    const [user] = await sequelize.query(
      `SELECT id, first_name, last_name, email, phone FROM users WHERE id = ? LIMIT 1;`,
      { replacements: [decoded.id], type: Sequelize.QueryTypes.SELECT }
    );

    if (!user) {
      log("warn", "❌ Користувача не знайдено", { user_id: decoded.id });
      return res.status(404).json({ message: "Користувач не знайдений" });
    }

    log("info", "✅ Профіль знайдено", user);

    return res.status(200).json(user);
  } catch (error) {
    log("error", "❌ Помилка отримання профілю", { message: error.message });
    return res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

// ✅ Вихід користувача
const logout = (req, res) => {
  log("info", "🔒 Вихід користувача", { ip: req.ip });
  return res.status(200).json({ message: "Вихід успішний" });
};

// **Виправлення експорту (правильний варіант)**
module.exports = {
  getUserProfile,
  logout,
};
