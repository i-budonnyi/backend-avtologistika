const Problems = require('../models/Problems');

// Створення нової проблеми
exports.submitProblem = async (req, res) => {
    try {
        const { user_id, title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Назва та опис є обов’язковими.' });
        }

        const problem = await Problems.create({ user_id, title, description });
        res.status(201).json({ message: 'Проблему успішно подано.', problem });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
