const JuryDecision = require('../models/JuryDecision');
const JuryLog = require('../models/JuryLog');

// Додати рішення журі
const addDecision = async (req, res) => {
    try {
        const { project_id, user_id, jury_member_id, decision, bonus_amount } = req.body;

        if (!project_id || !user_id || !jury_member_id || !decision) {
            return res.status(400).json({ message: 'Необхідно вказати всі обов’язкові поля.' });
        }

        const newDecision = await JuryDecision.create({
            project_id,
            user_id,
            jury_member_id,
            decision,
            bonus_amount,
        });

        // Логування дії
        await JuryLog.create({
            jury_member_id,
            action: 'added decision',
        });

        res.status(201).json({ message: 'Рішення успішно додано.', newDecision });
    } catch (error) {
        console.error('Помилка при додаванні рішення:', error);
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Отримати рішення для проєкту
const getDecisionsForProject = async (req, res) => {
    try {
        const { project_id } = req.params;

        if (!project_id) {
            return res.status(400).json({ message: 'Необхідно вказати project_id.' });
        }

        const decisions = await JuryDecision.findAll({ where: { project_id } });
        res.status(200).json(decisions);
    } catch (error) {
        console.error('Помилка при отриманні рішень для проєкту:', error);
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Отримати лог дій журі
const getJuryLogs = async (req, res) => {
    try {
        const { jury_member_id } = req.params;

        if (!jury_member_id) {
            return res.status(400).json({ message: 'Необхідно вказати jury_member_id.' });
        }

        const logs = await JuryLog.findAll({ where: { jury_member_id } });
        res.status(200).json(logs);
    } catch (error) {
        console.error('Помилка при отриманні логів журі:', error);
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Додати нового члена журі
const addJuryMember = async (req, res) => {
    try {
        const { name, role } = req.body;

        if (!name || !role) {
            return res.status(400).json({ message: 'Необхідно вказати ім’я та роль.' });
        }

        // Логіка додавання нового члена журі (припустимо, що є модель JuryMember)
        const newJuryMember = await JuryMember.create({ name, role });

        res.status(201).json({ message: 'Член журі успішно доданий.', newJuryMember });
    } catch (error) {
        console.error('Помилка при додаванні члена журі:', error);
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Експорт функцій
module.exports = {
    addDecision,
    getDecisionsForProject,
    getJuryLogs,
    addJuryMember,
};
