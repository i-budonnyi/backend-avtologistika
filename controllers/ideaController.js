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
        console.log("[authenticateUser] ✅ Токен розшифровано:", decoded);
        
        if (!decoded.id) {
            console.error("[authenticateUser] ❌ Помилка: Токен не містить ID користувача.");
            return res.status(401).json({ message: "Некоректний токен" });
        }

        req.user = decoded; // ✅ Додаємо користувача в req
        console.log("[authenticateUser] ✅ Авторизація успішна для user_id:", req.user.id);
        next();
    } catch (error) {
        console.error("[authenticateUser] ❌ Помилка перевірки токена:", error);
        return res.status(403).json({ message: "Невірний або протермінований токен" });
    }
};

// ✅ Отримати всі ідеї
const getAllIdeas = async (req, res) => {
    try {
        console.log("[getAllIdeas] 🔍 Отримання всіх ідей...");

        const ideas = await sequelize.query(
            `SELECT * FROM ideas ORDER BY created_at DESC`,
            { type: QueryTypes.SELECT }
        );

        console.log(`[getAllIdeas] ✅ Отримано ${ideas.length} ідей.`);
        res.status(200).json(ideas);
    } catch (error) {
        console.error("[getAllIdeas] ❌ Помилка отримання ідей:", error);
        res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
    }
};

// ✅ Отримати всі ідеї користувача
const getUserIdeas = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            console.error("[getUserIdeas] ❌ Не вдалося отримати user_id з req.user.");
            return res.status(401).json({ message: "Необхідно авторизуватися." });
        }

        const userId = req.user.id;
        console.log(`[getUserIdeas] 🔍 Отримання ідей для user_id = ${userId}`);

        const ideas = await sequelize.query(
            `SELECT * FROM ideas WHERE user_id = :userId ORDER BY created_at DESC`,
            { replacements: { userId }, type: QueryTypes.SELECT }
        );

        if (!ideas || ideas.length === 0) {
            console.warn("[getUserIdeas] ⚠️ Користувач ще не подав жодної ідеї.");
            return res.status(404).json({ message: "У вас ще немає поданих ідей." });
        }

        console.log(`[getUserIdeas] ✅ Отримано ${ideas.length} ідей.`);
        res.status(200).json(ideas);
    } catch (error) {
        console.error("[getUserIdeas] ❌ Помилка отримання ідей користувача:", error);
        res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
    }
};

// ✅ Функція для отримання всіх ідей за амбасадором з даними автора
const getIdeasByAmbassador = async (req, res) => {
    try {
        const { ambassadorId } = req.params;

        if (!ambassadorId) {
            console.error("[getIdeasByAmbassador] ❌ Відсутній ID амбасадора.");
            return res.status(400).json({ message: "Необхідно вказати ID амбасадора." });
        }

        console.log(`[getIdeasByAmbassador] 🔍 Отримання ідей, де обрали амбасадора ID=${ambassadorId}...`);

        const ideas = await sequelize.query(
            `SELECT i.*, u.id AS author_id, u.first_name AS author_name, u.last_name AS author_last_name, u.phone AS author_phone, u.email AS author_email
            FROM ideas i
            LEFT JOIN users u ON i.user_id = u.id
            WHERE i.ambassador_id = :ambassadorId
            ORDER BY i.created_at DESC`,
            {
                replacements: { ambassadorId },
                type: QueryTypes.SELECT,
            }
        );

        if (!ideas || ideas.length === 0) {
            console.warn(`[getIdeasByAmbassador] ⚠️ Жодна ідея не містить амбасадора ID=${ambassadorId}.`);
            return res.status(404).json({ message: "Жоден користувач не обрав цього амбасадора." });
        }

        console.log(`[getIdeasByAmbassador] ✅ Отримано ${ideas.length} ідей.`);

        res.status(200).json(ideas);
    } catch (error) {
        console.error("[getIdeasByAmbassador] ❌ Помилка отримання ідей:", error);
        res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
    }
};


// ✅ Додати коментар до ідеї
const addCommentToIdea = async (req, res) => {
    try {
        console.log("[addCommentToIdea] 🔍 Запит на додавання коментаря...");
        const { id } = req.params;
        const { comment } = req.body;

        if (!req.user || !req.user.id) {
            console.error("[addCommentToIdea] ❌ Не вдалося отримати user_id з req.user.");
            return res.status(401).json({ message: "Необхідно авторизуватися." });
        }

        if (!comment || comment.trim() === "") {
            console.warn("[addCommentToIdea] ❌ Коментар не може бути порожнім.");
            return res.status(400).json({ message: "Коментар не може бути порожнім." });
        }

        const userId = req.user.id;

        await sequelize.query(
            `INSERT INTO comments (idea_id, user_id, comment_text) VALUES (:id, :userId, :comment)`,
            { replacements: { id, userId, comment }, type: QueryTypes.INSERT }
        );

        console.log(`[addCommentToIdea] ✅ Коментар додано до ідеї ID=${id}`);
        res.status(201).json({ message: "Коментар успішно додано" });
    } catch (error) {
        console.error("[addCommentToIdea] ❌ Помилка додавання коментаря:", error);
        res.status(500).json({ message: "Помилка додавання коментаря", error: error.message });
    }
};

// ✅ Створити нову ідею
const createIdea = async (req, res) => {
    try {
        console.log("[createIdea] 🔍 Запит на створення нової ідеї...");

        if (!req.user || !req.user.id) {
            console.error("[createIdea] ❌ Не вдалося отримати user_id з req.user.");
            return res.status(401).json({ message: "Авторизація потрібна." });
        }

        const { ambassador_id, title, description } = req.body;
        const user_id = req.user.id;

        await sequelize.query(
            `INSERT INTO ideas (user_id, ambassador_id, title, description, status)
             VALUES (:user_id, :ambassador_id, :title, :description, 'pending')`,
            { replacements: { user_id, ambassador_id, title, description }, type: QueryTypes.INSERT }
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
        console.log("[updateIdeaStatus] 🔍 Оновлення статусу ідеї...");
        const { id } = req.params;
        const { status } = req.body;

        if (!id || !status) {
            console.error("[updateIdeaStatus] ❌ Відсутні дані.");
            return res.status(400).json({ message: "ID і статус обов'язкові." });
        }

        await sequelize.query(
            `UPDATE ideas SET status = :status WHERE id = :id`,
            { replacements: { status, id }, type: QueryTypes.UPDATE }
        );

        console.log(`[updateIdeaStatus] ✅ Статус ідеї ID=${id} оновлено.`);
        res.status(200).json({ message: "Статус ідеї успішно оновлено." });
    } catch (error) {
        console.error("[updateIdeaStatus] ❌ Помилка оновлення статусу:", error);
        res.status(500).json({ message: "Помилка оновлення статусу", error: error.message });
    }
};
// Функція для отримання всіх амбасадорів
const getAllAmbassadors = async (req, res) => {
  try {
    const ambassadors = await Ambassador.find(); // знайти всіх амбасадорів
    res.status(200).json(ambassadors); // повертаємо список амбасадорів у форматі JSON
  } catch (error) {
    res.status(500).json({ message: "Не вдалося отримати амбасадорів", error });
  }
};
// ✅ Додаємо все до module.exports
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
