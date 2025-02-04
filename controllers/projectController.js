// ../controllers/projectController.js

// Псевдокод для роботи з базою даних
const Project = require('../models/Project'); // модель для роботи з проектами

// Створити новий проект
const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, budget } = req.body;

    // Валідація даних
    if (!name || !startDate || !endDate || !budget) {
      return res.status(400).json({ message: 'Усі поля є обов’язковими.' });
    }

    const project = await Project.create({ name, description, startDate, endDate, budget });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error: error.message });
  }
};

// Отримати список проектів
const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll(); // Використовуйте ваш ORM або SQL-запит
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error: error.message });
  }
};

// Оновити проект
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, budget } = req.body;

    const project = await Project.findByPk(id); // Знайти проект за ID
    if (!project) {
      return res.status(404).json({ message: 'Проект не знайдено.' });
    }

    // Оновлення полів
    project.name = name || project.name;
    project.description = description || project.description;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate || project.endDate;
    project.budget = budget || project.budget;

    await project.save(); // Зберегти зміни
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера.', error: error.message });
  }
};

// Видалити проект
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id); // Знайти проект за ID
    if (!project) {
      return res.status(404).json({ message: 'Проект не знайдено.' });
    }

    await project.destroy(); // Видалити проект
    res.status(200).json({ message: 'Проект успішно видалено.' });
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
