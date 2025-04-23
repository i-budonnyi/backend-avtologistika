// Перевірка, чи користувач лайкнув запис
exports.checkUserLike = async (req, res) => {
    try {
        const { blog_id, user_id } = req.params;

        const userLike = await Like.findOne({ where: { blog_id, user_id } });

        res.status(200).json({ liked: !!userLike });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
