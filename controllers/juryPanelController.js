const { QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * ✅ Отримати всіх членів журі
 */
const getAllJuryMembers = async (req, res) => {
    try {
        console.log("📌 Отримання всіх членів журі...");

        const juryMembers = await sequelize.query(
            `SELECT jm.user_id, jm.first_name, jm.last_name, jm.phone, jm.email, 
                    COALESCE(r.name, 'jury_member') AS role
             FROM jury_members jm
             LEFT JOIN user_roles ur ON jm.user_id = ur.user_id
             LEFT JOIN roles r ON ur.role_id = r.id
             ORDER BY jm.last_name ASC`,
            { type: QueryTypes.SELECT }
        );

        console.log(`✅ Знайдено ${juryMembers.length} членів журі.`);
        res.status(200).json(juryMembers);

    } catch (error) {
        console.error("❌ Помилка отримання членів журі:", error);
        res.status(500).json({ error: "Не вдалося отримати членів журі." });
    }
};

/**
 * ✅ Отримати конкретного члена журі за user_id
 */
const getJuryMemberById = async (req, res) => {
    try {
        let { user_id } = req.params;
        user_id = Number(user_id);

        if (isNaN(user_id)) {
            return res.status(400).json({ error: "Некоректний user_id." });
        }

        console.log(`📌 Отримання інформації про члена журі з user_id=${user_id}`);

        const juryMember = await sequelize.query(
            `SELECT jm.user_id, jm.first_name, jm.last_name, jm.phone, jm.email, 
                    COALESCE(r.name, 'jury_member') AS role
             FROM jury_members jm
             LEFT JOIN user_roles ur ON jm.user_id = ur.user_id
             LEFT JOIN roles r ON ur.role_id = r.id
             WHERE jm.user_id = :user_id
             LIMIT 1`,
            {
                replacements: { user_id },
                type: QueryTypes.SELECT,
            }
        );

        if (!juryMember.length) {
            return res.status(404).json({ error: "Член журі не знайдений." });
        }

        console.log("✅ Член журі знайдений:", juryMember[0]);
        res.status(200).json(juryMember[0]);

    } catch (error) {
        console.error("❌ Помилка отримання члена журі:", error);
        res.status(500).json({ error: "Не вдалося отримати члена журі." });
    }
};

/** ✅ Отримати поточного залогіненого члена журі */
const getLoggedJuryMember = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Користувач не автентифікований." });
        }

        let user_id = Number(req.user.id);

        if (isNaN(user_id)) {
            return res.status(400).json({ error: "Некоректний user_id." });
        }

        console.log(`📌 Отримання даних журі для user_id=${user_id}`);

        const juryMember = await sequelize.query(
            `SELECT jm.user_id, jm.first_name, jm.last_name, jm.phone, jm.email, 
                    COALESCE(r.name, 'jury_member') AS role
             FROM jury_members jm
             LEFT JOIN user_roles ur ON jm.user_id = ur.user_id
             LEFT JOIN roles r ON ur.role_id = r.id
             WHERE jm.user_id = :user_id
             LIMIT 1`,
            {
                replacements: { user_id },
                type: QueryTypes.SELECT,
            }
        );

        if (!juryMember.length) {
            return res.status(404).json({ error: "Член журі не знайдений." });
        }

        console.log("📢 Відповідь сервера на /api/juryPanel/me:", juryMember[0]);

        res.status(200).json(juryMember[0]);

    } catch (error) {
        console.error("❌ Помилка отримання залогіненого члена журі:", error);
        res.status(500).json({ error: "Не вдалося отримати члена журі.", details: error.message });
    }
};

console.log("🟢 Контролер juryPanelController.js завантажено!");
module.exports = { getAllJuryMembers, getJuryMemberById, getLoggedJuryMember };
