const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const sequelize = require("../config/db");
const { io } = require("../index"); // 🔔 WebSocket

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// 🔐 Авторизація секретаря
const authenticateSecretary = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Потрібна авторизація" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Невірний токен" });
  }
};

// ✅ Отримання конкретного секретаря за ID
const getSecretaryById = async (req, res) => {
  try {
    const secretaryId = parseInt(req.params.id, 10);
    if (isNaN(secretaryId)) {
      return res.status(400).json({ message: "Некоректний ID секретаря" });
    }

    const [secretary] = await sequelize.query(
      `SELECT id, phone, email, first_name, last_name, user_id, role
       FROM secretaries WHERE id = :secretaryId LIMIT 1`,
      {
        replacements: { secretaryId },
        type: QueryTypes.SELECT,
      }
    );

    if (!secretary) {
      return res.status(404).json({ message: "Секретаря не знайдено" });
    }

    res.status(200).json(secretary);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання секретаря", error: error.message });
  }
};

// ✅ Отримання всіх секретарів
const getAllSecretaries = async (req, res) => {
  try {
    const secretaries = await sequelize.query(
      `SELECT id, phone, email, first_name, last_name, role FROM secretaries`,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json(secretaries);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання секретарів", error: error.message });
  }
};

// ✅ Отримання заявок для секретаря
const fetchApplicationsBySecretary = async (req, res) => {
  try {
    const secretaryId = parseInt(req.params.id, 10);
    if (isNaN(secretaryId)) {
      return res.status(400).json({ message: "Некоректний ID секретаря" });
    }

    const applications = await sequelize.query(
      `SELECT id, title, description, status, created_at 
       FROM applications WHERE jury_secretary_id = :secretaryId`,
      {
        replacements: { secretaryId },
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання заявок", error: error.message });
  }
};

// ✅ Оновлення профілю секретаря
const updateSecretaryProfile = async (req, res) => {
  try {
    const secretaryId = parseInt(req.params.id, 10);
    const { phone, email, first_name, last_name } = req.body;

    if (!secretaryId || !email || !first_name || !last_name) {
      return res.status(400).json({ message: "Обов’язкові поля відсутні" });
    }

    const [result] = await sequelize.query(
      `UPDATE secretaries SET phone = :phone, email = :email,
        first_name = :first_name, last_name = :last_name, updated_at = NOW()
       WHERE id = :secretaryId RETURNING *`,
      {
        replacements: { phone, email, first_name, last_name, secretaryId },
        type: QueryTypes.UPDATE,
      }
    );

    if (!result || !result.length) {
      return res.status(404).json({ message: "Секретаря не знайдено" });
    }

    res.status(200).json({ message: "✅ Профіль оновлено", data: result[0] });
  } catch (error) {
    res.status(500).json({ message: "Помилка оновлення профілю", error: error.message });
  }
};

// 🔔 Сповіщення WebSocket про нову заявку
const notifySecretaryAboutNewApplication = (secretaryId, applicationData) => {
  io.emit("application_assigned_to_secretary", {
    secretaryId,
    ...applicationData,
  });
};

// ✅ Експорт функцій
module.exports = {
  authenticateSecretary,
  getSecretaryById,
  getAllSecretaries,
  fetchApplicationsBySecretary,
  updateSecretaryProfile,
  notifySecretaryAboutNewApplication,
};
