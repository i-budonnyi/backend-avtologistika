exports.addCommentToNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;

        const updatedNotification = await Notifications.update(
            { comment },
            { where: { id } }
        );

        if (!updatedNotification[0]) {
            return res.status(404).json({ message: 'Повідомлення не знайдено.' });
        }

        res.status(200).json({ message: 'Коментар додано до повідомлення.' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
