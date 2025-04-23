// Видалення лайка
exports.removeLike = async (req, res) => {
    try {
        const { blog_id, user_id } = req.body;

        if (!blog_id || !user_id) {
            return res.status(400).json({ message: 'Необхідно вказати blog_id і user_id.' });
        }

        const deletedLike = await Like.destroy({ where: { blog_id, user_id } });

        if (!deletedLike) {
            return res.status(404).json({ message: 'Лайк не знайдено.' });
        }

        res.status(200).json({ message: 'Лайк успішно видалено.' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
