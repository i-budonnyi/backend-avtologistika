const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

exports.getPermissions = async (req, res) => {
  try {
    const permissions = await sequelize.query(
      `SELECT * FROM pm_permissions`,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(permissions);
  } catch (error) {
    console.error('❌ getPermissions error:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};
