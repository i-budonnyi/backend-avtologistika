const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Створити новий дозвіл
exports.createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Назва дозволу є обов’язковою.' });
    }

    const [permission] = await sequelize.query(
      `INSERT INTO permissions (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      {
        bind: [name, description],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: 'Дозвіл успішно створено.', permission });
  } catch (error) {
    console.error('❌ createPermission error:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

// Отримати всі дозволи
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await sequelize.query(
      `SELECT * FROM permissions`,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json(permissions);
  } catch (error) {
    console.error('❌ getAllPermissions error:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

// Оновити дозвіл
exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const [updated] = await sequelize.query(
      `UPDATE permissions
       SET name = $1, description = $2
       WHERE id = $3
       RETURNING *`,
      {
        bind: [name, description, id],
        type: QueryTypes.UPDATE,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Дозвіл не знайдено.' });
    }

    res.status(200).json({ message: 'Дозвіл успішно оновлено.' });
  } catch (error) {
    console.error('❌ updatePermission error:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

// Видалити дозвіл
exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await sequelize.query(
      `DELETE FROM permissions WHERE id = $1 RETURNING *`,
      {
        bind: [id],
        type: QueryTypes.DELETE,
      }
    );

    if (!deleted) {
      return res.status(404).json({ message: 'Дозвіл не знайдено.' });
    }

    res.status(200).json({ message: 'Дозвіл успішно видалено.' });
  } catch (error) {
    console.error('❌ deletePermission error:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};
