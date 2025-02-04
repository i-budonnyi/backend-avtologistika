const ProjectManagers = require('../models/ProjectManagers'); // Модель для PM

// Створення нового PM
exports.createPM = async (req, res) => {
    try {
        const { first_name, last_name, email, phone } = req.body;

        if (!first_name || !last_name || !email || !phone) {
            return res.status(400).json({ message: 'Усі поля є обов’язковими' });
        }

        const newPM = await ProjectManagers.create({
            first_name,
            last_name,
            email,
            phone,
        });

        res.status(201).json({ message: 'Проєктний менеджер успішно створений', newPM });
    } catch (error) {
        console.error('Помилка при створенні PM:', error);
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Отримати всіх PM
exports.getAllPMs = async (req, res) => {
    try {
        const pms = await ProjectManagers.findAll();
        res.status(200).json(pms);
    } catch (error) {
        console.error('Помилка при отриманні списку PM:', error);
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Отримати PM за ID
exports.getPMById = async (req, res) => {
    try {
        const { id } = req.params;

        const pm = await ProjectManagers.findByPk(id);

        if (!pm) {
            return res.status(404).json({ message: 'PM не знайдено' });
        }

        res.status(200).json(pm);
    } catch (error) {
        console.error('Помилка при отриманні PM за ID:', error);
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Оновити дані PM
exports.updatePM = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, phone } = req.body;

        const pm = await ProjectManagers.findByPk(id);

        if (!pm) {
            return res.status(404).json({ message: 'PM не знайдено' });
        }

        await pm.update({ first_name, last_name, email, phone });

        res.status(200).json({ message: 'PM успішно оновлений', pm });
    } catch (error) {
        console.error('Помилка при оновленні PM:', error);
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Видалити PM
exports.deletePM = async (req, res) => {
    try {
        const { id } = req.params;

        const pm = await ProjectManagers.findByPk(id);

        if (!pm) {
            return res.status(404).json({ message: 'PM не знайдено' });
        }

        await pm.destroy();

        res.status(200).json({ message: 'PM успішно видалений' });
    } catch (error) {
        console.error('Помилка при видаленні PM:', error);
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};
