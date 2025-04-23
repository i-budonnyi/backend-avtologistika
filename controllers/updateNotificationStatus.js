exports.updateNotificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedNotification = await Notifications.update(
            { status },
            { where: { id } }
        );

        if (!updatedNotification[0]) {
            return res.status(404).json({ message: 'Повідомлення не знайдено.' });
        }

        res.status(200).json({ message: 'Статус повідомлення оновлено.' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
