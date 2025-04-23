// Підрахунок лайків для запису блогу
exports.getLikesCount = async (req, res) => {
    try {
        const { blog_id } = req.params;

        const likesCount = await Like.count({ where: { blog_id } });

        res.status(200).json({ blog_id, likesCount });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
