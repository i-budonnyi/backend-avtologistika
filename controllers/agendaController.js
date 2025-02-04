// controllers/agendaController.js
const Agenda = require('../models/agenda');
const AgendaItem = require('../models/agendaItem');

// Створення агенди
exports.createAgenda = async (req, res) => {
  try {
    const { title, description, meeting_date, created_by } = req.body;
    const agenda = await Agenda.create({ title, description, meeting_date, created_by });
    res.status(201).json(agenda);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Отримання списку опублікованих агенд
exports.getAgendas = async (req, res) => {
  try {
    const agendas = await Agenda.findAll({ where: { status: 'published' } });
    res.status(200).json(agendas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Публікація агенди
exports.publishAgenda = async (req, res) => {
  try {
    const { id } = req.params;
    const agenda = await Agenda.update({ status: 'published' }, { where: { id } });
    res.status(200).json({ message: 'Agenda published successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
