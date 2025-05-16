const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Middleware для перевірки JWT
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[authenticateUser] ❌ Відсутній токен авторизації.");
    return res.status(401).json({ message: "Необхідно авторизуватися" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log("[authenticateUser] ✅ Авторизація успішна:", req.user);
    next();
  } catch (error) {
    console.error("[authenticateUser] ❌ Помилка перевірки токена:", error);
    return res.status(403).json({ message: "Невірний або протермінований токен" });
  }
};

// ✅ Отримати всіх амбасадорів
const getAllAmbassadors = async (req, res) => {
  try {
    const ambassadors = await sequelize.query(
      `SELECT id, first_name, last_name, email FROM ambassadors`,
      { type: QueryTypes.SELECT }
    );
    res.status(200).json(ambassadors);
  } catch (error) {
    console.error("[getAllAmbassadors] ❌", error);
    res.status(500).json({ message: "Помилка отримання списку амбасадорів", error: error.message });
  }
};

// ✅ Отримати всі проблеми
const getAllProblems = async (req, res) => {
  try {
    const problems = await sequelize.query(
      `SELECT p.id, p.title, p.description, p.status, 
              u.first_name AS author_first_name, u.last_name AS author_last_name,
              a.id AS ambassador_id, a.first_name AS ambassador_first_name, a.last_name AS ambassador_last_name
       FROM problems p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN ambassadors a ON p.ambassador_id = a.id`,
      { type: QueryTypes.SELECT }
    );
    res.status(200).json(problems);
  } catch (error) {
    console.error("[getAllProblems] ❌", error);
    res.status(500).json({ message: "Помилка отримання проблем", error: error.message });
  }
};

// ✅ Отримати проблеми користувача
const getUserProblems = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Авторизація обов'язкова" });

    const problems = await sequelize.query(
      `SELECT p.id, p.title, p.description, p.status,
              u.first_name AS author_first_name, u.last_name AS author_last_name
       FROM problems p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.user_id = :userId
       ORDER BY p.created_at DESC`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );
    res.status(200).json(problems);
  } catch (error) {
    console.error("[getUserProblems] ❌", error);
    res.status(500).json({ message: "Помилка отримання проблем", error: error.message });
  }
};

// ✅ Створити нову проблему
const createProblem = async (req, res) => {
  try {
    const { title, description, ambassador_id } = req.body;
    const user_id = req.user?.id;
    if (!title || !description) {
      return res.status(400).json({ message: "Назва та опис обов'язкові." });
    }

    await sequelize.query(
      `INSERT INTO problems (user_id, ambassador_id, title, description, status, created_at, updated_at)
       VALUES (:user_id, :ambassador_id, :title, :description, 'pending', NOW(), NOW())`,
      { replacements: { user_id, ambassador_id, title, description }, type: QueryTypes.INSERT }
    );
    res.status(201).json({ message: "Проблема успішно подана" });
  } catch (error) {
    console.error("[createProblem] ❌", error);
    res.status(500).json({ message: "Помилка створення проблеми", error: error.message });
  }
};

// ✅ Видалити проблему
const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sequelize.query(
      `DELETE FROM problems WHERE id = :id`,
      { replacements: { id }, type: QueryTypes.DELETE }
    );
    if (!result || result[0] === 0) {
      return res.status(404).json({ message: "Проблема не знайдена" });
    }
    res.status(200).json({ message: "Проблему успішно видалено" });
  } catch (error) {
    console.error("[deleteProblem] ❌", error);
    res.status(500).json({ message: "Помилка видалення проблеми", error: error.message });
  }
};

// ✅ Оновити статус проблеми
const updateProblemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ message: "ID і статус обов'язкові." });
    }

    await sequelize.query(
      `UPDATE problems SET status = :status WHERE id = :id`,
      { replacements: { status, id }, type: QueryTypes.UPDATE }
    );
    res.status(200).json({ message: "Статус проблеми успішно оновлено." });
  } catch (error) {
    console.error("[updateProblemStatus] ❌", error);
    res.status(500).json({ message: "Помилка оновлення статусу", error: error.message });
  }
};

module.exports = {
  getAllProblems,
  getUserProblems,
  createProblem,
  deleteProblem,
  updateProblemStatus,
  getAllAmbassadors,
  authenticateUser,
};
