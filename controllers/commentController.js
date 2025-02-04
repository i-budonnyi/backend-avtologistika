const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Middleware для перевірки JWT
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Необхідно авторизуватися. Відсутній токен." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { user_id: decoded.user_id || decoded.id };

        if (!req.user.user_id) {
            return res.status(401).json({ message: "Не вдалося отримати userId." });
        }

        console.log(`[AUTH] ✅ Авторизовано користувача ID: ${req.user.user_id}`);
        next();
    } catch (error) {
        return res.status(403).json({ message: "Невірний або протермінований токен" });
    }
};

// ✅ Отримати всі коментарі для конкретного запису (блогу або ідеї)
const getCommentsByEntry = async (req, res) => {
    try {
        const { entry_id } = req.params;
        if (!entry_id) {
            return res.status(400).json({ error: "Необхідно вказати entry_id (ID блогу або ідеї)." });
        }

        console.log(`[getCommentsByEntry] 💬 Отримання коментарів для запису ID ${entry_id}`);

        const comments = await sequelize.query(
            `SELECT 
                c.id, 
                c.comment AS text, 
                c.created_at AS createdAt,
                u.id AS authorId, 
                CONCAT(u.first_name, ' ', u.last_name) AS authorName
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.entry_id = :entryId
            ORDER BY c.created_at DESC`,
            { replacements: { entryId: entry_id }, type: QueryTypes.SELECT }
        );

        console.log(`[getCommentsByEntry] ✅ Отримано ${comments.length} коментарів.`);
        res.status(200).json({ comments });
    } catch (error) {
        console.error("[getCommentsByEntry] ❌ Помилка отримання коментарів:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Додати новий коментар
const addComment = async (req, res) => {
    try {
        const { entry_id, text } = req.body;
        if (!entry_id || !text) {
            return res.status(400).json({ error: "ID запису і текст коментаря обов'язкові." });
        }

        const user_id = req.user.user_id;

        console.log(`[addComment] 💬 Додавання коментаря... User ID: ${user_id}, Entry ID: ${entry_id}`);

        await sequelize.query(
            `INSERT INTO comments (entry_id, user_id, comment, created_at)
            VALUES (:entryId, :userId, :text, NOW())`,
            {
                replacements: {
                    entryId: entry_id,
                    userId: user_id,
                    text,
                },
                type: QueryTypes.INSERT,
            }
        );

        console.log("[addComment] ✅ Коментар успішно додано.");
        res.status(201).json({ message: "Коментар успішно додано." });
    } catch (error) {
        console.error("[addComment] ❌ Помилка додавання коментаря:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Видалити коментар (тільки автор коментаря)
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;

        console.log(`[deleteComment] 🗑 Видалення коментаря ID ${id}...`);

        const [comment] = await sequelize.query(
            `SELECT id, user_id FROM comments WHERE id = :commentId`,
            { replacements: { commentId: id }, type: QueryTypes.SELECT }
        );

        if (!comment) {
            console.warn("[deleteComment] ❌ Коментар не знайдено.");
            return res.status(404).json({ error: "Коментар не знайдено." });
        }

        if (comment.user_id !== user_id) {
            console.warn("[deleteComment] ❌ Видалення заборонено. Це не ваш коментар.");
            return res.status(403).json({ error: "Видалення заборонено. Це не ваш коментар." });
        }

        await sequelize.query(
            `DELETE FROM comments WHERE id = :commentId`,
            { replacements: { commentId: id }, type: QueryTypes.DELETE }
        );

        console.log("[deleteComment] ✅ Коментар успішно видалено.");
        res.status(200).json({ message: "Коментар успішно видалено." });
    } catch (error) {
        console.error("[deleteComment] ❌ Помилка видалення коментаря:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Експорт контролерів коментарів
module.exports = {
    authenticateUser,
    getCommentsByEntry,
    addComment,
    deleteComment,
};
