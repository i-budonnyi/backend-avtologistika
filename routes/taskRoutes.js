const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/tasks', taskController.getAllTasks);
router.post('/tasks', taskController.addTask);
router.put('/tasks/:id', taskController.updateTask);

router.post('/tasks/:taskId/comments', taskController.addComment);
router.get('/tasks/:taskId/logs', taskController.getTaskLogs);

module.exports = router;
