const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Функція логування
const log = (level, message, details = {}) => {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] ${message}`);
  if (Object.keys(details).length) {
    console[level](`[DETAILS] ${JSON.stringify(details, null, 2)}`);
  }
};

// Генерація токена
const generateToken = (user) => {
  return jwt.sign({ id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone }, JWT_SECRET, { expiresIn: "5h" });
};

// Реєстрація користувача
const register = async (req, res) => {
  log("info", "📌 Отримано запит на реєстрацію", { email: req.body.email });
  const t = await sequelize.transaction();
  try {
    const { first_name, last_name, email, password, phone } = req.body;
    if (!first_name || !last_name || !email || !password || !phone) {
      return res.status(400).json({ message: "Заповніть всі поля" });
    }
    
    const existingUser = await sequelize.query(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      { replacements: [email], type: Sequelize.QueryTypes.SELECT }
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Користувач з таким email вже існує" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [newUser] = await sequelize.query(
      `INSERT INTO users (first_name, last_name, email, password, phone) 
      VALUES (?, ?, ?, ?, ?) RETURNING id, first_name, last_name, email, phone`,
      { replacements: [first_name, last_name, email, hashedPassword, phone], transaction: t }
    );

    await t.commit();
    log("info", "✅ Користувач успішно зареєстрований", { id: newUser.id, email });
    return res.status(201).json({ message: "Користувач успішно зареєстрований", user: newUser });
  } catch (error) {
    await t.rollback();
    log("error", "❌ Помилка при реєстрації", { message: error.message });
    return res.status(500).json({ message: "Помилка сервера" });
  }
};

// Вхід користувача (без ролі, тільки з таблиці users)
const login = async (req, res) => {
  log("info", "📌 Отримано запит на вхід", { email: req.body.email });
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Введіть email і пароль" });
    }
    
    const users = await sequelize.query(
      `SELECT id, first_name, last_name, email, phone, password FROM users WHERE email = ? LIMIT 1;`,
      { replacements: [email], type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Користувача не знайдено або немає доступу" });
    }

    const user = users[0];
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Невірний пароль" });
    }

    delete user.password; // Видаляємо пароль перед збереженням у токен

    log("info", "✅ Генерація JWT токена для користувача", { userId: user.id });
    const token = generateToken(user);
    return res.status(200).json({ message: "Вхід успішний", token, user });
  } catch (error) {
    log("error", "❌ Помилка при вході", { message: error.message });
    return res.status(500).json({ message: "Помилка сервера" });
  }
};

// Обробка неіснуючих маршрутів
const notFound = (req, res) => {
  res.status(404).json({ message: "Маршрут не знайдено" });
};

// Експортуємо функції
module.exports = {
  register,
  login,
  notFound
};
