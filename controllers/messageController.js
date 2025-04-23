import { Op } from 'sequelize';
import Messages from '../models/Message.js'; // Імпорт моделі Message

// Отримати всі повідомлення
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Messages.findAll();
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

    const message = await Messages.findByPk(id);
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

    const newMessage = await Messages.create({
      sender_id,
      recipient_id,
      subject,
      content,
      created_at: new Date(),
    });

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

    const message = await Messages.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: 'Повідомлення не знайдено' });
    }

    await message.destroy();
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

    const messages = await Messages.findAll({
      where: {
        [Op.or]: [{ sender_id: user_id }, { recipient_id: user_id }],
      },
    });

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
