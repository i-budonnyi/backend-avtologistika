const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Створення нового проєкту
const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, budget } = req.body;

    if (!name || !startDate || !endDate || !budget) {
      return res.status(400).json({ message: 'Всі поля є обов’язковими.' });
    }

    const [project] = await sequelize.query(
      `INSERT INTO projects (name, description, start_date, end_date, budget)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      {
        bind: [name, description, startDate, endDate, budget],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error: error.message });
  }
};

// Отримання всіх проєктів
const getProjects = async (req, res) => {
  try {
    const projects = await sequelize.query(
      `SELECT * FROM projects`,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error: error.message });
  }
};

// Оновлення проєкту
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, budget } = req.body;

    const [existing] = await sequelize.query(
      `SELECT * FROM projects WHERE id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    if (!existing) {
      return res.status(404).json({ message: 'Проєкт не знайдено.' });
    }

    const updatedFields = [];
    const values = [];
    let i = 1;

    if (name) { updatedFields.push(`name = $${i++}`); values.push(name); }
    if (description) { updatedFields.push(`description = $${i++}`); values.push(description); }
    if (startDate) { updatedFields.push(`start_date = $${i++}`); values.push(startDate); }
    if (endDate) { updatedFields.push(`end_date = $${i++}`); values.push(endDate); }
    if (budget) { updatedFields.push(`budget = $${i++}`); values.push(budget); }

    values.push(id);

    const [updated] = await sequelize.query(
      `UPDATE projects
       SET ${updatedFields.join(', ')}
       WHERE id = $${values.length}
       RETURNING *`,
      { bind: values, type: QueryTypes.UPDATE }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error: error.message });
  }
};

// Видалення проєкту
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const [project] = await sequelize.query(
      `SELECT * FROM projects WHERE id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    if (!project) {
      return res.status(404).json({ message: 'Проєкт не знайдено.' });
    }

    await sequelize.query(
      `DELETE FROM projects WHERE id = $1`,
      { bind: [id], type: QueryTypes.DELETE }
    );

    res.status(200).json({ message: 'Проєкт успішно видалено.' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
};
