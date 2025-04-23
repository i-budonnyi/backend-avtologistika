const JuryMember = require('../models/JuryMember');

// Додати нового члена журі
exports.addJuryMember = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, photo } = req.body;

        const newMember = await JuryMember.create({
            first_name,
            last_name,
            email,
            phone,
            photo,
        });

        res.status(201).json({ message: 'Член журі успішно доданий.', newMember });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
