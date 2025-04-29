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
    console.log("[authenticateUser] ✅ Токен розшифровано:", decoded);

    if (!decoded.id) {
      console.error("[authenticateUser] ❌ Токен не містить ID користувача.");
      return res.status(401).json({ message: "Некоректний токен" });
    }

    req.user = decoded;
    console.log("[authenticateUser] ✅ Авторизація успішна для user_id:", req.user.id);
    next();
  } catch (error) {
    console.error("[authenticateUser] ❌ Помилка перевірки токена:", error);
    return res.status(403).json({ message: "Невірний або протермінований токен" });
  }
};

const getAllIdeas = async (req, res) => {
  try {
    console.log("[getAllIdeas] 🔍 Отримання всіх ідей...");
    const ideas = await sequelize.query(`SELECT * FROM ideas ORDER BY created_at DESC`, {
      type: QueryTypes.SELECT,
    });
    console.log(`[getAllIdeas] ✅ Отримано ${ideas.length} ідей.`);
    res.status(200).json(ideas);
  } catch (error) {
    console.error("[getAllIdeas] ❌ Помилка отримання ідей:", error);
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

const getUserIdeas = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Необхідно авторизуватися." });
    }

    const userId = req.user.id;
    console.log(`[getUserIdeas] 🔍 Ідеї для user_id = ${userId}`);

    const ideas = await sequelize.query(
      `SELECT * FROM ideas WHERE user_id = :userId ORDER BY created_at DESC`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    res.status(200).json(ideas);
  } catch (error) {
    console.error("[getUserIdeas] ❌", error);
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

const getIdeasByAmbassador = async (req, res) => {
  try {
    const { ambassadorId } = req.params;
    if (!ambassadorId) {
      return res.status(400).json({ message: "Необхідно вказати ID амбасадора." });
    }

    const ideas = await sequelize.query(
      `SELECT i.*, u.first_name AS author_name, u.last_name AS author_last_name FROM ideas i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.ambassador_id = :ambassadorId
       ORDER BY i.created_at DESC`,
      { replacements: { ambassadorId }, type: QueryTypes.SELECT }
    );

    res.status(200).json(ideas);
  } catch (error) {
    console.error("[getIdeasByAmbassador] ❌", error);
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

const addCommentToIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    if (!comment?.trim()) {
      return res.status(400).json({ message: "Коментар не може бути порожнім." });
    }

    await sequelize.query(
      `INSERT INTO comments (idea_id, user_id, comment_text) VALUES (:id, :userId, :comment)`,
      { replacements: { id, userId, comment }, type: QueryTypes.INSERT }
    );

    res.status(201).json({ message: "Коментар успішно додано" });
  } catch (error) {
    console.error("[addCommentToIdea] ❌", error);
    res.status(500).json({ message: "Помилка додавання коментаря", error: error.message });
  }
};

const createIdea = async (req, res) => {
  try {
    const { ambassador_id, title, description } = req.body;
    const user_id = req.user.id;

    await sequelize.query(
      `INSERT INTO ideas (user_id, ambassador_id, title, description, status)
       VALUES (:user_id, :ambassador_id, :title, :description, 'pending')`,
      { replacements: { user_id, ambassador_id, title, description }, type: QueryTypes.INSERT }
    );

    res.status(201).json({ message: "Ідея успішно подана" });
  } catch (error) {
    console.error("[createIdea] ❌", error);
    res.status(500).json({ message: "Помилка створення ідеї", error: error.message });
  }
};

const updateIdeaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "ID і статус обов'язкові." });
    }

    await sequelize.query(
      `UPDATE ideas SET status = :status WHERE id = :id`,
      { replacements: { status, id }, type: QueryTypes.UPDATE }
    );

    res.status(200).json({ message: "Статус ідеї успішно оновлено." });
  } catch (error) {
    console.error("[updateIdeaStatus] ❌", error);
    res.status(500).json({ message: "Помилка оновлення статусу", error: error.message });
  }
};

const getAllAmbassadors = async (req, res) => {
  try {
    console.log("[getAllAmbassadors] 🔍 Отримання списку амбасадорів...");
    const ambassadors = await sequelize.query(
      `SELECT id, first_name, last_name, email FROM users WHERE role = 'ambassador'`,
      { type: QueryTypes.SELECT }
    );

    console.log(`[getAllAmbassadors] ✅ Отримано ${ambassadors.length} амбасадорів.`);
    res.status(200).json(ambassadors);
  } catch (error) {
    console.error("[getAllAmbassadors] ❌", error);
    res.status(500).json({ message: "Не вдалося отримати амбасадорів", error: error.message });
  }
};

module.exports = {
  getAllIdeas,
  createIdea,
  getUserIdeas,
  updateIdeaStatus,
  addCommentToIdea,
  getAllAmbassadors,
  authenticateUser,
  getIdeasByAmbassador
};
