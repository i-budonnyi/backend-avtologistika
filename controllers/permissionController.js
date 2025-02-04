const PmPermissions = require('../models/PmPermissions');

exports.getPermissions = async (req, res) => {
    try {
        const permissions = await PmPermissions.findAll();
        res.status(200).json(permissions);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
