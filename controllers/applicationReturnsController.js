const { QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * ✅ Повернення заявки секретарем (Запис у БД)
 */
const returnApplication = async (req, res) => {
    try {
        const { application_id, comment } = req.body;
        const secretary_id = req.user.id; // ID секретаря з токена

        if (!application_id || !comment) {
            return res.status(400).json({ message: "❌ Всі поля є обов'язковими!" });
        }

        console.log(`📌 Повернення заявки ID=${application_id} від секретаря ID=${secretary_id}`);

        // Отримати `user_id` (автора заявки)
        const application = await sequelize.query(
            `SELECT user_id FROM applications WHERE id = :application_id`,
            { replacements: { application_id }, type: QueryTypes.SELECT }
        );

        if (!application || application.length === 0) {
            return res.status(404).json({ message: "❌ Заявку не знайдено." });
        }

        const user_id = application[0].user_id; // Автор заявки

        // Запис у `application_returns`
        const [result] = await sequelize.query(
            `INSERT INTO application_returns (application_id, secretary_id, ambassador_id, comment, returned_at)
             VALUES (:application_id, :secretary_id, :ambassador_id, :comment, NOW()) RETURNING *`,
            {
                replacements: { application_id, secretary_id, ambassador_id: user_id, comment },
                type: QueryTypes.INSERT,
            }
        );

        console.log("✅ Заявка повернута:", result);
        res.status(201).json({ message: "✅ Заявка успішно повернена!", application_return: result });

    } catch (error) {
        console.error("[ERROR] ❌ Помилка повернення заявки:", error);
        res.status(500).json({ message: "❌ Помилка повернення заявки.", error: error.message });
    }
};

/**
 * ✅ Отримання повернених заявок для конкретного користувача (автора заявки)
 */
const getReturnedApplicationsForUser = async (req, res) => {
    try {
        const user_id = req.user.id; // Автор заявки (той, хто робить запит)

        console.log(`📌 Отримання повернених заявок для користувача ID=${user_id}`);

        // Вибірка повернених заявок для конкретного користувача
        const returnedApplications = await sequelize.query(
            `SELECT ar.id, ar.application_id, ar.comment, ar.returned_at,
                    a.title AS application_title, s.first_name AS secretary_name, s.last_name AS secretary_surname
             FROM application_returns ar
             JOIN applications a ON ar.application_id = a.id
             JOIN users s ON ar.secretary_id = s.id
             WHERE ar.ambassador_id = :user_id
             ORDER BY ar.returned_at DESC`,
            {
                replacements: { user_id },
                type: QueryTypes.SELECT,
            }
        );

        console.log(`✅ Отримано ${returnedApplications.length} повернених заявок.`);
        res.status(200).json(returnedApplications);

    } catch (error) {
        console.error("[ERROR] ❌ Помилка отримання повернених заявок:", error);
        res.status(500).json({ message: "❌ Помилка отримання повернених заявок.", error: error.message });
    }
};

console.log("🟢 Контролер `applicationReturnsController.js` завантажено!");
module.exports = {
    returnApplication,
    getReturnedApplicationsForUser
};
