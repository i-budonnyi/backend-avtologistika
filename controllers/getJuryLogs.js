const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Отримати логи для журі
exports.getJuryLogs = async (req, res) => {
  try {
    const { jury_member_id } = req.params;

    const logs = await sequelize.query(
      `SELECT * FROM jury_logs WHERE jury_member_id = $1`,
      {
        bind: [jury_member_id],
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(logs);
  } catch (error) {
    console.error('❌ getJuryLogs error:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};
