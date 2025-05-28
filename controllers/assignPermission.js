const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Призначення дозволу PM
exports.assignPermission = async (req, res) => {
  try {
    const { pm_id, permission_id } = req.body;

    if (!pm_id || !permission_id) {
      return res.status(400).json({ message: 'pm_id і permission_id є обов’язковими.' });
    }

    const [assignment] = await sequelize.query(
      `INSERT INTO pm_permissions_assignment (pm_id, permission_id)
       VALUES ($1, $2)
       RETURNING *`,
      {
        bind: [pm_id, permission_id],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: 'Дозвіл успішно призначено.', assignment });
  } catch (error) {
    console.error('❌ assignPermission error:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};
