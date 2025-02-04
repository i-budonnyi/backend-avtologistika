const express = require('express');
const router = express.Router();

// Переконайтеся, що шлях правильний
const jiraTaskController = require('../controllers/jiraTaskController');

// Перевірте наявність усіх методів контролера
if (!jiraTaskController) {
    throw new Error("Failed to load 'jiraTaskController'. Check the import path or exports.");
}

// Роут для отримання всіх завдань
router.get('/', jiraTaskController.getAllTasks);

// Роут для отримання завдання за ID
router.get('/:id', jiraTaskController.getTaskById);

// Роут для створення нового завдання
router.post('/', jiraTaskController.createTask);

// Роут для оновлення завдання
router.put('/:id', jiraTaskController.updateTask);

// Роут для видалення завдання
router.delete('/:id', jiraTaskController.deleteTask);

module.exports = router;
