const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");

const approvedProjectsController = {
  // 📌 Отримати інформацію про конкретного PM за його ID
  getProjectManagerById: async (req, res) => {
    try {
      console.log("🟢 [getProjectManagerById] Виклик контролера");
      console.log("📥 Headers:", req.headers);
      console.log("📥 req.user:", req.user);
      console.log("📥 req.params:", req.params);

      const { pmId } = req.params;

      if (!pmId) {
        console.warn("⚠️ Не передано параметр pmId");
        return res.status(400).json({ message: "Не вказано ID проектного менеджера" });
      }

      console.log(`🔍 Шукаємо PM з id = ${pmId}`);

      const result = await sequelize.query(
        `
        SELECT 
          pm.id AS pm_id, 
          pm.first_name, 
          pm.last_name, 
          pm.phone, 
          pm.email, 
          u.role
        FROM project_managers pm
        LEFT JOIN users u ON pm.id = u.id
        WHERE pm.id = :pmId;
        `,
        {
          replacements: { pmId },
          type: QueryTypes.SELECT
        }
      );

      console.log("📦 SQL результат:", result);

      if (!result || result.length === 0) {
        console.warn(`❗️PM з id ${pmId} не знайдено`);
        return res.status(404).json({ message: "Проєктного менеджера не знайдено" });
      }

      console.log("✅ Повертаємо PM:", result[0]);
      return res.status(200).json(result[0]);
    } catch (error) {
      console.error("❌ [getProjectManagerById] Помилка:", error);
      return res.status(500).json({ message: "Помилка отримання даних", error: error.message });
    }
  },

  // 📌 Отримати всі фінальні рішення журі
  getFinalJuryDecisions: async (req, res) => {
    try {
      console.log("🟢 [getFinalJuryDecisions] Отримуємо фінальні рішення журі...");
      console.log("📥 Headers:", req.headers);
      console.log("📥 req.user:", req.user);

      const decisions = await sequelize.query(
        `
        SELECT 
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
        ORDER BY fjd.decision_date DESC;
        `,
        { type: QueryTypes.SELECT }
      );

      console.log("📦 SQL результат рішень:", decisions);

      if (!decisions || decisions.length === 0) {
        console.warn("⚠️ Немає жодного запису у фінальних рішеннях");
        return res.status(404).json({ message: "Немає фінальних рішень журі" });
      }

      console.log(`✅ Повертаємо ${decisions.length} рішень`);
      return res.status(200).json(decisions);
    } catch (error) {
      console.error("❌ [getFinalJuryDecisions] Помилка:", error);
      return res.status(500).json({
        message: "Не вдалося отримати фінальні рішення журі.",
        error: error.message
      });
    }
  }
};

module.exports = approvedProjectsController;
