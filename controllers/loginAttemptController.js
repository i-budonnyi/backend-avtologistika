const LoginAttempt = require('../models/LoginAttempt');

// Додати запис про спробу входу
const addLoginAttempt = async (req, res) => {
    try {
        const { user_id, ip_address, status } = req.body;

        if (!user_id || !ip_address || !status) {
            return res.status(400).json({ message: 'Необхідно вказати user_id, ip_address та status.' });
        }

        const newAttempt = await LoginAttempt.create({ user_id, ip_address, status });
        res.status(201).json({ message: 'Спроба входу успішно додана.', newAttempt });
    } catch (error) {
        console.error('Помилка при додаванні спроби входу:', error);
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Отримати всі спроби входу
const getAllLoginAttempts = async (req, res) => {
    try {
        const attempts = await LoginAttempt.findAll();
        res.status(200).json(attempts);
    } catch (error) {
        console.error('Помилка при отриманні всіх спроб входу:', error);
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Отримати спроби входу конкретного користувача
const getUserLoginAttempts = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!user_id) {
            return res.status(400).json({ message: 'Необхідно вказати user_id.' });
        }

        const attempts = await LoginAttempt.findAll({ where: { user_id } });
        res.status(200).json(attempts);
    } catch (error) {
        console.error('Помилка при отриманні спроб входу користувача:', error);
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Перевірка кількості невдалих спроб входу
const checkFailedAttempts = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!user_id) {
            return res.status(400).json({ message: 'Необхідно вказати user_id.' });
        }

        const failedAttempts = await LoginAttempt.count({
            where: { user_id, status: 'failed' },
        });

        res.status(200).json({ user_id, failedAttempts });
    } catch (error) {
        console.error('Помилка при перевірці невдалих спроб входу:', error);
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Експорт функцій
module.exports = {
    addLoginAttempt,
    getAllLoginAttempts,
    getUserLoginAttempts,
    checkFailedAttempts,
};
