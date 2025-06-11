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

      // 🔁 Перевірка на дублікати
      const existing = await sequelize.query(
        `SELECT id FROM project_invitations WHERE project_id = :project_id AND invited_user_id = :invited_user_id`,
        {
          replacements: { project_id, invited_user_id },
          type: QueryTypes.SELECT
        }
      );

      if (existing.length > 0) {
        return res.status(409).json({ message: "Користувача вже запрошено до цього проєкту" });
      }

      await sequelize.query(
        `
        INSERT INTO project_invitations (project_id, invited_user_id, invited_by_pm_id, status)
        VALUES (:project_id, :invited_user_id, :invited_by_pm_id, 'pending')
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

  // ❌ Скасувати запрошення за ID
  cancelInvitation: async (req, res) => {
    try {
      const { invite_id } = req.body;

      await sequelize.query(
        `DELETE FROM project_invitations WHERE id = :invite_id`,
        {
          replacements: { invite_id },
          type: QueryTypes.DELETE
        }
      );

      return res.status(200).json({ message: "Запрошення скасовано" });
    } catch (error) {
      console.error("❌ [cancelInvitation] error:", error);
      return res.status(500).json({ message: "Помилка при скасуванні запрошення", error: error.message });
    }
  },

  // 👥 Отримати всіх користувачів (PM only)
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
  },

  // 🧾 Історія запрошень для проєкту
  getInvitationHistory: async (req, res) => {
    try {
      const { project_id } = req.query;

      if (!project_id) {
        return res.status(400).json({ message: "Не вказано project_id" });
      }

      const history = await sequelize.query(
        `
        SELECT 
          pi.id,
          pi.project_id,
          pi.invited_user_id,
          u.first_name,
          u.last_name,
          u.email,
          pi.status,
          pi.invited_by_pm_id,
          pi.created_at
        FROM project_invitations pi
        JOIN users u ON pi.invited_user_id = u.id
        WHERE pi.project_id = :project_id
        ORDER BY pi.created_at DESC
        `,
        {
          replacements: { project_id },
          type: QueryTypes.SELECT
        }
      );

      return res.status(200).json(history);
    } catch (error) {
      console.error("❌ [getInvitationHistory] error:", error);
      return res.status(500).json({ message: "Помилка при отриманні історії", error: error.message });
    }
  }
};

module.exports = projectInvitationsController;
