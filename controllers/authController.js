﻿const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserRoles = require("../models/UserRoles"); // Модель для роботи з таблицею користувачів
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Функція для логування всіх дій
const log = (level, message, details = {}) => {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] ${message}`);
  if (Object.keys(details).length) {
    console[level](`[DETAILS] ${JSON.stringify(details, null, 2)}`);
  }
};

// Функція для генерації токена
const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.id,
      role_id: user.role_id,
    },
    JWT_SECRET,
    { expiresIn: "5h" } // Термін дії токена встановлено на 5 годин
  );
};

// Реєстрація користувача
const register = async (req, res) => {
  log("info", "Отримано запит на реєстрацію", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    body: req.body,
  });

  try {
    const { first_name, last_name, email, password, phone, role_id } = req.body;

    if (!first_name || !last_name || !email || !password || !phone || !role_id) {
      log("warn", "Не всі поля заповнені", req.body);
      return res.status(400).json({ message: "Заповніть всі поля" });
    }

    log("info", "Перевірка, чи існує користувач із таким email", { email });
    const existingUser = await UserRoles.findOne({ where: { email } });

    if (existingUser) {
      log("warn", "Користувач із таким email вже існує", { email });
      return res.status(400).json({ message: "Користувач з таким email вже існує" });
    }

    log("info", "Хешування пароля");
    const hashedPassword = await bcrypt.hash(password, 10);

    log("info", "Створення нового користувача", { first_name, last_name, email });
    const newUser = await UserRoles.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      phone,
      role_id,
    });

    log("info", "Користувач успішно зареєстрований", { id: newUser.id, email: newUser.email });

    return res.status(201).json({
      message: "Користувач успішно зареєстрований",
      user: { id: newUser.id, email: newUser.email, role_id: newUser.role_id },
    });
  } catch (error) {
    log("error", "Помилка під час реєстрації", { message: error.message, stack: error.stack });
    return res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

// Вхід користувача
const login = async (req, res) => {
  log("info", "Отримано запит на вхід", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    body: req.body,
  });

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      log("warn", "Не всі поля заповнені", { email, password });
      return res.status(400).json({ message: "Заповніть всі поля" });
    }

    log("info", "Пошук користувача за email", { email });
    const user = await UserRoles.findOne({ where: { email } });

    if (!user) {
      log("warn", "Користувача не знайдено", { email });
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    log("info", "Перевірка пароля для користувача", { email });
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      log("warn", "Невірний пароль", { email });
      return res.status(401).json({ message: "Невірний пароль" });
    }

    log("info", "Генерація JWT токена для користувача", { user_id: user.id, role_id: user.role_id });
    const token = generateToken(user);

    log("info", "Вхід успішний", { user_id: user.id, email: user.email });

    return res.status(200).json({
      message: "Вхід успішний",
      token,
      user: { id: user.id, email: user.email, role_id: user.role_id },
    });
  } catch (error) {
    log("error", "Помилка під час входу", { message: error.message, stack: error.stack });
    return res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

// Обробка 404
const notFound = (req, res) => {
  log("warn", "Маршрут не знайдено", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  res.status(404).json({ message: "Маршрут не знайдено" });
};

module.exports = {
  register,
  login,
  notFound,
};
