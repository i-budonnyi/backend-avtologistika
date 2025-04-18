const Treasurer = require('../models/Treasurer'); 
const TreasurerPaymentDashboard = require('../models/TreasurerPaymentDashboard');

// Отримати список усіх скарбників
exports.getAllTreasurers = async (req, res) => {
  console.log('Викликається getAllTreasurers');
  try {
    const treasurers = await Treasurer.findAll();
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
    const newPayment = await TreasurerPaymentDashboard.create({
      first_name,
      last_name,
      phone,
      email,
    });
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
    const payments = await TreasurerPaymentDashboard.findAll();
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
    const payment = await TreasurerPaymentDashboard.findOne({ where: { email } });
    if (!payment) {
      console.warn('Запис платежу для оновлення не знайдено:', email);
      return res.status(404).json({
        error: 'Запис платежу не знайдено',
        email: email,
      });
    }

    console.log('Знайдено запис для оновлення:', payment);
    await payment.update(updates);
    console.log('Запис успішно оновлено:', payment);
    res.status(200).json(payment);
  } catch (error) {
    console.error('Помилка оновлення платежу:', error.message);
    res.status(500).json({
      error: 'Не вдалося оновити запис платежу',
      details: error.message,
    });
  }
};
