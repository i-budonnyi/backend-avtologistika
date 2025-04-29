const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// 🔐 Генерація JWT токена
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
    },
    JWT_SECRET,
    { expiresIn: "5h" }
  );
};

// 🧠 Лог-функція
const log = (level, message, details = {}) => {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] ${message}`);
  if (Object.keys(details).length) {
    console[level](`[DETAILS] ${JSON.stringify(details, null, 2)}`);
  }
};

// ✅ Реєстрація користувача
const register = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  log("info", "📌 Запит на реєстрацію", req.body);

  const t = await sequelize.transaction();

  try {
    const {
      first_name = "",
      last_name = "",
      email = "",
      password = "",
      phone = "",
    } = req.body;

    if (!first_name.trim() || !last_name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      return res.status(400).json({ message: "Будь ласка, заповніть всі поля" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Некоректний email" });
    }

    const [existingUser] = await sequelize.query(
      "SELECT * FROM users WHERE email = :email LIMIT 1",
      {
        replacements: { email },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (existingUser) {
      return res.status(400).json({ message: "Email вже зайнятий" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await sequelize.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, created_at, updated_at)
       VALUES (:first_name, :last_name, :email, :password, :phone, NOW(), NOW())
       RETURNING *`,
      {
        replacements: {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.trim(),
          password: hashedPassword,
          phone: phone.trim(),
        },
        type: Sequelize.QueryTypes.INSERT,
        transaction: t,
      }
    );

    await t.commit();
    log("info", "✅ Успішна реєстрація", { id: result[0].id });

    return res.status(201).json({
      message: "Користувач зареєстрований",
      user: result[0],
    });
  } catch (error) {
    await t.rollback();
    log("error", "❌ Помилка при реєстрації", { message: error.message });
    return res.status(500).json({
      message: "Помилка сервера",
      error: "Validation error",
    });
  }
};

// ✅ Вхід користувача
const login = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  log("info", "📌 Запит на вхід", req.body);

  try {
    const { email = "", password = "" } = req.body;

    if (!email.trim() || !password.trim()) {
      return res.status(400).json({ message: "Будь ласка, введіть email і пароль" });
    }

    const [user] = await sequelize.query(
      "SELECT * FROM users WHERE email = :email LIMIT 1",
      {
        replacements: { email: email.trim() },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Невірний пароль" });
    }

    const cleanUser = { ...user };
    delete cleanUser.password;

    const token = generateToken(cleanUser);
    log("info", "✅ Успішний вхід", { userId: user.id });

    return res.status(200).json({
      message: "Вхід успішний",
      token,
      user: cleanUser,
    });
  } catch (error) {
    log("error", "❌ Помилка при вході", { message: error.message });
    return res.status(500).json({
      message: "Помилка сервера",
      error: "Authentication error",
    });
  }
};

// ❌ Обробка неіснуючих маршрутів
const notFound = (req, res) => {
  res.status(404).json({ message: "Маршрут не знайдено" });
};

module.exports = { register, login, notFound };
