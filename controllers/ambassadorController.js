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
      console.warn("❌ [getLoggedAmbassador] Токен не містить userId!");
      return res.status(401).json({ message: "Не авторизований" });
    }

    const userId = req.user.id;

    const ambassador = await sequelize.query(
      `SELECT id, phone, position, email, first_name, last_name, user_id
       FROM ambassadors WHERE user_id = :userId LIMIT 1`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    if (!ambassador.length) {
      console.warn(`❌ [getLoggedAmbassador] Амбасадора не знайдено user_id=${userId}`);
      return res.status(404).json({ message: "Амбасадора не знайдено" });
    }

    res.status(200).json(ambassador[0]);
  } catch (error) {
    console.error("❌ [getLoggedAmbassador] Помилка:", error.message);
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
    const ambassadorId = req.params.id;
    if (!ambassadorId || isNaN(ambassadorId)) {
      return res.status(400).json({ message: "ID амбасадора не передано або некоректний" });
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
      { replacements: { ambassadorId }, type: QueryTypes.SELECT }
    );

    res.status(200).json(ideas);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

module.exports = {
  authenticateToken,
  getLoggedAmbassador,
  getAmbassadorById,
  getAllAmbassadors,
  getIdeasForAmbassador,
};
