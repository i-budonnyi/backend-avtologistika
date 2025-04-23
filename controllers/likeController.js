const sequelize = require("../config/database"); // ✅ Підключення до бази
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
        const { entry_id, entry_type } = req.body;
        let user_id = req.user?.user_id || getUserIdFromToken(req);

        if (!user_id) {
            console.error("[toggleLike] ❌ Відсутній user_id");
            return res.status(401).json({ message: "Необхідно авторизуватися." });
        }

        if (!entry_id || !entry_type) {
            console.error("[toggleLike] ❌ Відсутній entry_id або entry_type");
            return res.status(400).json({ message: "Необхідно передати entry_id та entry_type." });
        }

        console.log(`[toggleLike] 💬 entry_id = ${entry_id}, entry_type = ${entry_type}, user_id = ${user_id}`);

        const column = entry_type === "blog" ? "blog_id" : "idea_id";

        // Перевіряємо, чи лайк вже існує
        const existingLike = await sequelize.query(
            `SELECT id FROM likes WHERE user_id = :user_id AND ${column} = :entry_id`,
            { replacements: { user_id, entry_id }, type: QueryTypes.SELECT }
        );

        if (existingLike.length) {
            await sequelize.query(
                `DELETE FROM likes WHERE id = :like_id`,
                { replacements: { like_id: existingLike[0].id }, type: QueryTypes.DELETE }
            );
            console.log("[toggleLike] ✅ Лайк видалено.");
            return res.status(200).json({ liked: false, message: "Лайк видалено." });
        } else {
            await sequelize.query(
                `INSERT INTO likes (user_id, ${column}, created_at) 
                 VALUES (:user_id, :entry_id, NOW())`,
                { replacements: { user_id, entry_id }, type: QueryTypes.INSERT }
            );
            console.log("[toggleLike] ✅ Лайк додано.");
            return res.status(201).json({ liked: true, message: "Лайк успішно додано." });
        }
    } catch (error) {
        console.error("[toggleLike] ❌ Помилка:", error);
        res.status(500).json({ message: "Помилка сервера.", error: error.message });
    }
};

// ✅ Отримання всіх лайків для конкретного запису
const getLikesByEntryId = async (req, res) => {
    try {
        const { entry_id } = req.params;
        let user_id = req.user?.user_id || getUserIdFromToken(req);

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

        const userLiked = likes.some(like => like.user_id === user_id);
        console.log(`[getLikesByEntryId] ✅ Отримано ${likes.length} лайків.`);

        res.status(200).json({ likesCount: likes.length, userLiked, likedBy: likes });
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
