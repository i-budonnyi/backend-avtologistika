const Task = require('../models/task');
const TaskComment = require('../models/taskComment');
const TaskLog = require('../models/taskLog');

// Отримати всі задачі
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Додати задачу
exports.addTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Оновити задачу
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.update(req.body, { where: { id } });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Додати коментар до задачі
exports.addComment = async (req, res) => {
  try {
    const comment = await TaskComment.create(req.body);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Отримати всі логи задачі
exports.getTaskLogs = async (req, res) => {
  try {
    const { taskId } = req.params;
    const logs = await TaskLog.findAll({ where: { task_id: taskId } });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
