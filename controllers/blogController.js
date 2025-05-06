// ✅ Оптимізований blogController.js

const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const sequelize = require("../config/database");

// ✅ Middleware для обов'язкової аутентифікації
const authenticateUser = (req, res, next) => {
    console.log("\n[AUTH] 🔍 Перевірка токена...");
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("[AUTH] ❌ Токен відсутній!");
        return res.status(401).json({ message: "Потрібна авторизація (токен відсутній)" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("[AUTH] 🔑 Декодований токен:", decoded);
        req.user = { user_id: decoded.user_id || decoded.id };

        if (!req.user.user_id) {
            console.error("[AUTH] ❌ Відсутній user_id у токені!");
            return res.status(401).json({ message: "Некоректний токен" });
        }

        console.log(`[AUTH] ✅ Авторизовано користувача ID: ${req.user.user_id}`);
        next();
    } catch (error) {
        console.error("[AUTH] ❌ Невірний або протермінований токен", error.message);
        return res.status(403).json({ message: "Невірний або протермінований токен" });
    }
};

// ✅ Отримати всі блоги та ідеї (авторизовано)
const getAllEntries = async (req, res) => {
    try {
        console.log("\n[PROCESS] 📥 Запит отримано: GET /api/blogRoutes/entries");
        const userId = req.user.user_id;

        const blogs = await sequelize.query(
            `SELECT b.id, b.title, b.description, b.user_id AS authorId,
                    COALESCE(u.first_name, 'Невідомий') AS author_first_name,
                    COALESCE(u.last_name, '') AS author_last_name,
                    u.email AS author_email,
                    b.created_at AS createdAt
             FROM blog b
             LEFT JOIN users u ON b.user_id = u.id
             ORDER BY b.created_at DESC`,
            { type: QueryTypes.SELECT }
        );

        const ideas = await sequelize.query(
            `SELECT i.id, i.title, i.description, i.user_id AS authorId,
                    COALESCE(u.first_name, 'Невідомий') AS author_first_name,
                    COALESCE(u.last_name, '') AS author_last_name,
                    u.email AS author_email,
                    i.created_at AS createdAt
             FROM ideas i
             LEFT JOIN users u ON i.user_id = u.id
             ORDER BY i.created_at DESC`,
            { type: QueryTypes.SELECT }
        );

        if (!blogs.length && !ideas.length) {
            console.warn("[PROCESS] ⚠️ Блоги та ідеї не знайдені!");
            return res.status(404).json({ message: "Записів не знайдено" });
        }

        console.log(`[PROCESS] ✅ Отримано ${blogs.length} блогів та ${ideas.length} ідей.`);
        res.status(200).json({ blogs, ideas });
    } catch (error) {
        console.error("[ERROR] ❌ Помилка отримання записів:", error);
        res.status(500).json({ message: "Помилка отримання записів", error: error.message });
    }
};

// ✅ Створити новий запис
const createBlogEntry = async (req, res) => {
    try {
        const { title, description, type } = req.body;
        const userId = req.user.user_id;

        if (!title || !description || !type) {
            return res.status(400).json({ message: "❌ Всі поля обов'язкові." });
        }

        const tableName = type === "blog" ? "blog" : "ideas";
        const [newEntry] = await sequelize.query(
            `INSERT INTO ${tableName} (title, description, user_id, created_at)
             VALUES (:title, :description, :userId, NOW()) RETURNING id;`,
            { replacements: { title, description, userId }, type: QueryTypes.INSERT }
        );

        res.status(201).json({ message: "Запис створено успішно.", id: newEntry[0].id });
    } catch (error) {
        console.error("[ERROR] ❌ Помилка створення запису:", error);
        res.status(500).json({ message: "Помилка створення запису", error: error.message });
    }
};

// ✅ Видалити запис
const deleteBlogEntry = async (req, res) => {
    try {
        const { entryId } = req.params;
        const userId = req.user.user_id;

        if (!entryId) {
            return res.status(400).json({ message: "❌ ID запису обов'язковий." });
        }

        const [result] = await sequelize.query(
            `DELETE FROM blog WHERE id = :entryId AND user_id = :userId RETURNING id;`,
            { replacements: { entryId, userId }, type: QueryTypes.DELETE }
        );

        if (!result.length) {
            const [ideaResult] = await sequelize.query(
                `DELETE FROM ideas WHERE id = :entryId AND user_id = :userId RETURNING id;`,
                { replacements: { entryId, userId }, type: QueryTypes.DELETE }
            );

            if (!ideaResult.length) {
                return res.status(404).json({ message: "❌ Запис не знайдено або у вас немає прав на видалення." });
            }
        }

        res.status(200).json({ message: "Запис видалено успішно." });
    } catch (error) {
        console.error("[ERROR] ❌ Помилка видалення запису:", error);
        res.status(500).json({ message: "Помилка видалення запису", error: error.message });
    }
};

// ✅ Експорт
module.exports = {
    authenticateUser,
    getAllEntries,
    createBlogEntry,
    deleteBlogEntry
};
