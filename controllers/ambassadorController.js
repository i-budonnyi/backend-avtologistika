const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// 🧾 Логування
const logRequest = (req) => {
  console.log(`\n--- 📡 [INCOMING REQUEST] ${req.method} ${req.originalUrl} ---`);
  console.log("🌐 IP:", req.ip);
  console.log("📥 Headers:", req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📦 Body:", req.body);
  }
};

// ✅ Авторизація
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

// ✅ Отримання авторизованого амбасадора
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

// ✅ Отримання амбасадора за ID
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

// ✅ Всі амбасадори
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

// ✅ Ідеї, які обрали цього амбасадора
const getIdeasForAmbassador = async (req, res) => {
  logRequest(req);
  try {
    const userId = req.params.id;
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "ID користувача не передано або некоректний" });
    }

    const [ambassador] = await sequelize.query(
      `SELECT id FROM ambassadors WHERE user_id = :userId LIMIT 1`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    if (!ambassador) {
      return res.status(404).json({ message: "Амбасадора не знайдено для цього користувача." });
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

// ✅ Оновлення статусу ідеї
const updateIdeaStatus = async (req, res) => {
  logRequest(req);
  try {
    const { idea_id, new_status } = req.body;
    const userId = req.user?.id;

    if (!idea_id || !new_status) {
      return res.status(400).json({ message: "Необхідно передати idea_id і new_status" });
    }

    const [ambassador] = await sequelize.query(
      `SELECT id FROM ambassadors WHERE user_id = :userId LIMIT 1`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    if (!ambassador) {
      return res.status(403).json({ message: "Доступ заборонено — не амбасадор" });
    }

    const result = await sequelize.query(
      `UPDATE ideas SET status = :new_status WHERE id = :idea_id AND ambassador_id = :ambassadorId RETURNING *`,
      {
        replacements: {
          idea_id,
          new_status,
          ambassadorId: ambassador.id,
        },
        type: QueryTypes.UPDATE,
      }
    );

    if (!result[1]?.length) {
      return res.status(404).json({ message: "Ідея не знайдена або не належить цьому амбасадору." });
    }

    res.json({ message: "Статус оновлено", updated: result[1][0] });
  } catch (error) {
    console.error("❌ [updateIdeaStatus] error:", error);
    res.status(500).json({ message: "Помилка оновлення статусу", error: error.message });
  }
};

// ✅ Повний експорт
module.exports = {
  authenticateToken,
  getLoggedAmbassador,
  getAmbassadorById,
  getAllAmbassadors,
  getIdeasForAmbassador,
  updateIdeaStatus,
};
