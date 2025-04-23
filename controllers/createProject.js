const Projects = require('../models/Projects');
const ProjectBudgets = require('../models/ProjectBudgets');

// Створення проекту
exports.createProject = async (req, res) => {
    try {
        const { name, description, created_by } = req.body;

        const project = await Projects.create({ name, description, created_by });
        res.status(201).json({ message: 'Проект створено успішно', project });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Отримати всі проекти
exports.getProjects = async (req, res) => {
    try {
        const projects = await Projects.findAll();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Оновлення проекту
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const project = await Projects.update(
            { name, description },
            { where: { id } }
        );

        if (!project[0]) return res.status(404).json({ message: 'Проект не знайдено' });

        res.status(200).json({ message: 'Проект оновлено успішно' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Видалення проекту
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Projects.destroy({ where: { id } });

        if (!project) return res.status(404).json({ message: 'Проект не знайдено' });

        res.status(200).json({ message: 'Проект видалено успішно' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};
