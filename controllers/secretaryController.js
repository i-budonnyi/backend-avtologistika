const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db"); // Підключення до БД

// ✅ Отримання конкретного секретаря за ID
const getSecretaryById = async (req, res) => {
    try {
        const secretaryId = parseInt(req.params.id, 10);

        if (isNaN(secretaryId)) {
            console.warn("[getSecretaryById] ❌ Некоректний ID секретаря");
            return res.status(400).json({ message: "Некоректний ID секретаря" });
        }

        console.log(`[getSecretaryById] 🔍 Отримання секретаря ID=${secretaryId}`);

        // Логування запиту для відлагодження
        const secretary = await sequelize.query(
            `SELECT id, phone, email, first_name, last_name, user_id, role
             FROM secretaries WHERE id = :secretaryId LIMIT 1`,
            {
                replacements: { secretaryId },
                type: QueryTypes.SELECT,
            }
        );

        if (!secretary.length) {
            console.warn(`[getSecretaryById] ❌ Секретаря не знайдено ID=${secretaryId}`);
            return res.status(404).json({ message: "Секретаря не знайдено" });
        }

        console.log("[getSecretaryById] ✅ Секретар знайдено:", secretary[0]);
        res.status(200).json(secretary[0]);
    } catch (error) {
        console.error("[getSecretaryById] ❌ Помилка:", error);
        res.status(500).json({ message: "Помилка отримання секретаря", error: error.message });
    }
};


// ✅ Отримання всіх секретарів
const getAllSecretaries = async (req, res) => {
    try {
        console.log("[getAllSecretaries] 🔍 Отримання всіх секретарів");

        const secretaries = await sequelize.query(
            `SELECT id, phone, email, first_name, last_name, role FROM secretaries`,
            { type: QueryTypes.SELECT }
        );

        if (!secretaries.length) {
            console.warn("[getAllSecretaries] ⚠️ Немає секретарів у БД");
            return res.status(200).json({ message: "Секретарів не знайдено" });
        }

        console.log(`[getAllSecretaries] ✅ Отримано ${secretaries.length} секретарів.`);
        res.status(200).json(secretaries);
    } catch (error) {
        console.error("[getAllSecretaries] ❌ Помилка:", error);
        res.status(500).json({ message: "Помилка отримання секретарів", error: error.message });
    }
};

// ✅ Отримання заявок для секретаря
const fetchApplicationsBySecretary = async (req, res) => {
    try {
        const secretaryId = parseInt(req.params.id, 10);

        if (isNaN(secretaryId)) {
            console.warn("[fetchApplicationsBySecretary] ❌ Некоректний ID секретаря");
            return res.status(400).json({ message: "Некоректний ID секретаря" });
        }

        console.log(`[fetchApplicationsBySecretary] 🔍 Отримання заявок для секретаря ID=${secretaryId}`);

        const applications = await sequelize.query(
            `SELECT id, title, description, status, created_at 
             FROM applications WHERE jury_secretary_id = :secretaryId`,
            {
                replacements: { secretaryId },
                type: QueryTypes.SELECT,
            }
        );

        if (!applications.length) {
            console.warn(`[fetchApplicationsBySecretary] ⚠️ Немає заявок для секретаря ID=${secretaryId}`);
            return res.status(200).json({ message: "Немає заявок" });
        }

        console.log(`[fetchApplicationsBySecretary] ✅ Отримано ${applications.length} заявок.`);
        res.status(200).json(applications);
    } catch (error) {
        console.error("[fetchApplicationsBySecretary] ❌ Помилка:", error.message);
        res.status(500).json({ message: "Помилка отримання заявок", error: error.message });
    }
};

// ✅ Оновлений експорт
module.exports = {
    getSecretaryById,
    getAllSecretaries,
    fetchApplicationsBySecretary
};
