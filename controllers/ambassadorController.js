const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

/**
 * Middleware для перевірки токена
 */
const authenticateToken = (req, res, next) => {
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
    try {
        if (!req.user || !req.user.id) {
            console.warn("❌ [getLoggedAmbassador] Токен не містить userId!");
            return res.status(401).json({ message: "Не авторизований" });
        }

        const userId = req.user.id;
        console.log(`🛠 [getLoggedAmbassador] Виконується SQL-запит для user_id=${userId}`);

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
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ message: "❌ Невірний ID амбасадора." });
        }

        console.log(`🛠 [getAmbassadorById] Отримання амбасадора за ID=${id}`);

        const ambassador = await sequelize.query(
            `SELECT id, phone, email, first_name, last_name, user_id 
             FROM ambassadors WHERE id = :id LIMIT 1`,
            { replacements: { id }, type: QueryTypes.SELECT }
        );

        if (!ambassador.length) {
            return res.status(404).json({ message: "❌ Амбасадора не знайдено." });
        }

        console.log("✅ [getAmbassadorById] Амбасадор знайдено:", ambassador[0]);
        res.status(200).json(ambassador[0]);
    } catch (error) {
        console.error("❌ [getAmbassadorById] ПОМИЛКА ОТРИМАННЯ АМБАСАДОРА:", error.message);
        res.status(500).json({ message: "❌ Внутрішня помилка сервера.", error: error.message });
    }
};

/**
 * Отримання всіх амбасадорів
 */
const getAllAmbassadors = async (req, res) => {
    try {
        console.log("🔍 [getAllAmbassadors] Отримання списку всіх амбасадорів...");

        const ambassadors = await sequelize.query(
            `SELECT id, phone, position, email, first_name, last_name FROM ambassadors`,
            { type: QueryTypes.SELECT }
        );

        console.log(`✅ [getAllAmbassadors] Отримано ${ambassadors.length} амбасадорів.`);
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
    try {
        const ambassadorId = req.params.id;
        if (!ambassadorId || isNaN(ambassadorId)) {
            console.warn("❌ [getIdeasForAmbassador] ID не передано або некоректний");
            return res.status(400).json({ message: "ID амбасадора не передано або некоректний" });
        }

        console.log(`🛠 [getIdeasForAmbassador] Отримання ідей для амбасадора ID=${ambassadorId}`);

        const ideas = await sequelize.query(
            `SELECT i.id, i.title, i.description, i.status, u.first_name AS author_name, u.email AS author_email
             FROM ideas i
             JOIN users u ON i.user_id = u.id
             WHERE i.ambassador_id = :ambassadorId`,
            { replacements: { ambassadorId }, type: QueryTypes.SELECT }
        );

        if (!ideas.length) {
            console.warn("⚠️ [getIdeasForAmbassador] У амбасадора немає ідей.");
            return res.status(200).json({ message: "Цей амбасадор ще не має ідей." });
        }

        console.log(`✅ [getIdeasForAmbassador] Отримано ${ideas.length} ідей.`);
        res.status(200).json(ideas);
    } catch (error) {
        console.error("❌ [getIdeasForAmbassador] Помилка:", error.message);
        res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
    }
};

/**
 * Експорт функцій
 */
module.exports = {
    authenticateToken,
    getLoggedAmbassador,
    getAmbassadorById,
    getAllAmbassadors,
    getIdeasForAmbassador,
};
