const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Додати запис про спробу входу
const addLoginAttempt = async (req, res) => {
  try {
    const { user_id, ip_address, status } = req.body;

    if (!user_id || !ip_address || !status) {
      return res.status(400).json({
        message: 'Необхідно вказати user_id, ip_address та status.',
      });
    }

    const [newAttempt] = await sequelize.query(
      `INSERT INTO login_attempts (user_id, ip_address, status, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      {
        bind: [user_id, ip_address, status],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({
      message: 'Спроба входу успішно додана.',
      newAttempt,
    });
  } catch (error) {
    console.error('❌ Помилка при додаванні спроби входу:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

// Отримати всі спроби входу
const getAllLoginAttempts = async (req, res) => {
  try {
    const attempts = await sequelize.query(
      `SELECT * FROM login_attempts`,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json(attempts);
  } catch (error) {
    console.error('❌ Помилка при отриманні всіх спроб входу:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

// Отримати спроби входу конкретного користувача
const getUserLoginAttempts = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ message: 'Необхідно вказати user_id.' });
    }

    const attempts = await sequelize.query(
      `SELECT * FROM login_attempts WHERE user_id = $1`,
      {
        bind: [user_id],
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(attempts);
  } catch (error) {
    console.error('❌ Помилка при отриманні спроб входу користувача:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

// Перевірка кількості невдалих спроб входу
const checkFailedAttempts = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ message: 'Необхідно вказати user_id.' });
    }

    const [result] = await sequelize.query(
      `SELECT COUNT(*) AS failed_attempts
       FROM login_attempts
       WHERE user_id = $1 AND status = 'failed'`,
      {
        bind: [user_id],
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({ user_id, failedAttempts: parseInt(result.failed_attempts, 10) });
  } catch (error) {
    console.error('❌ Помилка при перевірці невдалих спроб входу:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

// Експорт
module.exports = {
  addLoginAttempt,
  getAllLoginAttempts,
  getUserLoginAttempts,
  checkFailedAttempts,
};
