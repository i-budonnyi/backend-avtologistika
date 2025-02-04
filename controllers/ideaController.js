const sequelize = require("../config/database"); // ✅ Підключення до БД
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
    req.user = decoded; // ✅ Додаємо користувача в req
    console.log("[authenticateUser] ✅ Авторизація успішна:", req.user);
    next();
  } catch (error) {
    console.error("[authenticateUser] ❌ Помилка перевірки токена:", error);
    return res.status(403).json({ message: "Невірний або протермінований токен" });
  }
};

// ✅ Отримати ідеї конкретного користувача
const getUserIdeas = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      console.error("[IDEAS] ❌ Не вдалося отримати user_id з req.user.");
      return res.status(401).json({ message: "Необхідно авторизуватися." });
    }

    const userId = req.user.user_id;
    console.log(`[IDEAS] 🔍 Отримання ідей для user_id = ${userId}`);

    const ideas = await sequelize.query(
      `SELECT * FROM ideas WHERE user_id = :userId ORDER BY created_at DESC`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    if (!ideas || ideas.length === 0) {
      console.warn("[IDEAS] ⚠️ Користувач ще не подав жодної ідеї.");
      return res.status(404).json({ message: "У вас ще немає поданих ідей." });
    }

    console.log(`[IDEAS] ✅ Отримано ${ideas.length} ідей.`);
    res.status(200).json(ideas);
  } catch (error) {
    console.error("[ERROR] ❌ Помилка отримання ідей користувача:", error);
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

// ✅ Отримати всі ідеї
const getAllIdeas = async (req, res) => {
  try {
    console.log("[getAllIdeas] Запит отримано...");

    const ideas = await sequelize.query(
      `SELECT i.id, i.title, i.description, i.status, 
              i.author_first_name, i.author_last_name,
              a.id AS ambassador_id, a.first_name AS ambassador_first_name, a.last_name AS ambassador_last_name
       FROM ideas i
       LEFT JOIN ambassadors a ON i.ambassador_id = a.id`,
      { type: QueryTypes.SELECT }
    );

    console.log(`[getAllIdeas] ✅ Отримано ${ideas.length} ідей.`);
    res.status(200).json(ideas);
  } catch (error) {
    console.error("[getAllIdeas] ❌ Помилка:", error);
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

// ✅ Створити нову ідею
const createIdea = async (req, res) => {
  try {
    console.log("[createIdea] Запит на створення нової ідеї...");

    if (!req.user || !req.user.user_id) {
      console.error("[createIdea] ❌ Не вдалося отримати user_id з req.user.");
      return res.status(401).json({ message: "Авторизація потрібна." });
    }

    const { ambassador_id, title, description } = req.body;
    const user_id = req.user.user_id; // ✅ user_id з токена

    const user = await sequelize.query(
      `SELECT first_name, last_name FROM users WHERE id = :user_id`,
      { replacements: { user_id }, type: QueryTypes.SELECT }
    );

    if (!user || user.length === 0) {
      console.error("[createIdea] ❌ Користувача не знайдено.");
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    const { first_name, last_name } = user[0];

    await sequelize.query(
      `INSERT INTO ideas (user_id, ambassador_id, title, description, author_first_name, author_last_name, status)
       VALUES (:user_id, :ambassador_id, :title, :description, :author_first_name, :author_last_name, 'pending')`,
      { replacements: { user_id, ambassador_id, title, description, author_first_name: first_name, author_last_name: last_name }, type: QueryTypes.INSERT }
    );

    console.log("[createIdea] ✅ Ідея успішно створена.");
    res.status(201).json({ message: "Ідея успішно подана" });
  } catch (error) {
    console.error("[createIdea] ❌ Помилка створення ідеї:", error);
    res.status(500).json({ message: "Помилка створення ідеї", error: error.message });
  }
};

// ✅ Оновити статус ідеї
const updateIdeaStatus = async (req, res) => {
  try {
    console.log("[updateIdeaStatus] Запит отримано...");
    const { id } = req.params;
    const { status } = req.body;

    const result = await sequelize.query(
      `UPDATE ideas SET status = :status WHERE id = :id`,
      { replacements: { status, id }, type: QueryTypes.UPDATE }
    );

    if (result[1] === 0) {
      console.error(`[updateIdeaStatus] ❌ Ідея з ID ${id} не знайдена.`);
      return res.status(404).json({ message: "Ідея не знайдена" });
    }

    console.log(`[updateIdeaStatus] ✅ Статус ідеї з ID ${id} оновлено.`);
    res.status(200).json({ message: "Статус ідеї успішно оновлено" });
  } catch (error) {
    console.error("[updateIdeaStatus] ❌ Помилка:", error);
    res.status(500).json({ message: "Помилка оновлення статусу ідеї", error: error.message });
  }
};

// ✅ Отримати список амбасадорів
const getAllAmbassadors = async (req, res) => {
  try {
    console.log("[getAllAmbassadors] 🚀 Отримання списку амбасадорів...");

    const ambassadors = await sequelize.query(
      `SELECT id, first_name, last_name, email FROM ambassadors`,
      { type: QueryTypes.SELECT }
    );

    console.log("[getAllAmbassadors] ✅ Відправляємо список амбасадорів:", ambassadors);
    res.status(200).json(ambassadors);
  } catch (error) {
    console.error("[getAllAmbassadors] ❌ Помилка:", error);
    res.status(500).json({ message: "Помилка отримання списку амбасадорів", error: error.message });
  }
};

// ✅ Експортуємо функції
module.exports = {
  getAllIdeas,
  createIdea,
  getUserIdeas,
  updateIdeaStatus,
  getAllAmbassadors,
  authenticateUser,
};
