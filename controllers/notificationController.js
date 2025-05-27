const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db");

exports.getByUser = async (req, res) => {
  const userId = req.params.user_id;

  try {
    const notifications = await sequelize.query(
      `SELECT * FROM notifications
       WHERE user_id = :userId OR target = 'all'
       ORDER BY created_at DESC`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(notifications);
  } catch (error) {
    console.error("🛑 [getByUser] Помилка:", error);
    res.status(500).json({ message: "Помилка при отриманні сповіщень" });
  }
};
