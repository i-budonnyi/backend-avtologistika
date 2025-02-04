// Імпортуємо модель `Permissions`
const Permissions = require('../models/Permissions');

// Функція для створення нового дозволу
exports.createPermission = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Перевірка, чи всі необхідні поля передані
        if (!name) {
            return res.status(400).json({ message: 'Назва дозволу є обов’язковою.' });
        }

        // Створюємо запис у таблиці `permissions`
        const permission = await Permissions.create({ name, description });
        res.status(201).json({ message: 'Дозвіл успішно створено.', permission });
    } catch (error) {
        // Обробка помилок сервера
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Функція для отримання всіх дозволів
exports.getAllPermissions = async (req, res) => {
    try {
        // Отримуємо всі записи з таблиці `permissions`
        const permissions = await Permissions.findAll();
        res.status(200).json(permissions);
    } catch (error) {
        // Обробка помилок сервера
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Функція для оновлення дозволу
exports.updatePermission = async (req, res) => {
    try {
        const { id } = req.params; // Отримуємо `id` з параметрів URL
        const { name, description } = req.body;

        // Оновлюємо запис у таблиці `permissions`
        const updatedPermission = await Permissions.update(
            { name, description },
            { where: { id } }
        );

        // Перевіряємо, чи було оновлено хоча б один запис
        if (!updatedPermission[0]) {
            return res.status(404).json({ message: 'Дозвіл не знайдено.' });
        }

        res.status(200).json({ message: 'Дозвіл успішно оновлено.' });
    } catch (error) {
        // Обробка помилок сервера
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Функція для видалення дозволу
exports.deletePermission = async (req, res) => {
    try {
        const { id } = req.params; // Отримуємо `id` з параметрів URL

        // Видаляємо запис з таблиці `permissions`
        const deletedPermission = await Permissions.destroy({ where: { id } });

        // Перевіряємо, чи було видалено хоча б один запис
        if (!deletedPermission) {
            return res.status(404).json({ message: 'Дозвіл не знайдено.' });
        }

        res.status(200).json({ message: 'Дозвіл успішно видалено.' });
    } catch (error) {
        // Обробка помилок сервера
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
