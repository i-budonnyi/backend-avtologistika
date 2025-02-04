const JuryMember = require('../models/JuryMember');

// Отримати логи для журі
exports.getJuryLogs = async (req, res) => {
    try {
        const { jury_member_id } = req.params;

        const logs = await JuryLog.findAll({ where: { jury_member_id } });

        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
