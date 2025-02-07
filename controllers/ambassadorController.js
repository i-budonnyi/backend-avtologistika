const sequelize = require("../config/database");

// ✅ Отримання амбасадора за userId (для внутрішнього використання)
const getLoggedAmbassador = async (userId) => {
    try {
        console.log(`[ambassadorController] 🔍 Отримання амбасадора для userId=${userId}`);

        const [ambassador] = await sequelize.query(
            `SELECT id, phone, position, email, first_name, last_name 
             FROM ambassadors 
             WHERE user_id = :userId LIMIT 1`,
            {
                replacements: { userId },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!ambassador) {
            console.warn(`[ambassadorController] ❌ Амбасадора не знайдено userId=${userId}`);
            return null;
        }

        console.log("[ambassadorController] ✅ Амбасадор знайдено:", ambassador);
        return ambassador;
    } catch (error) {
        console.error("[ambassadorController] ❌ Помилка отримання амбасадора:", error);
        throw error;
    }
};

// ✅ Створення нового амбасадора
const createAmbassador = async (req, res) => {
    try {
        console.log("[createAmbassador] 📥 Отримано запит:", req.body);

        const { phone, position, email, first_name, last_name, user_id } = req.body;

        if (!phone || !position || !email || !first_name || !last_name || !user_id) {
            console.warn("[createAmbassador] ❌ Відсутні обов'язкові поля!");
            return res.status(400).json({ message: "Всі поля є обов'язковими!" });
        }

        console.log("[createAmbassador] 🛠 Виконується SQL-запит...");

        await sequelize.query(
            `INSERT INTO ambassadors (phone, position, email, first_name, last_name, user_id)
             VALUES (:phone, :position, :email, :first_name, :last_name, :user_id)`,
            {
                replacements: { phone, position, email, first_name, last_name, user_id },
                type: sequelize.QueryTypes.INSERT,
            }
        );

        console.log("[createAmbassador] ✅ Амбасадор успішно створений.");
        res.status(201).json({ message: "Амбасадор створений" });
    } catch (error) {
        console.error("[createAmbassador] ❌ Помилка:", error);
        res.status(500).json({ message: "Помилка створення амбасадора", error: error.message });
    }
};

// ✅ Отримання всіх амбасадорів
const getAllAmbassadors = async (req, res) => {
    try {
        console.log("[getAllAmbassadors] 📤 Отримання всіх амбасадорів...");

        const ambassadors = await sequelize.query(
            `SELECT id, phone, position, email, first_name, last_name FROM ambassadors`,
            { type: sequelize.QueryTypes.SELECT }
        );

        console.log(`[getAllAmbassadors] ✅ Отримано ${ambassadors.length} амбасадорів.`);
        res.status(200).json(ambassadors);
    } catch (error) {
        console.error("[getAllAmbassadors] ❌ Помилка:", error);
        res.status(500).json({ message: "Помилка отримання амбасадорів", error: error.message });
    }
};

// ✅ Отримання залогіненого амбасадора
const getLoggedAmbassadorController = async (req, res) => {
    try {
        console.log("[getLoggedAmbassador] 🔍 Перевірка авторизації:", req.user);

        if (!req.user || !req.user.userId) {
            console.warn("[getLoggedAmbassador] ❌ Токен не містить userId!");
            return res.status(401).json({ message: "Не авторизований" });
        }

        const userId = req.user.userId;
        console.log(`[getLoggedAmbassador] 🛠 Виконується SQL-запит для user_id=${userId}`);

        const ambassador = await sequelize.query(
            `SELECT id, phone, position, email, first_name, last_name 
             FROM ambassadors WHERE user_id = :userId LIMIT 1`,
            {
                replacements: { userId },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        console.log(`[getLoggedAmbassador] 🔎 Результат SQL-запиту:`, ambassador);

        if (!ambassador.length) {
            console.warn(`[getLoggedAmbassador] ❌ Амбасадора не знайдено user_id=${userId}`);
            return res.status(404).json({ message: "Амбасадора не знайдено" });
        }

        console.log("[getLoggedAmbassador] ✅ Амбасадор знайдено:", ambassador[0]);
        res.status(200).json(ambassador[0]);
    } catch (error) {
        console.error("[getLoggedAmbassador] ❌ Помилка:", error);
        res.status(500).json({ message: "Помилка отримання амбасадора", error: error.message });
    }
};

// ✅ Отримання ідей амбасадора
const getIdeasForAmbassador = async (req, res) => {
    try {
        const ambassadorId = req.params.id;
        console.log(`[getIdeasForAmbassador] 🔍 Отримуємо ідеї для амбасадора ID=${ambassadorId}`);

        if (!ambassadorId) {
            console.warn("[getIdeasForAmbassador] ❌ ID не передано");
            return res.status(400).json({ message: "ID амбасадора не передано" });
        }

        const ideas = await sequelize.query(
            `SELECT i.id, i.title, i.description, i.status, u.first_name AS author_name, u.email AS author_email
             FROM ideas i
             JOIN users u ON i.user_id = u.id
             WHERE i.ambassador_id = :ambassadorId`,
            {
                replacements: { ambassadorId },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!ideas.length) {
            console.warn("[getIdeasForAmbassador] ⚠️ У амбасадора немає ідей.");
            return res.status(200).json({ message: "Цей амбасадор ще не має ідей." });
        }

        console.log(`[getIdeasForAmbassador] ✅ Отримано ${ideas.length} ідей.`);
        res.status(200).json(ideas);
    } catch (error) {
        console.error("[getIdeasForAmbassador] ❌ Помилка:", error);
        res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
    }
};

// ✅ Виправлений експорт
module.exports = {
    createAmbassador,
    getAllAmbassadors,
    getLoggedAmbassador: getLoggedAmbassadorController, // ❗️ ВАЖЛИВО! Змінив, щоб відповідало імпорту
    getIdeasForAmbassador,
};
