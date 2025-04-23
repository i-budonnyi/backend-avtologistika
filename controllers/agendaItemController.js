// controllers/agendaItemController.js
const AgendaItem = require('../models/agendaItem');

// Додавання пункту до порядку денного
exports.createAgendaItem = async (req, res) => {
  try {
    const { agenda_id, description } = req.body;
    const agendaItem = await AgendaItem.create({ agenda_id, description });
    res.status(201).json(agendaItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Оновлення статусу пункту
exports.updateAgendaItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await AgendaItem.update({ status }, { where: { id } });
    res.status(200).json({ message: 'Agenda item status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Отримання пунктів конкретної агенди
exports.getAgendaItems = async (req, res) => {
  try {
    const { agenda_id } = req.params;
    const items = await AgendaItem.findAll({ where: { agenda_id } });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
