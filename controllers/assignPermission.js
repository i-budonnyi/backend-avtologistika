const PmPermissionsAssignment = require('../models/PmPermissionsAssignment');

// Призначення дозволу PM
exports.assignPermission = async (req, res) => {
    try {
        const { pm_id, permission_id } = req.body;

        if (!pm_id || !permission_id) {
            return res.status(400).json({ message: 'pm_id і permission_id є обов’язковими.' });
        }

        const assignment = await PmPermissionsAssignment.create({ pm_id, permission_id });
        res.status(201).json({ message: 'Дозвіл успішно призначено.', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
