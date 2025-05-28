const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Створення нової проблеми
exports.submitProblem = async (req, res) => {
    try {
        const { user_id, title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Назва та опис є обов’язковими.' });
        }

        const [problem] = await sequelize.query(
            `INSERT INTO problems (user_id, title, description)
             VALUES ($1, $2, $3)
             RETURNING *`,
            {
                bind: [user_id, title, description],
                type: QueryTypes.INSERT,
            }
        );

        res.status(201).json({ message: 'Проблему успішно подано.', problem });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error: error.message });
    }
};
