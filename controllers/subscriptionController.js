const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Функція отримання user_id з JWT
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

// ✅ Отримати всі підписки користувача
const getSubscriptions = async (req, res) => {
    try {
        const user_id = getUserIdFromToken(req);
        if (!user_id) {
            return res.status(401).json({ error: "Необхідно авторизуватися." });
        }

        console.log(`[getSubscriptions] 💬 Отримання підписок для користувача ID ${user_id}`);

        const subscriptions = await sequelize.query(
            `SELECT 
                s.blog_id, s.idea_id, s.problem_id,
                COALESCE(b.title, i.title, p.title) AS title,
                COALESCE(b.description, i.description, p.description) AS description,
                COALESCE(i.status, p.status, 'N/A') AS status, -- Переконуємось, що статус завжди є
                CASE 
                    WHEN s.blog_id IS NOT NULL THEN 'blog' 
                    WHEN s.idea_id IS NOT NULL THEN 'idea' 
                    WHEN s.problem_id IS NOT NULL THEN 'problem'
                END AS type,
                COALESCE(b.user_id, i.user_id, p.user_id) AS author_id,
                u.first_name AS author_first_name,
                u.last_name AS author_last_name
             FROM subscriptions s
             LEFT JOIN blog b ON s.blog_id = b.id
             LEFT JOIN ideas i ON s.idea_id = i.id
             LEFT JOIN problems p ON s.problem_id = p.id
             LEFT JOIN users u ON u.id = COALESCE(b.user_id, i.user_id, p.user_id) 
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

// ✅ Підписатися на запис (блог, ідея, проблема)
const subscribeToEntry = async (req, res) => {
    try {
        const { entry_id, entry_type } = req.body;
        const user_id = getUserIdFromToken(req);

        if (!user_id) {
            return res.status(401).json({ error: "Необхідно авторизуватися." });
        }

        if (!entry_id || !entry_type) {
            return res.status(400).json({ error: "Необхідно вказати ID запису та його тип (blog, idea, problem)." });
        }

        console.log(`[subscribeToEntry] 💬 Користувач ${user_id} підписується на запис ${entry_id} (${entry_type})`);

        let column = entry_type === "blog" ? "blog_id"
                     : entry_type === "idea" ? "idea_id"
                     : "problem_id";

        const existingSubscription = await sequelize.query(
            `SELECT id FROM subscriptions WHERE user_id = :user_id AND ${column} = :entry_id`,
            { replacements: { user_id, entry_id }, type: QueryTypes.SELECT }
        );

        if (existingSubscription.length) {
            return res.status(400).json({ error: "Ви вже підписані на цей запис." });
        }

        await sequelize.query(
            `INSERT INTO subscriptions (user_id, ${column}, created_at) VALUES (:user_id, :entry_id, NOW())`,
            { replacements: { user_id, entry_id }, type: QueryTypes.INSERT }
        );

        console.log("[subscribeToEntry] ✅ Підписка додана.");
        res.status(201).json({ message: "Ви успішно підписалися на запис." });
    } catch (error) {
        console.error("[subscribeToEntry] ❌ Помилка підписки:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Відписатися від запису (блог, ідея, проблема)
const unsubscribeFromEntry = async (req, res) => {
    try {
        const { entry_id, entry_type } = req.body;
        const user_id = getUserIdFromToken(req);

        if (!user_id) {
            return res.status(401).json({ error: "Необхідно авторизуватися." });
        }

        if (!entry_id || !entry_type) {
            return res.status(400).json({ error: "Необхідно вказати ID запису та його тип (blog, idea, problem)." });
        }

        console.log(`[unsubscribeFromEntry] 💬 Користувач ${user_id} відписується від запису ${entry_id} (${entry_type})`);

        let column = entry_type === "blog" ? "blog_id"
                     : entry_type === "idea" ? "idea_id"
                     : "problem_id";

        await sequelize.query(
            `DELETE FROM subscriptions WHERE user_id = :user_id AND ${column} = :entry_id`,
            { replacements: { user_id, entry_id }, type: QueryTypes.DELETE }
        );

        console.log("[unsubscribeFromEntry] ✅ Підписка видалена.");
        res.status(200).json({ message: "Ви успішно відписалися." });
    } catch (error) {
        console.error("[unsubscribeFromEntry] ❌ Помилка відписки:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ **Експорт**
module.exports = {
    getSubscriptions,
    subscribeToEntry,
    unsubscribeFromEntry
};
