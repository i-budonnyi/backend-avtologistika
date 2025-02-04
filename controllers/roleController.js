// ../controllers/roleController.js

const UserRoles = require('../models/UserRoles');
const Roles = require('../models/Roles');

// Призначити роль користувачу
exports.assignRole = async (req, res) => {
    try {
        const { user_id, role_id } = req.body;

        const existingRole = await UserRoles.findOne({ where: { user_id, role_id } });
        if (existingRole) {
            return res.status(400).json({ message: 'Користувач вже має цю роль.' });
        }

        await UserRoles.create({ user_id, role_id });
        res.status(201).json({ message: 'Роль успішно призначено.' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Отримати всі ролі
exports.getRoles = async (req, res) => {
    try {
        const roles = await Roles.findAll();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Отримати ролі конкретного користувача
exports.getUserRoles = async (req, res) => {
    try {
        const { id } = req.params;

        const userRoles = await UserRoles.findAll({ where: { user_id: id } });
        if (!userRoles.length) {
            return res.status(404).json({ message: 'Ролі для цього користувача не знайдено.' });
        }

        res.status(200).json(userRoles);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};
