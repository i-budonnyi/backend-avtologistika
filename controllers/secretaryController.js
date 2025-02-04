const Secretaries = require('../models/Secretaries');
const SecretaryPermissions = require('../models/SecretaryPermissions');

// Створити нового секретаря
exports.createSecretary = async (req, res) => {
    try {
        const { phone, email, first_name, last_name, photo } = req.body;

        const secretary = await Secretaries.create({ phone, email, first_name, last_name, photo });
        res.status(201).json({ message: 'Секретаря успішно створено', secretary });
    } catch (error) {
        console.error('Помилка при створенні секретаря:', error);
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Оновити дані секретаря
exports.updateSecretary = async (req, res) => {
    try {
        const { id } = req.params;
        const { phone, email, first_name, last_name, photo } = req.body;

        const [updated] = await Secretaries.update(
            { phone, email, first_name, last_name, photo },
            { where: { id } }
        );

        if (!updated) return res.status(404).json({ message: 'Секретаря не знайдено' });

        res.status(200).json({ message: 'Дані секретаря успішно оновлено' });
    } catch (error) {
        console.error('Помилка при оновленні даних секретаря:', error);
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Отримати список секретарів
exports.getSecretaries = async (req, res) => {
    try {
        const secretaries = await Secretaries.findAll();
        res.status(200).json(secretaries);
    } catch (error) {
        console.error('Помилка при отриманні списку секретарів:', error);
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Управління дозволами
exports.managePermissions = async (req, res) => {
    try {
        const { secretary_id, permission_id } = req.body;

        if (!secretary_id || !permission_id) {
            return res.status(400).json({ message: 'Усі поля є обов’язковими' });
        }

        await SecretaryPermissions.create({ secretary_id, permission_id });
        res.status(201).json({ message: 'Дозвіл успішно додано' });
    } catch (error) {
        console.error('Помилка при управлінні дозволами:', error);
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Експорт функцій
module.exports = {
    createSecretary,
    updateSecretary,
    getSecretaries,
    managePermissions,
};
