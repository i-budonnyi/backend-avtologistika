// Отримати список спроб входу для конкретного користувача
exports.getUserLoginAttempts = async (req, res) => {
    try {
        const { user_id } = req.params;

        const loginAttempts = await LoginAttempt.findAll({
            where: { user_id },
        });

        if (!loginAttempts.length) {
            return res.status(404).json({ message: 'Спроби входу для цього користувача не знайдені.' });
        }

        res.status(200).json(loginAttempts);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
