const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Глобальне логування кожного запиту
const logRequest = (req) => {
    console.log(`\n--- 📡 [INCOMING REQUEST] ${req.method} ${req.originalUrl} ---`);
    console.log("🌐 IP:", req.ip);
    console.log("📥 Headers:", req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log("📦 Body:", req.body);
    }
};

/**
 * Middleware для перевірки токена
 */
const authenticateToken = (req, res, next) => {
    logRequest(req);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("❌ [AUTH] Відсутній або некоректний токен");
        return res.status(401).json({ message: "Не авторизований" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        console.log(`✅ [AUTH] Токен підтверджено, userId: ${decoded.id}`);
        next();
    } catch (error) {
        console.error("❌ [AUTH] Помилка перевірки токена:", error.message);
        return res.status(403).json({ message: "Недійсний токен" });
    }
};

/**
 * Отримання профілю залогіненого амбасадора
 */
const getLoggedAmbassador = async (req, res) => {
    logRequest(req);
    try {
        if (!req.user || !req.user.id) {
            console.warn("❌ [getLoggedAmbassador] Токен не містить userId!");
            return res.status(401).json({ message: "Не авторизований" });
        }

        const userId = req.user.id;
        console.log(`🛠 [getLoggedAmbassador] SQL-запит для user_id=${userId}`);

        const ambassador = await sequelize.query(
            `SELECT id, phone, position, email, first_name, last_name, user_id
             FROM ambassadors WHERE user_id = :userId LIMIT 1`,
            { replacements: { userId }, type: QueryTypes.SELECT }
        );

        if (!ambassador.length) {
            console.warn(`❌ [getLoggedAmbassador] Амбасадора не знайдено user_id=${userId}`);
            return res.status(404).json({ message: "Амбасадора не знайдено" });
        }

        console.log("✅ [getLoggedAmbassador] Амбасадор знайдено:", ambassador[0]);
        res.status(200).json(ambassador[0]);
    } catch (error) {
        console.error("❌ [getLoggedAmbassador] Помилка:", error.message);
        res.status(500).json({ message: "Помилка отримання амбасадора", error: error.message });
    }
};

/**
 * Отримання амбасадора за ID
 */
const getAmbassadorById = async (req, res) => {
    logRequest(req);
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            console.warn("❌ [getAmbassadorById] Невірний ID:", id);
            return res.status(400).json({ message: "Невірний ID амбасадора." });
        }

        console.log(`🛠 [getAmbassadorById] SQL-запит на ID=${id}`);

        const ambassador = await sequelize.query(
            `SELECT id, phone, email, first_name, last_name, user_id 
             FROM ambassadors WHERE id = :id LIMIT 1`,
            { replacements: { id }, type: QueryTypes.SELECT }
        );

        if (!ambassador.length) {
            console.warn("❌ [getAmbassadorById] Амбасадор не знайдений");
            return res.status(404).json({ message: "Амбасадора не знайдено." });
        }

        console.log("✅ [getAmbassadorById] Амбасадор знайдено:", ambassador[0]);
        res.status(200).json(ambassador[0]);
    } catch (error) {
        console.error("❌ [getAmbassadorById] Помилка:", error.message);
        res.status(500).json({ message: "Помилка отримання амбасадора", error: error.message });
    }
};

/**
 * Отримання всіх амбасадорів
 */
const getAllAmbassadors = async (req, res) => {
    logRequest(req);
    try {
        console.log("🔍 [getAllAmbassadors] SQL-запит на всіх амбасадорів");

        const ambassadors = await sequelize.query(
            `SELECT id, phone, position, email, first_name, last_name FROM ambassadors`,
            { type: QueryTypes.SELECT }
        );

        console.log(`✅ [getAllAmbassadors] Отримано ${ambassadors.length} амбасадорів`);
        res.status(200).json(ambassadors);
    } catch (error) {
        console.error("❌ [getAllAmbassadors] Помилка:", error.message);
        res.status(500).json({ message: "Помилка отримання амбасадорів", error: error.message });
    }
};

/**
 * Отримання ідей для амбасадора
 */
const getIdeasForAmbassador = async (req, res) => {
    logRequest(req);
    try {
        const ambassadorId = req.params.id;
        if (!ambassadorId || isNaN(ambassadorId)) {
            console.warn("❌ [getIdeasForAmbassador] ID амбасадора некоректний");
            return res.status(400).json({ message: "ID амбасадора не передано або некоректний" });
        }

        console.log(`🛠 [getIdeasForAmbassador] SQL-запит на ідеї для ID=${ambassadorId}`);

        const ideas = await sequelize.query(
            `SELECT i.id, i.title, i.description, i.status, 
                    u.first_name AS author_name, u.email AS author_email
             FROM ideas i
             JOIN users u ON i.user_id = u.id
             WHERE i.ambassador_id = :ambassadorId`,
            { replacements: { ambassadorId }, type: QueryTypes.SELECT }
        );

        console.log(`✅ [getIdeasForAmbassador] Отримано ${ideas.length} ідей`);
        res.status(200).json(ideas); // Навіть якщо їх 0 — повертається []
    } catch (error) {
        console.error("❌ [getIdeasForAmbassador] Помилка:", error.message);
        res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
    }
};

module.exports = {
    authenticateToken,
    getLoggedAmbassador,
    getAmbassadorById,
    getAllAmbassadors,
    getIdeasForAmbassador,
};
