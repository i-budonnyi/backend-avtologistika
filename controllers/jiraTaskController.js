const JiraTask = require('../models/jira_task');

// Отримати всі завдання
const getAllTasks = async (req, res) => {
    try {
        const tasks = await JiraTask.findAll();
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching all tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks.' });
    }
};

// Отримати завдання за ID
const getTaskById = async (req, res) => {
    try {
        const task = await JiraTask.findByPk(req.params.id);
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
        const { project_id, title, description, status, assigned_to, created_by_pm_id, priority } = req.body;

        // Перевірка обов'язкових полів
        if (!project_id || !title || !status || !created_by_pm_id) {
            return res.status(400).json({ error: 'Required fields: project_id, title, status, created_by_pm_id.' });
        }

        const newTask = await JiraTask.create({
            project_id,
            title,
            description,
            status,
            assigned_to,
            created_by_pm_id,
            priority,
        });
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

        // Перевірка наявності завдання
        const task = await JiraTask.findByPk(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        // Оновлення
        const updatedTask = await task.update(req.body);
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

        // Перевірка наявності завдання
        const task = await JiraTask.findByPk(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        // Видалення
        await task.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task.' });
    }
};

// Коректний експорт усіх функцій
module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
};
