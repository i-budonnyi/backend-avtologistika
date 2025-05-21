const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Статус, який дозволено амбасадору
const AMBASSADOR_ALLOWED_STATUS = "до_секретаря";

// Логування запитів
const logRequest = (req) => {
  console.log(`\n--- 📡 [REQUEST] ${req.method} ${req.originalUrl} ---`);
  console.log("🌐 IP:", req.ip);
  console.log("📥 Headers:", req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📦 Body:", req.body);
  }
};

// Авторизація
const authenticateToken = (req, res, next) => {
  logRequest(req);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Не авторизований" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Недійсний токен" });
  }
};

// Отримати профіль авторизованого амбасадора
const getLoggedAmbassador = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Не авторизований" });

    const [ambassador] = await sequelize.query(
      `SELECT id, phone, position, email, first_name, last_name, user_id
       FROM ambassadors WHERE user_id = :userId LIMIT 1`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    if (!ambassador) return res.status(404).json({ message: "Амбасадора не знайдено" });
    res.json(ambassador);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання амбасадора", error: error.message });
  }
};

// Отримати амбасадора за ID
const getAmbassadorById = async (req, res) => {
  logRequest(req);
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Невірний ID амбасадора." });
    }

    const [ambassador] = await sequelize.query(
      `SELECT id, phone, email, first_name, last_name, user_id 
       FROM ambassadors WHERE id = :id LIMIT 1`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (!ambassador) {
      return res.status(404).json({ message: "Амбасадора не знайдено." });
    }

    res.json(ambassador);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання амбасадора", error: error.message });
  }
};

// Отримати всіх амбасадорів
const getAllAmbassadors = async (req, res) => {
  logRequest(req);
  try {
    const ambassadors = await sequelize.query(
      `SELECT id, phone, position, email, first_name, last_name FROM ambassadors`,
      { type: QueryTypes.SELECT }
    );
    res.json(ambassadors);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання амбасадорів", error: error.message });
  }
};

// Отримати ідеї для амбасадора
const getIdeasForAmbassador = async (req, res) => {
  logRequest(req);
  try {
    const userId = req.params.id;
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Некоректний ID користувача" });
    }

    const [ambassador] = await sequelize.query(
      `SELECT id FROM ambassadors WHERE user_id = :userId LIMIT 1`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    if (!ambassador) {
      return res.status(404).json({ message: "Амбасадора не знайдено" });
    }

    const ideas = await sequelize.query(
      `SELECT i.id, i.title, i.description, i.status, i.user_id,
              u.first_name AS sender_first_name,
              u.last_name AS sender_last_name,
              u.email AS sender_email
       FROM ideas i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.ambassador_id = :ambassadorId
       ORDER BY i.id DESC`,
      { replacements: { ambassadorId: ambassador.id }, type: QueryTypes.SELECT }
    );

    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

// Оновити статус ідеї (тільки для амбасадора)
const updateIdeaStatus = async (req, res) => {
  logRequest(req);
  try {
    const { idea_id, new_status } = req.body;
    const userId = req.user?.id;

    if (!idea_id || !new_status) {
      return res.status(400).json({ message: "Потрібно вказати idea_id і new_status" });
    }

    if (new_status !== AMBASSADOR_ALLOWED_STATUS) {
      return res.status(403).json({
        message: `Амбасадору дозволено встановлювати лише статус "${AMBASSADOR_ALLOWED_STATUS}"`,
      });
    }

    const [ambassador] = await sequelize.query(
      `SELECT id FROM ambassadors WHERE user_id = :userId LIMIT 1`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    if (!ambassador) {
      return res.status(403).json({ message: "Доступ заборонено — не амбасадор" });
    }

    const [updatedRows] = await sequelize.query(
      `UPDATE ideas
       SET status = :new_status
       WHERE id = :idea_id AND ambassador_id = :ambassador_id
       RETURNING id, title, status`,
      {
        replacements: {
          idea_id,
          new_status,
          ambassador_id: ambassador.id,
        },
        type: QueryTypes.UPDATE,
      }
    );

    if (!updatedRows || updatedRows.length === 0) {
      return res.status(404).json({ message: "Ідея не знайдена або не належить цьому амбасадору" });
    }

    res.json({
      message: "Статус оновлено успішно",
      updated: updatedRows[0],
    });
  } catch (error) {
    console.error("❌ updateIdeaStatus error:", error);
    res.status(500).json({ message: "Помилка оновлення статусу", error: error.message });
  }
};

// Експорт
module.exports = {
  authenticateToken,
  getLoggedAmbassador,
  getAmbassadorById,
  getAllAmbassadors,
  getIdeasForAmbassador,
  updateIdeaStatus,
};
