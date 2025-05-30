const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Отримати список усіх скарбників
exports.getAllTreasurers = async (req, res) => {
  console.log('Викликається getAllTreasurers');
  try {
    const treasurers = await sequelize.query(
      `SELECT * FROM treasurers`,
      { type: QueryTypes.SELECT }
    );
    console.log('Успішно отримано список скарбників:', treasurers);
    res.status(200).json(treasurers);
  } catch (error) {
    console.error('Помилка отримання скарбників:', error.message);
    res.status(500).json({
      error: 'Не вдалося отримати список скарбників',
      details: error.message,
    });
  }
};

// Додати новий платіж
exports.addPayment = async (req, res) => {
  const { first_name, last_name, phone, email } = req.body;
  console.log('Дані для створення платежу:', { first_name, last_name, phone, email });

  if (!first_name || !last_name || !phone || !email) {
    console.warn('Дані для створення платежу не повні');
    return res.status(400).json({
      error: 'Усі поля є обов’язковими',
      missingFields: {
        first_name: !first_name,
        last_name: !last_name,
        phone: !phone,
        email: !email,
      },
    });
  }

  try {
    const [newPayment] = await sequelize.query(
      `INSERT INTO treasurer_payment_dashboard (first_name, last_name, phone, email)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      {
        bind: [first_name, last_name, phone, email],
        type: QueryTypes.INSERT,
      }
    );

    console.log('Новий платіж успішно створено:', newPayment);
    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Помилка додавання платежу:', error.message);
    res.status(500).json({
      error: 'Не вдалося додати платіж',
      details: error.message,
    });
  }
};

// Отримати всі платежі
exports.getAllPayments = async (req, res) => {
  console.log('Викликається getAllPayments');
  try {
    const payments = await sequelize.query(
      `SELECT * FROM treasurer_payment_dashboard`,
      { type: QueryTypes.SELECT }
    );
    console.log('Успішно отримано список платежів:', payments);
    res.status(200).json(payments);
  } catch (error) {
    console.error('Помилка отримання платежів:', error.message);
    res.status(500).json({
      error: 'Не вдалося отримати записи про платежі',
      details: error.message,
    });
  }
};

// Оновити платіж за email
exports.updatePayment = async (req, res) => {
  const { email } = req.params;
  const updates = req.body;

  console.log('Дані для оновлення платежу:', { email, updates });

  if (!email) {
    console.warn('Email для оновлення платежу не передано');
    return res.status(400).json({ error: 'Email є обов’язковим' });
  }

  try {
    const [existing] = await sequelize.query(
      `SELECT * FROM treasurer_payment_dashboard WHERE email = $1`,
      { bind: [email], type: QueryTypes.SELECT }
    );

    if (!existing) {
      console.warn('Запис платежу для оновлення не знайдено:', email);
      return res.status(404).json({
        error: 'Запис платежу не знайдено',
        email: email,
      });
    }

    const fields = [];
    const values = [];
    let index = 1;

    for (const key in updates) {
      fields.push(`${key} = $${index}`);
      values.push(updates[key]);
      index++;
    }

    values.push(email); // останній bind для WHERE

    const [updated] = await sequelize.query(
      `UPDATE treasurer_payment_dashboard
       SET ${fields.join(', ')}
       WHERE email = $${index}
       RETURNING *`,
      {
        bind: values,
        type: QueryTypes.UPDATE,
      }
    );

    console.log('Запис успішно оновлено:', updated);
    res.status(200).json(updated);
  } catch (error) {
    console.error('Помилка оновлення платежу:', error.message);
    res.status(500).json({
      error: 'Не вдалося оновити запис платежу',
      details: error.message,
    });
  }
};
