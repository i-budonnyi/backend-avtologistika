// routes/agendaRoutes.js
const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const agendaItemController = require('../controllers/agendaItemController');

// Роутинг для Agenda
router.post('/agenda', agendaController.createAgenda);
router.get('/agenda', agendaController.getAgendas);
router.put('/agenda/:id', agendaController.publishAgenda);

// Роутинг для Agenda Items
router.post('/agenda/items', agendaItemController.createAgendaItem);
router.put('/agenda/items/:id', agendaItemController.updateAgendaItemStatus);
router.get('/agenda/:agenda_id/items', agendaItemController.getAgendaItems);

module.exports = router;
