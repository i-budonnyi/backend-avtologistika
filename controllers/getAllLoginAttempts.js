// Отримати список всіх спроб входу
exports.getAllLoginAttempts = async (req, res) => {
    try {
        const loginAttempts = await LoginAttempt.findAll();
        res.status(200).json(loginAttempts);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
