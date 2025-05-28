const sequelize = require('../../config/db');
const { QueryTypes } = require('sequelize');

exports.createMessage = async (req, res) => {
  try {
    const { sender_id, recipient_id, subject, content } = req.body;

    if (!sender_id || !recipient_id || !subject || !content) {
      return res.status(400).json({ message: 'Усі поля є обов’язковими.' });
    }

    const [message] = await sequelize.query(
      `INSERT INTO messages (sender_id, recipient_id, subject, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      {
        bind: [sender_id, recipient_id, subject, content],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: 'Повідомлення успішно створено.', message });
  } catch (error) {
    console.error('❌ createMessage error:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};
