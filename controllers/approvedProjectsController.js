const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db"); // Підключення до БД

const approvedProjectsController = {
    // 📌 Отримати інформацію про конкретного PM за його ID
    getProjectManagerById: async (req, res) => {
        try {
            const { pmId } = req.params; // Отримуємо ID PM з URL

            const result = await sequelize.query(
                `SELECT 
                    pm.id AS pm_id, 
                    pm.first_name, 
                    pm.last_name, 
                    pm.phone, 
                    pm.email, 
                    u.role
                FROM project_managers pm
                LEFT JOIN users u ON pm.id = u.id
                WHERE pm.id = :pmId;`,
                {
                    replacements: { pmId }, // Параметризований запит для захисту від SQL-ін'єкцій
                    type: QueryTypes.SELECT
                }
            );

            if (result.length === 0) {
                return res.status(404).json({ message: "Проєктного менеджера не знайдено" });
            }

            res.status(200).json(result[0]);
        } catch (error) {
            console.error("[getProjectManagerById] ❌ Помилка отримання PM за ID:", error);
            res.status(500).json({ message: "Помилка отримання даних" });
        }
    },

    // 📌 Отримати всі фінальні рішення журі
    getFinalJuryDecisions: async (req, res) => {
        try {
            console.log("📌 Отримуємо фінальні рішення журі...");

            const decisions = await sequelize.query(
                `SELECT 
                    fjd.project_id, 
                    u.first_name AS author_first_name,
                    u.last_name AS author_last_name,
                    jm.first_name AS jury_first_name,
                    jm.last_name AS jury_last_name,
                    fjd.decision_text,
                    fjd.final_decision,
                    fjd.decision_date
                FROM final_jury_decisions fjd
                LEFT JOIN users u ON fjd.user_id = u.id
                LEFT JOIN jury_members jm ON fjd.jury_member_id = jm.id
                ORDER BY fjd.decision_date DESC;`,
                { type: QueryTypes.SELECT }
            );

            if (decisions.length === 0) {
                return res.status(404).json({ message: "Немає фінальних рішень журі" });
            }

            res.status(200).json(decisions);
        } catch (error) {
            console.error("❌ Помилка отримання фінальних рішень журі:", error);
            res.status(500).json({ error: "Не вдалося отримати фінальні рішення журі." });
        }
    }
};

// 📌 Експорт контролера
module.exports = approvedProjectsController;
