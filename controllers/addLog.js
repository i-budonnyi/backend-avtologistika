const PmLogs = require('../models/PmLogs');

// Додавання нового запису в `pm_logs`
exports.addLog = async (req, res) => {
    try {
        const { pm_id, action } = req.body;

        if (!pm_id || !action) {
            return res.status(400).json({ message: 'pm_id і action є обов’язковими.' });
        }

        const log = await PmLogs.create({ pm_id, action });
        res.status(201).json({ message: 'Лог успішно створено.', log });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
