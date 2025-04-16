const jwt = require("jsonwebtoken");
const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// 🔹 Функція логування
const log = (level, message, details = {}) => {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] ${message}`);
  if (Object.keys(details).length) {
    console[level](`[DETAILS] ${JSON.stringify(details, null, 2)}`);
  }
};

// ✅ Отримання профілю користувача
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

    log("info", "🔍 Отримання профілю користувача", { user_id: decoded.id });

    // Отримуємо користувача з бази
    const [user] = await sequelize.query(
      `SELECT id, first_name, last_name, email, phone, role FROM users WHERE id = ? LIMIT 1;`,
      { replacements: [decoded.id], type: Sequelize.QueryTypes.SELECT }
    );

    if (!user) {
      log("warn", "❌ Користувача не знайдено", { user_id: decoded.id });
      return res.status(404).json({ message: "Користувач не знайдений" });
    }

    log("info", "✅ Профіль знайдено", { role: user.role });

    // **Перевірка чи користувач є членом журі**
    const [juryMember] = await sequelize.query(
      `SELECT user_id, first_name, last_name FROM jury_members WHERE user_id = ? LIMIT 1;`,
      { replacements: [user.id], type: Sequelize.QueryTypes.SELECT }
    );

    if (juryMember && juryMember.user_id) {
      log("info", "⚖ Користувач - JURY MEMBER, редірект на /jury", { user_id: user.id });
      return res.status(200).json({
        id: user.id,
        first_name: juryMember.first_name,
        last_name: juryMember.last_name,
        email: user.email,
        phone: user.phone,
        role: "jury_member",
        redirect: "/jury",
      });
    }

    // **Перевірка інших ролей**
    const role = user.role ? user.role.toLowerCase().replace(" ", "_") : "worker";

    if (role === "ambassador") {
      log("info", "🎖 Користувач - AMBASSADOR, редірект на /ambassadors", { user_id: user.id });
      return res.status(200).json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: "ambassador",
        redirect: "/ambassadors",
      });
    }

    if (role === "jury_secretary") {
      log("info", "📜 Користувач - JURY SECRETARY, редірект на /jury-secretary", { user_id: user.id });
      return res.status(200).json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: "jury_secretary",
        redirect: "/jury-secretary",
      });
    }

    if (role === "project_manager") {
      log("info", "📂 Користувач - PROJECT MANAGER, редірект на /project-manager", { user_id: user.id });
      return res.status(200).json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: "project_manager",
        redirect: "/project-manager",
      });
    }

    log("info", "🛠 Користувач не є амбасадором, членом журі, секретарем журі або PM. Призначаємо 'worker'", { 
      user_id: user.id, 
      assigned_role: "worker"
    });

    return res.status(200).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      role: "worker",
      redirect: "/worker",
    });
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

// **Експортуємо контролери**
module.exports = {
  getUserProfile,
  logout,
};
