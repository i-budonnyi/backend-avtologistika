// Отримати рішення для проєкту
exports.getDecisionsForProject = async (req, res) => {
    try {
        const { project_id } = req.params;

        const decisions = await JuryDecision.findAll({ where: { project_id } });

        res.status(200).json(decisions);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
