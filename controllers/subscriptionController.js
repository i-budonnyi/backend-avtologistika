const sequelize = require("../config/database");
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

// ✅ Отримати всіх підписників запису (блог або ідея)
const getSubscribers = async (req, res) => {
    try {
        const { entry_id } = req.params;
        if (!entry_id) {
            return res.status(400).json({ error: "Необхідно вказати entry_id (ID блогу або ідеї)." });
        }

        console.log(`[getSubscribers] 💬 Отримання підписників для запису ID ${entry_id}`);

        const subscribers = await sequelize.query(
            `SELECT u.id AS user_id, CONCAT(u.first_name, ' ', u.last_name) AS user_name
             FROM subscriptions s
             JOIN users u ON s.user_id = u.id
             WHERE s.blog_id = :entry_id OR s.idea_id = :entry_id`,
            { replacements: { entry_id }, type: QueryTypes.SELECT }
        );

        console.log(`[getSubscribers] ✅ Отримано ${subscribers.length} підписників.`);
        res.status(200).json({ subscribersCount: subscribers.length, subscribers });
    } catch (error) {
        console.error("[getSubscribers] ❌ Помилка отримання підписників:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Отримати всі підписки конкретного користувача
const getSubscriptions = async (req, res) => {
    try {
        const user_id = req.user?.user_id || getUserIdFromToken(req);
        if (!user_id) {
            return res.status(401).json({ error: "Необхідно авторизуватися." });
        }

        console.log(`[getSubscriptions] 💬 Отримання підписок для користувача ID ${user_id}`);

        const subscriptions = await sequelize.query(
            `SELECT s.blog_id, s.idea_id, 
                COALESCE(b.title, i.title) AS title,
                CASE WHEN b.id IS NOT NULL THEN 'blog' ELSE 'idea' END AS type
             FROM subscriptions s
             LEFT JOIN blog b ON s.blog_id = b.id
             LEFT JOIN ideas i ON s.idea_id = i.id
             WHERE s.user_id = :user_id`,
            { replacements: { user_id }, type: QueryTypes.SELECT }
        );

        console.log(`[getSubscriptions] ✅ Отримано ${subscriptions.length} підписок.`);
        res.status(200).json({ subscriptions });
    } catch (error) {
        console.error("[getSubscriptions] ❌ Помилка отримання підписок:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Підписатися на запис (блог або ідея)
const subscribeToEntry = async (req, res) => {
    try {
        const { entry_id } = req.body;
        const user_id = req.user?.user_id || getUserIdFromToken(req);

        if (!user_id) {
            return res.status(401).json({ error: "Необхідно авторизуватися." });
        }

        if (!entry_id) {
            return res.status(400).json({ error: "Необхідно вказати ID запису (блог або ідея)." });
        }

        console.log(`[subscribeToEntry] 💬 Користувач ${user_id} підписується на запис ${entry_id}`);

        // Перевіряємо, чи вже є підписка
        const existingSubscription = await sequelize.query(
            `SELECT id FROM subscriptions WHERE user_id = :user_id AND (blog_id = :entry_id OR idea_id = :entry_id)`,
            { replacements: { user_id, entry_id }, type: QueryTypes.SELECT }
        );

        if (existingSubscription.length) {
            console.warn("[subscribeToEntry] ⚠️ Користувач вже підписаний.");
            return res.status(400).json({ error: "Ви вже підписані на цей запис." });
        }

        // Додаємо підписку
        await sequelize.query(
            `INSERT INTO subscriptions (user_id, blog_id, idea_id, created_at)
             VALUES (:user_id, :blog_id, :idea_id, NOW())`,
            { replacements: { user_id, blog_id: entry_id, idea_id: null }, type: QueryTypes.INSERT }
        );

        console.log("[subscribeToEntry] ✅ Підписка додана.");
        res.status(201).json({ message: "Ви успішно підписалися на запис." });
    } catch (error) {
        console.error("[subscribeToEntry] ❌ Помилка підписки:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Відписатися від запису (блог або ідея)
const unsubscribeFromEntry = async (req, res) => {
    try {
        const { entry_id } = req.body;
        const user_id = req.user?.user_id || getUserIdFromToken(req);

        if (!user_id) {
            return res.status(401).json({ error: "Необхідно авторизуватися." });
        }

        if (!entry_id) {
            return res.status(400).json({ error: "Необхідно вказати ID запису (блог або ідея)." });
        }

        console.log(`[unsubscribeFromEntry] 💬 Користувач ${user_id} відписується від запису ${entry_id}`);

        // Видаляємо підписку
        const result = await sequelize.query(
            `DELETE FROM subscriptions WHERE user_id = :user_id AND (blog_id = :entry_id OR idea_id = :entry_id) RETURNING id`,
            { replacements: { user_id, entry_id }, type: QueryTypes.DELETE }
        );

        if (!result.length) {
            return res.status(404).json({ error: "Ви не були підписані на цей запис." });
        }

        console.log("[unsubscribeFromEntry] ✅ Підписка видалена.");
        res.status(200).json({ message: "Ви успішно відписалися." });
    } catch (error) {
        console.error("[unsubscribeFromEntry] ❌ Помилка відписки:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ **Правильний експорт**
module.exports = {
    getSubscribers,
    getSubscriptions,
    subscribeToEntry,
    unsubscribeFromEntry
};
