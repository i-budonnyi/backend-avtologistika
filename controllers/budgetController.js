const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Створити новий бюджет
const createBudget = async (req, res) => {
  try {
    const { projectId, amount, description } = req.body;

    if (!projectId || !amount || !description) {
      return res.status(400).json({ message: 'Усі поля є обов’язковими.' });
    }

    const [project] = await sequelize.query(
      `SELECT * FROM projects WHERE id = $1`,
      { bind: [projectId], type: QueryTypes.SELECT }
    );

    if (!project) {
      return res.status(404).json({ message: 'Проєкт не знайдено.' });
    }

    const [budget] = await sequelize.query(
      `INSERT INTO budgets (project_id, amount, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      {
        bind: [projectId, amount, description],
        type: QueryTypes.INSERT
      }
    );

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error: error.message });
  }
};

// Отримати всі бюджети проєкту
const getProjectBudgets = async (req, res) => {
  try {
    const { project_id } = req.params;

    const [project] = await sequelize.query(
      `SELECT * FROM projects WHERE id = $1`,
      { bind: [project_id], type: QueryTypes.SELECT }
    );

    if (!project) {
      return res.status(404).json({ message: 'Проєкт не знайдено.' });
    }

    const budgets = await sequelize.query(
      `SELECT * FROM budgets WHERE project_id = $1`,
      { bind: [project_id], type: QueryTypes.SELECT }
    );

    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error: error.message });
  }
};

// Оновити бюджет
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;

    const [existing] = await sequelize.query(
      `SELECT * FROM budgets WHERE id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    if (!existing) {
      return res.status(404).json({ message: 'Бюджет не знайдено.' });
    }

    const [updated] = await sequelize.query(
      `UPDATE budgets
       SET amount = $1, description = $2
       WHERE id = $3
       RETURNING *`,
      {
        bind: [amount, description, id],
        type: QueryTypes.UPDATE
      }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error: error.message });
  }
};

module.exports = {
  createBudget,
  getProjectBudgets,
  updateBudget,
};
