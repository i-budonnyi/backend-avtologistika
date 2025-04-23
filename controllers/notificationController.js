// ../controllers/notificationController.js
const createNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ message: 'Усі поля є обов’язковими.' });
        }

        // Логіка створення повідомлення (наприклад, запис у базу даних)
        const notification = { id: 1, userId, message, status: 'new' }; // Приклад
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error: error.message });
    }
};

const getUserNotifications = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Логіка отримання повідомлень користувача
        const notifications = [{ id: 1, userId: user_id, message: 'Приклад повідомлення', status: 'new' }];
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error: error.message });
    }
};

const updateNotificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Статус є обов’язковим.' });
        }

        // Логіка оновлення статусу (наприклад, оновлення в базі даних)
        res.status(200).json({ message: 'Статус оновлено.', id, status });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error: error.message });
    }
};

const addCommentToNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({ message: 'Коментар є обов’язковим.' });
        }

        // Логіка додавання коментаря
        res.status(200).json({ message: 'Коментар додано.', id, comment });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error: error.message });
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    updateNotificationStatus,
    addCommentToNotification,
};
