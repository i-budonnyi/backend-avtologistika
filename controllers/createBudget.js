// Створення бюджету проекту
exports.createBudget = async (req, res) => {
    try {
        const { project_id, treasurer_id, allocated_amount, description } = req.body;

        const budget = await ProjectBudgets.create({
            project_id,
            treasurer_id,
            allocated_amount,
            description,
        });

        res.status(201).json({ message: 'Бюджет успішно створено', budget });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Отримати бюджети проекту
exports.getProjectBudgets = async (req, res) => {
    try {
        const { project_id } = req.params;

        const budgets = await ProjectBudgets.findAll({ where: { project_id } });
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Оновлення бюджету
exports.updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const { allocated_amount, spent_amount, description } = req.body;

        const budget = await ProjectBudgets.update(
            { allocated_amount, spent_amount, description },
            { where: { id } }
        );

        if (!budget[0]) return res.status(404).json({ message: 'Бюджет не знайдено' });

        res.status(200).json({ message: 'Бюджет оновлено успішно' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};
