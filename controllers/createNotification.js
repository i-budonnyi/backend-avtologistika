exports.createNotification = async (req, res) => {
    try {
        const { user_id, message, comment } = req.body;

        // Перевірка обов'язкових полів
        if (!user_id || !message) {
            return res.status(400).json({ message: 'user_id і message є обов’язковими.' });
        }

        // Додаткова перевірка на валідність message
        if (typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ message: 'Message має бути непорожнім рядком.' });
        }

        // Перевірка існування користувача
        const userExists = await Users.findByPk(user_id); // Припускаємо, що ви використовуєте Sequelize
        if (!userExists) {
            return res.status(404).json({ message: 'Користувач із таким user_id не знайдений.' });
        }

        // Створення повідомлення
        const notification = await Notifications.create({ user_id, message, comment });
        res.status(201).json({ message: 'Повідомлення успішно створено.', notification });
    } catch (error) {
        console.error('Помилка створення повідомлення:', error); // Логування
        res.status(500).json({ message: 'Помилка сервера.', error: error.message });
    }
};
