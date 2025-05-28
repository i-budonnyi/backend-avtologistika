const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Додавання нового запису в `pm_logs`
exports.addLog = async (req, res) => {
    try {
        const { pm_id, action } = req.body;

        if (!pm_id || !action) {
            return res.status(400).json({ message: 'pm_id і action є обов’язковими.' });
        }

        const query = `
            INSERT INTO pm_logs (pm_id, action)
            VALUES ($1, $2)
            RETURNING *
        `;

        const values = [pm_id, action];

        const [log] = await sequelize.query(query, {
            bind: values,
            type: QueryTypes.INSERT,
        });

        res.status(201).json({ message: 'Лог успішно створено.', log });
    } catch (error) {
        console.error('❌ addLog error:', error);
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
