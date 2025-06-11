const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");

const projectInvitationsController = {
  // 📨 Надіслати запрошення користувачу
  inviteUser: async (req, res) => {
    try {
      const { project_id, invited_user_id } = req.body;
      const invited_by_pm_id = req.user.id;

      if (req.user.role !== "project_manager") {
        return res.status(403).json({ message: "Доступ дозволено лише проєктним менеджерам" });
      }

      await sequelize.query(
        `
        INSERT INTO project_invitations (project_id, invited_user_id, invited_by_pm_id)
        VALUES (:project_id, :invited_user_id, :invited_by_pm_id)
        `,
        {
          replacements: { project_id, invited_user_id, invited_by_pm_id },
          type: QueryTypes.INSERT
        }
      );

      return res.status(201).json({ message: "Запрошення надіслано" });
    } catch (error) {
      console.error("❌ [inviteUser] error:", error);
      return res.status(500).json({ message: "Помилка при запрошенні", error: error.message });
    }
  },

  // 👥 Отримати список усіх зареєстрованих користувачів (PM only)
  getAllUsers: async (req, res) => {
    try {
      if (req.user.role !== "project_manager") {
        return res.status(403).json({ message: "Доступ дозволено лише проєктним менеджерам" });
      }

      const users = await sequelize.query(
        `
        SELECT id, first_name, last_name, email
        FROM users
        ORDER BY last_name ASC
        `,
        { type: QueryTypes.SELECT }
      );

      return res.status(200).json(users);
    } catch (error) {
      console.error("❌ [getAllUsers] error:", error);
      return res.status(500).json({ message: "Не вдалося отримати список користувачів", error: error.message });
    }
  }
};

module.exports = projectInvitationsController;
