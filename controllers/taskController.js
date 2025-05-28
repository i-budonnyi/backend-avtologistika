const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Отримати всі задачі
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await sequelize.query(
      `SELECT * FROM tasks`,
      { type: QueryTypes.SELECT }
    );
    res.status(200).json(tasks);
  } catch (error) {
    console.error('❌ getAllTasks error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Додати задачу
exports.addTask = async (req, res) => {
  try {
    const { title, description, assigned_to, status } = req.body;

    const [task] = await sequelize.query(
      `INSERT INTO tasks (title, description, assigned_to, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      {
        bind: [title, description, assigned_to, status],
        type: QueryTypes.INSERT
      }
    );

    res.status(201).json(task);
  } catch (error) {
    console.error('❌ addTask error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Оновити задачу
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, status } = req.body;

    const [updated] = await sequelize.query(
      `UPDATE tasks
       SET title = $1, description = $2, assigned_to = $3, status = $4
       WHERE id = $5
       RETURNING *`,
      {
        bind: [title, description, assigned_to, status, id],
        type: QueryTypes.UPDATE
      }
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error('❌ updateTask error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Додати коментар до задачі
exports.addComment = async (req, res) => {
  try {
    const { task_id, user_id, comment } = req.body;

    const [newComment] = await sequelize.query(
      `INSERT INTO task_comments (task_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      {
        bind: [task_id, user_id, comment],
        type: QueryTypes.INSERT
      }
    );

    res.status(201).json(newComment);
  } catch (error) {
    console.error('❌ addComment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Отримати всі логи задачі
exports.getTaskLogs = async (req, res) => {
  try {
    const { taskId } = req.params;

    const logs = await sequelize.query(
      `SELECT * FROM task_logs WHERE task_id = $1`,
      {
        bind: [taskId],
        type: QueryTypes.SELECT
      }
    );

    res.status(200).json(logs);
  } catch (error) {
    console.error('❌ getTaskLogs error:', error);
    res.status(500).json({ error: error.message });
  }
};
