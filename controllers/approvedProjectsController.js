/* ────────────────────────────────────────────────────────────────── */
/*  approvedProjectsController.js                                    */
/* ────────────────────────────────────────────────────────────────── */
const { QueryTypes } = require("sequelize");
const sequelize     = require("../config/db"); // <-- your Sequelize instance

const approvedProjectsController = {
  /* ──────────────────────────────────────────────────────────────── */
  /* 📌 GET  /approvedProjectsRoutes/pm/:pmId                        */
  /*     GET  /approvedProjectsRoutes/pm/me   (via middleware)       */
  /* ---------------------------------------------------------------- */
  getProjectManagerById: async (req, res) => {
    try {
      /* Debug – log every incoming detail */
      console.log("🟢  [getProjectManagerById] invoked");
      console.log("📥  Headers:", req.headers);
      console.log("📥  req.user:", req.user);
      console.log("📥  req.params:", req.params);

      const { pmId } = req.params;
      if (!pmId) {
        console.warn("⚠️  Missing pmId param");
        return res.status(400).json({ message: "Не вказано ID проектного менеджера" });
      }

      console.log(`🔍  Searching PM with id = ${pmId}`);

      /* NOTE: If your schema links PM → user 🆔 via pm.user_id, fix the JOIN below */
      const result = await sequelize.query(
        `
        SELECT
          pm.id           AS pm_id,
          pm.first_name,
          pm.last_name,
          pm.phone,
          pm.email,
          u.role
        FROM project_managers pm
        LEFT JOIN users u ON pm.user_id = u.id  -- ← adjust if necessary
        WHERE pm.id = :pmId
        `,
        {
          replacements: { pmId },
          type: QueryTypes.SELECT,
        }
      );

      console.log("📦  SQL result:", result);

      if (!result || result.length === 0) {
        console.warn(`❗️ PM with id ${pmId} not found`);
        return res.status(404).json({ message: "Проєктного менеджера не знайдено" });
      }

      console.log("✅  Returning PM:", result[0]);
      return res.status(200).json(result[0]);
    } catch (error) {
      console.error("❌  [getProjectManagerById] error:", error);
      return res.status(500).json({
        message: "Помилка отримання даних",
        error:   error.message,
      });
    }
  },

  /* ──────────────────────────────────────────────────────────────── */
  /* 📌 GET  /approvedProjectsRoutes/jury-decisions/final             */
  /* ---------------------------------------------------------------- */
  getFinalJuryDecisions: async (_req, res) => {
    try {
      console.log("🟢  [getFinalJuryDecisions] fetching…");

      const decisions = await sequelize.query(
        `
        SELECT
          fjd.project_id,
          u.first_name  AS author_first_name,
          u.last_name   AS author_last_name,
          jm.first_name AS jury_first_name,
          jm.last_name  AS jury_last_name,
          fjd.decision_text,
          fjd.final_decision,
          fjd.decision_date
        FROM final_jury_decisions fjd
        LEFT JOIN users        u  ON fjd.user_id        = u.id
        LEFT JOIN jury_members jm ON fjd.jury_member_id = jm.id
        ORDER BY fjd.decision_date DESC
        `,
        { type: QueryTypes.SELECT }
      );

      console.log("📦  Jury SQL result:", decisions);

      if (!decisions || decisions.length === 0) {
        console.warn("⚠️  No final jury decisions found");
        return res.status(404).json({ message: "Немає фінальних рішень журі" });
      }

      console.log(`✅  Returning ${decisions.length} decisions`);
      return res.status(200).json(decisions);
    } catch (error) {
      console.error("❌  [getFinalJuryDecisions] error:", error);
      return res.status(500).json({
        message: "Не вдалося отримати фінальні рішення журі",
        error:   error.message,
      });
    }
  },
};

module.exports = approvedProjectsController;
