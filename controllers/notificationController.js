/* controllers/notificationController.js */
const { QueryTypes } = require("sequelize");
const sequelize     = require("../config/db"); // переконайся, що саме тут у тебе ініціалізований Sequelize

/**
 * GET /api/notifications/:user_id
 * Повертає всі сповіщення, адресовані конкретному користувачу
 * + глобальні (`target = 'all'`).
 */
exports.getByUser = async (req, res) => {
  /* 1. Валідуємо та нормалізуємо user_id */
  const rawId  = req.params.user_id;          // те, що прийшло в URL
  const userId = Number(rawId);               // приводимо до числа

  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ message: "Невалідний ID користувача" });
  }

  /* 2. Дістаємо сповіщення */
  try {
    const notifications = await sequelize.query(
      `
        SELECT *
        FROM notifications
        WHERE user_id = :uid
           OR target   = 'all'
        ORDER BY created_at DESC
      `,
      {
        replacements: { uid: userId },
        type: QueryTypes.SELECT
      }
    );

    return res.status(200).json(notifications);
  } catch (err) {
    /* 3. Логуємо та відправляємо помилку */
    console.error("🛑 [getByUser] DB error:", err);
    return res.status(500).json({ message: "Помилка при отриманні сповіщень" });
  }
};
