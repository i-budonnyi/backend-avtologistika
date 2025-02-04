const express = require('express');
const router = express.Router();

// Імпорт контролера
const {
    addDecision,
    getDecisionsForProject,
    getJuryLogs,
    addJuryMember,
} = require('../controllers/juryController');

// Додати рішення журі
router.post('/decisions', addDecision);

// Отримати рішення для проєкту
router.get('/decisions/:project_id', getDecisionsForProject);

// Отримати лог дій журі
router.get('/logs/:jury_member_id', getJuryLogs);

// Додати нового члена журі
router.post('/members', addJuryMember);

module.exports = router;
