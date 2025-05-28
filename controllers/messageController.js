import sequelize from '../config/db.js';
import { QueryTypes } from 'sequelize';

// Отримати всі повідомлення
export const getAllMessages = async (req, res) => {
  try {
    const messages = await sequelize.query(
      `SELECT * FROM messages`,
      { type: QueryTypes.SELECT }
    );
    res.status(200).json(messages);
  } catch (error) {
    console.error('Помилка отримання всіх повідомлень:', error);
    res.status(500).json({ error: 'Не вдалося отримати повідомлення' });
  }
};

// Отримати повідомлення за ID
export const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const [message] = await sequelize.query(
      `SELECT * FROM messages WHERE id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    if (!message) {
      return res.status(404).json({ error: 'Повідомлення не знайдено' });
    }

    res.status(200).json(message);
  } catch (error) {
    console.error('Помилка отримання повідомлення за ID:', error);
    res.status(500).json({ error: 'Не вдалося отримати повідомлення' });
  }
};

// Створити нове повідомлення
export const createMessage = async (req, res) => {
  try {
    const { sender_id, recipient_id, subject, content } = req.body;

    if (!sender_id || !recipient_id || !subject || !content) {
      return res.status(400).json({ error: 'Усі поля є обов’язковими' });
    }

    const [newMessage] = await sequelize.query(
      `INSERT INTO messages (sender_id, recipient_id, subject, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      {
        bind: [sender_id, recipient_id, subject, content],
        type: QueryTypes.INSERT
      }
    );

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Помилка створення повідомлення:', error);
    res.status(500).json({ error: 'Не вдалося створити повідомлення' });
  }
};

// Видалити повідомлення за ID
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const [message] = await sequelize.query(
      `SELECT * FROM messages WHERE id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    if (!message) {
      return res.status(404).json({ error: 'Повідомлення не знайдено' });
    }

    await sequelize.query(
      `DELETE FROM messages WHERE id = $1`,
      { bind: [id], type: QueryTypes.DELETE }
    );

    res.status(200).json({ message: 'Повідомлення успішно видалено' });
  } catch (error) {
    console.error('Помилка видалення повідомлення:', error);
    res.status(500).json({ error: 'Не вдалося видалити повідомлення' });
  }
};

// Отримати всі повідомлення для конкретного користувача
export const getUserMessages = async (req, res) => {
  try {
    const { user_id } = req.params;

    const messages = await sequelize.query(
      `SELECT * FROM messages
       WHERE sender_id = $1 OR recipient_id = $1`,
      {
        bind: [user_id],
        type: QueryTypes.SELECT
      }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error('Помилка отримання повідомлень користувача:', error);
    res.status(500).json({ error: 'Не вдалося отримати повідомлення користувача' });
  }
};

// Автоматична реєстрація маршрутів
export default (router) => {
  router.get('/messages', getAllMessages);
  router.get('/messages/:id', getMessageById);
  router.post('/messages', createMessage);
  router.delete('/messages/:id', deleteMessage);
  router.get('/messages/user/:user_id', getUserMessages);
};
