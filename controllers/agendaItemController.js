const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Додавання пункту до порядку денного
exports.createAgendaItem = async (req, res) => {
  try {
    const { agenda_id, description } = req.body;

    const [agendaItem] = await sequelize.query(
      `INSERT INTO agenda_items (agenda_id, description)
       VALUES ($1, $2)
       RETURNING *`,
      {
        bind: [agenda_id, description],
        type: QueryTypes.INSERT,
      }
    );

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

    const [updated] = await sequelize.query(
      `UPDATE agenda_items
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      {
        bind: [status, id],
        type: QueryTypes.UPDATE,
      }
    );

    if (updated) {
      res.status(200).json({ message: 'Agenda item status updated successfully' });
    } else {
      res.status(404).json({ message: 'Agenda item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Отримання пунктів конкретної агенди
exports.getAgendaItems = async (req, res) => {
  try {
    const { agenda_id } = req.params;

    const items = await sequelize.query(
      `SELECT * FROM agenda_items WHERE agenda_id = $1`,
      {
        bind: [agenda_id],
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
