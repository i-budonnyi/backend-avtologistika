const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// 🔐 Middleware авторизації
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Необхідно авторизуватися. Токен відсутній." });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user_id = decoded.user_id || decoded.id;

        if (!user_id) {
            return res.status(401).json({ message: "Некоректний токен: user_id відсутній." });
        }

        req.user = { user_id };
        console.log(`[AUTH] ✅ Авторизовано користувача ID: ${user_id}`);
        next();
    } catch (error) {
        console.error("[AUTH] ❌", error.message);
        return res.status(403).json({ message: "Невірний або протермінований токен" });
    }
};

// 📥 Отримати всі коментарі для запису
const getCommentsByEntry = async (req, res) => {
    const { entry_id } = req.params;
    if (!entry_id) return res.status(400).json({ error: "Не вказано entry_id." });

    try {
        const comments = await sequelize.query(
            `SELECT 
                c.id, 
                c.comment AS text,
                c.created_at AS createdAt,
                u.id AS authorId,
                CONCAT(u.first_name, ' ', u.last_name) AS authorName,
                CASE 
                    WHEN c.blog_id IS NOT NULL THEN 'blog'
                    WHEN c.idea_id IS NOT NULL THEN 'idea'
                    WHEN c.problem_id IS NOT NULL THEN 'problem'
                END AS entry_type
             FROM comments c
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.blog_id = :entry_id OR c.idea_id = :entry_id OR c.problem_id = :entry_id
             ORDER BY c.created_at DESC`,
            { replacements: { entry_id }, type: QueryTypes.SELECT }
        );

        res.status(200).json({ comments });
    } catch (err) {
        console.error("[getCommentsByEntry] ❌", err.message);
        res.status(500).json({ error: err.message });
    }
};

// ➕ Додати коментар
const addComment = async (req, res) => {
    const { entry_id, entry_type, text } = req.body;
    const user_id = req.user?.user_id;

    if (!entry_id || !entry_type || !text || !user_id) {
        return res.status(400).json({ error: "Всі поля обов'язкові (entry_id, entry_type, text, user_id)." });
    }

    const column =
        entry_type === "blog" ? "blog_id" :
        entry_type === "idea" ? "idea_id" :
        entry_type === "problem" ? "problem_id" : null;

    if (!column) {
        return res.status(400).json({ error: "Невідомий тип запису." });
    }

    try {
        await sequelize.query(
            `INSERT INTO comments (${column}, user_id, comment, created_at, updated_at)
             VALUES (:entry_id, :user_id, :text, NOW(), NOW())`,
            {
                replacements: { entry_id, user_id, text },
                type: QueryTypes.INSERT,
            }
        );

        console.log(`[addComment] ✅ Додано коментар до ${entry_type} ID ${entry_id} від користувача ${user_id}`);
        res.status(201).json({ message: "Коментар успішно додано." });
    } catch (err) {
        console.error("[addComment] ❌", err.message);
        res.status(500).json({ error: err.message });
    }
};

// 🗑 Видалити коментар
const deleteComment = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user?.user_id;

    if (!id || !user_id) {
        return res.status(400).json({ error: "Необхідно передати ID коментаря і бути авторизованим." });
    }

    try {
        const [comment] = await sequelize.query(
            `SELECT id, user_id FROM comments WHERE id = :comment_id`,
            { replacements: { comment_id: id }, type: QueryTypes.SELECT }
        );

        if (!comment) return res.status(404).json({ error: "Коментар не знайдено." });
        if (comment.user_id !== user_id)
            return res.status(403).json({ error: "Видалення заборонене. Це не ваш коментар." });

        await sequelize.query(
            `DELETE FROM comments WHERE id = :comment_id`,
            { replacements: { comment_id: id }, type: QueryTypes.DELETE }
        );

        console.log(`[deleteComment] ✅ Видалено коментар ID ${id}`);
        res.status(200).json({ message: "Коментар успішно видалено." });
    } catch (err) {
        console.error("[deleteComment] ❌", err.message);
        res.status(500).json({ error: err.message });
    }
};

// 📦 Експорт
module.exports = {
    authenticateUser,
    getCommentsByEntry,
    addComment,
    deleteComment,
};
