const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Отримати всі завдання
const getAllTasks = async (req, res) => {
  try {
    const tasks = await sequelize.query(
      `SELECT * FROM jira_tasks`,
      { type: QueryTypes.SELECT }
    );
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
};

// Отримати завдання за ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const [task] = await sequelize.query(
      `SELECT * FROM jira_tasks WHERE id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task by ID:', error);
    res.status(500).json({ error: 'Failed to fetch task.' });
  }
};

// Створити нове завдання
const createTask = async (req, res) => {
  try {
    const {
      project_id,
      title,
      description,
      status,
      assigned_to,
      created_by_pm_id,
      priority,
    } = req.body;

    if (!project_id || !title || !status || !created_by_pm_id) {
      return res.status(400).json({
        error: 'Required fields: project_id, title, status, created_by_pm_id.',
      });
    }

    const [newTask] = await sequelize.query(
      `INSERT INTO jira_tasks (project_id, title, description, status, assigned_to, created_by_pm_id, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      {
        bind: [project_id, title, description, status, assigned_to, created_by_pm_id, priority],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ error: 'Failed to create task.' });
  }
};

// Оновити завдання
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const [task] = await sequelize.query(
      `SELECT * FROM jira_tasks WHERE id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const fields = [];
    const values = [];
    let i = 1;

    for (const key in req.body) {
      fields.push(`${key} = $${i}`);
      values.push(req.body[key]);
      i++;
    }

    values.push(id); // для WHERE

    const [updatedTask] = await sequelize.query(
      `UPDATE jira_tasks SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      {
        bind: values,
        type: QueryTypes.UPDATE,
      }
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ error: 'Failed to update task.' });
  }
};

// Видалити завдання
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const [task] = await sequelize.query(
      `SELECT * FROM jira_tasks WHERE id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await sequelize.query(
      `DELETE FROM jira_tasks WHERE id = $1`,
      { bind: [id], type: QueryTypes.DELETE }
    );

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
};

// Експорт
module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
