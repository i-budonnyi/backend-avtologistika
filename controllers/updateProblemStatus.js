exports.updateProblemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedProblem = await Problems.update(
            { status },
            { where: { id } }
        );

        if (!updatedProblem[0]) {
            return res.status(404).json({ message: 'Проблему не знайдено.' });
        }

        res.status(200).json({ message: 'Статус проблеми успішно оновлено.' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
