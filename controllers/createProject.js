const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Створення проєкту
exports.createProject = async (req, res) => {
  try {
    const { name, description, created_by } = req.body;

    const [project] = await sequelize.query(
      `INSERT INTO projects (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      {
        bind: [name, description, created_by],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: 'Проєкт створено успішно', project });
  } catch (error) {
    console.error('❌ createProject error:', error);
    res.status(500).json({ message: 'Помилка сервера', error });
  }
};

// Отримати всі проєкти
exports.getProjects = async (req, res) => {
  try {
    const projects = await sequelize.query(
      `SELECT * FROM projects`,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json(projects);
  } catch (error) {
    console.error('❌ getProjects error:', error);
    res.status(500).json({ message: 'Помилка сервера', error });
  }
};

// Оновлення проєкту
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const [updated] = await sequelize.query(
      `UPDATE projects
       SET name = $1, description = $2
       WHERE id = $3
       RETURNING *`,
      {
        bind: [name, description, id],
        type: QueryTypes.UPDATE,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Проєкт не знайдено' });
    }

    res.status(200).json({ message: 'Проєкт оновлено успішно' });
  } catch (error) {
    console.error('❌ updateProject error:', error);
    res.status(500).json({ message: 'Помилка сервера', error });
  }
};

// Видалення проєкту
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await sequelize.query(
      `DELETE FROM projects
       WHERE id = $1
       RETURNING *`,
      {
        bind: [id],
        type: QueryTypes.DELETE,
      }
    );

    if (!deleted) {
      return res.status(404).json({ message: 'Проєкт не знайдено' });
    }

    res.status(200).json({ message: 'Проєкт видалено успішно' });
  } catch (error) {
    console.error('❌ deleteProject error:', error);
    res.status(500).json({ message: 'Помилка сервера', error });
  }
};
