// ../controllers/budgetController.js

// Псевдокод для роботи з базою даних
const Budget = require('../models/Budget'); // модель для роботи з бюджетами
const Project = require('../models/Project'); // модель для роботи з проектами

// Створити бюджет
const createBudget = async (req, res) => {
  try {
    const { projectId, amount, description } = req.body;

    // Валідація даних
    if (!projectId || !amount || !description) {
      return res.status(400).json({ message: 'Усі поля є обов’язковими.' });
    }

    // Перевірити, чи існує проект
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Проект не знайдено.' });
    }

    const budget = await Budget.create({ projectId, amount, description });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error: error.message });
  }
};

// Отримати бюджети проекту
const getProjectBudgets = async (req, res) => {
  try {
    const { project_id } = req.params;

    // Перевірити, чи існує проект
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Проект не знайдено.' });
    }

    const budgets = await Budget.findAll({ where: { projectId: project_id } });
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

    // Знайти бюджет за ID
    co
