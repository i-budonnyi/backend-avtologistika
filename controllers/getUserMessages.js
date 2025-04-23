const Message = require('../../models/Message');

exports.createMessage = async (req, res) => {
    try {
        const { sender_id, recipient_id, subject, content } = req.body;

        if (!sender_id || !recipient_id || !subject || !content) {
            return res.status(400).json({ message: 'Усі поля є обов’язковими.' });
        }

        const message = await Message.create({ sender_id, recipient_id, subject, content });
        res.status(201).json({ message: 'Повідомлення успішно створено.', message });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
