const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const logRequest = (req) => {
  console.log(`\n--- 📡 [INCOMING REQUEST] ${req.method} ${req.originalUrl} ---`);
  console.log("🌐 IP:", req.ip);
  console.log("📥 Headers:", req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📦 Body:", req.body);
  }
};

const authenticateToken = (req, res, next) => {
  logRequest(req);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("❌ [AUTH] Відсутній або некоректний токен");
    return res.status(401).json({ message: "Не авторизований" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log(`✅ [AUTH] Токен підтверджено, userId: ${decoded.id}`);
    next();
  } catch (error) {
    console.error("❌ [AUTH] Помилка перевірки токена:", error.message);
    return res.status(403).json({ message: "Недійсний токен" });
  }
};

const getLoggedAmbassador = async (req, res) => {
  logRequest(req);
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Не авторизований" });
    }

    const userId = req.user.id;

    const ambassador = await sequelize.query(
      `SELECT id, phone, position, email, first_name, last_name, user_id
       FROM ambassadors WHERE user_id = :userId LIMIT 1`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    if (!ambassador.length) {
      return res.status(404).json({ message: "Амбасадора не знайдено" });
    }

    res.status(200).json(ambassador[0]);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання амбасадора", error: error.message });
  }
};

const getAmbassadorById = async (req, res) => {
  logRequest(req);
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Невірний ID амбасадора." });
    }

    const ambassador = await sequelize.query(
      `SELECT id, phone, email, first_name, last_name, user_id 
       FROM ambassadors WHERE id = :id LIMIT 1`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (!ambassador.length) {
      return res.status(404).json({ message: "Амбасадора не знайдено." });
    }

    res.status(200).json(ambassador[0]);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання амбасадора", error: error.message });
  }
};

const getAllAmbassadors = async (req, res) => {
  logRequest(req);
  try {
    const ambassadors = await sequelize.query(
      `SELECT id, phone, position, email, first_name, last_name FROM ambassadors`,
      { type: QueryTypes.SELECT }
    );
    res.status(200).json(ambassadors);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання амбасадорів", error: error.message });
  }
};

const getIdeasForAmbassador = async (req, res) => {
  logRequest(req);
  try {
    const userId = req.params.id;
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "ID користувача не передано або некоректний" });
    }

    // Знайти амбасадора по user_id
    const ambassador = await sequelize.query(
      `SELECT id FROM ambassadors WHERE user_id = :userId LIMIT 1`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    if (!ambassador.length) {
      return res.status(404).json({ message: "Амбасадора не знайдено для цього користувача." });
    }

    const ambassadorId = ambassador[0].id;

    const ideas = await sequelize.query(
      `SELECT i.id, i.title, i.description, i.status, i.user_id,
              u.first_name AS sender_first_name,
              u.last_name AS sender_last_name,
              u.email AS sender_email
       FROM ideas i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.ambassador_id = :ambassadorId
       ORDER BY i.id DESC`,
      { replacements: { ambassadorId }, type: QueryTypes.SELECT }
    );

    res.status(200).json(ideas);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

const updateIdeaStatus = async (req, res) => {
  logRequest(req);
  try {
    const { idea_id, new_status } = req.body;
    const userId = req.user?.id;

    if (!idea_id || !new_status) {
      return res.status(400).json({ message: "Необхідно передати idea_id і new_status" });
    }

    const ambassador = await sequelize.query(
      `SELECT id FROM ambassadors WHERE user_id = :userId`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    if (!ambassador.length) {
      return res.status(403).json({ message: "Доступ заборонено — не амбасадор" });
    }

    const result = await sequelize.query(
      `UPDATE ideas SET status = :new_status WHERE id = :idea_id AND ambassador_id = :ambassadorId RETURNING *`,
      {
        replacements: {
          new_status,
          idea_id,
          ambassadorId: ambassador[0].id,
        },
        type: QueryTypes.UPDATE,
      }
    );

    if (!result[1]?.length) {
      return res.status(404).json({ message: "Ідея не знайдена або не належить цьому амбасадору." });
    }

    res.status(200).json({ message: "Статус оновлено", updated: result[1][0] });
  } catch (error) {
    res.status(500).json({ message: "Помилка оновлення статусу", error: error.message });
  }
};

module.exports = {
  authenticateToken,
  getLoggedAmbassador,
  getAmbassadorById,
  getAllAmbassadors,
  getIdeasForAmbassador,
  updateIdeaStatus,
};
