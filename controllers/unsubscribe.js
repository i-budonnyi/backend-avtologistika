exports.unsubscribe = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const subscription = await Subscriptions.destroy({ where: { id, user_id } });

        if (!subscription) {
            return res.status(404).json({ message: 'Підписка не знайдена' });
        }

        res.status(200).json({ message: 'Відписка успішна' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};
