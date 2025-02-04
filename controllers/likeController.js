const sequelize = require("../config/database"); // ✅ Виправлено імпорт
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Функція для отримання user_id з JWT
const getUserIdFromToken = (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        console.log("[AUTH] 🔑 Декодований токен:", decoded);

        return decoded.user_id || decoded.id || null;
    } catch (error) {
        console.error("❌ Помилка декодування токена:", error.message);
        return null;
    }
};

// ✅ Додавання або видалення лайка
const toggleLike = async (req, res) => {
    try {
        const { blog_id, idea_id } = req.body;
        let user_id = req.user?.user_id || getUserIdFromToken(req);

        if (!user_id) {
            console.error("[toggleLike] ❌ Відсутній user_id");
            return res.status(401).json({ message: "Необхідно авторизуватися." });
        }

        if (!blog_id && !idea_id) {
            console.error("[toggleLike] ❌ Відсутній blog_id або idea_id");
            return res.status(400).json({ message: "Необхідно передати blog_id або idea_id." });
        }

        console.log(`[toggleLike] 💬 blog_id = ${blog_id || "N/A"}, idea_id = ${idea_id || "N/A"}, user_id = ${user_id}`);

        // Перевіряємо чи лайк існує
        const existingLike = await sequelize.query(
            `SELECT id FROM likes WHERE user_id = :user_id AND (blog_id = :blog_id OR idea_id = :idea_id)`,
            { replacements: { user_id, blog_id: blog_id || null, idea_id: idea_id || null }, type: QueryTypes.SELECT }
        );

        if (existingLike.length) {
            await sequelize.query(
                `DELETE FROM likes WHERE id = :like_id RETURNING *`,
                { replacements: { like_id: existingLike[0].id }, type: QueryTypes.DELETE }
            );
            console.log("[toggleLike] ✅ Лайк видалено.");
            return res.status(200).json({ liked: false, message: "Лайк видалено." });
        } else {
            await sequelize.query(
                `INSERT INTO likes (user_id, blog_id, idea_id, created_at) 
                 VALUES (:user_id, :blog_id, :idea_id, NOW()) RETURNING *`,
                { replacements: { user_id, blog_id: blog_id || null, idea_id: idea_id || null }, type: QueryTypes.INSERT }
            );
            console.log("[toggleLike] ✅ Лайк додано.");
            return res.status(201).json({ liked: true, message: "Лайк успішно додано." });
        }
    } catch (error) {
        console.error("[toggleLike] ❌ Помилка:", error);
        res.status(500).json({ message: "Помилка сервера.", error: error.message });
    }
};

// ✅ Отримання всіх лайків для блогу або ідеї
const getLikesByEntryId = async (req, res) => {
    try {
        const { entry_id } = req.params;
        if (!entry_id) {
            console.error("[getLikesByEntryId] ❌ Відсутній entry_id");
            return res.status(400).json({ message: "Необхідно вказати entry_id." });
        }

        console.log(`[getLikesByEntryId] 💬 Перевірка лайків для запису з ID ${entry_id}`);

        const likes = await sequelize.query(
            `SELECT u.id AS user_id, CONCAT(u.first_name, ' ', u.last_name) AS user_name 
             FROM likes l 
             JOIN users u ON l.user_id = u.id 
             WHERE l.blog_id = :entry_id OR l.idea_id = :entry_id`,
            { replacements: { entry_id }, type: QueryTypes.SELECT }
        );

        console.log(`[getLikesByEntryId] ✅ Отримано ${likes.length} лайків.`);
        res.status(200).json({ likesCount: likes.length, likedBy: likes });
    } catch (error) {
        console.error("[getLikesByEntryId] ❌ Помилка:", error);
        res.status(500).json({ message: "Помилка сервера.", error: error.message });
    }
};

// ✅ Отримати всі лайки всіх користувачів по блогах та ідеях
const getUserLikes = async (req, res) => {
    try {
        console.log("[getUserLikes] 💬 Отримання всіх лайків");

        const likes = await sequelize.query(
            `SELECT l.blog_id, l.idea_id, l.user_id, CONCAT(u.first_name, ' ', u.last_name) AS user_name 
             FROM likes l 
             JOIN users u ON l.user_id = u.id`,
            { type: QueryTypes.SELECT }
        );

        if (!likes.length) {
            console.log("[getUserLikes] ❌ Немає лайків у системі.");
            return res.status(200).json([]);
        }

        console.log("[getUserLikes] ✅ Лайки успішно отримані.");
        res.status(200).json(likes);
    } catch (error) {
        console.error("[getUserLikes] ❌ Помилка:", error);
        res.status(500).json({ message: "Помилка сервера.", error: error.message });
    }
};

// ✅ Експорт контролерів лайків
module.exports = {
    toggleLike,
    getLikesByEntryId,
    getUserLikes,
};
