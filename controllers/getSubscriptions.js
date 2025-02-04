exports.getSubscriptions = async (req, res) => {
    try {
        const user_id = req.user.id;

        const subscriptions = await Subscriptions.findAll({ where: { user_id } });

        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};
