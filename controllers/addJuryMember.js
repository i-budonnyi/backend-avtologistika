const sequelize = require('../config/db'); // або імпортуй свій pool, якщо використовуєш Pool
const { QueryTypes } = require('sequelize');

// Додати нового члена журі
exports.addJuryMember = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, photo } = req.body;

        const query = `
            INSERT INTO jury_members (first_name, last_name, email, phone, photo)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const values = [first_name, last_name, email, phone, photo];

        const [newMember] = await sequelize.query(query, {
            bind: values,
            type: QueryTypes.INSERT,
        });

        res.status(201).json({
            message: 'Член журі успішно доданий.',
            newMember,
        });
    } catch (error) {
        console.error('❌ addJuryMember error:', error);
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
