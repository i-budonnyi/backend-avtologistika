const express = require("express");
const router = express.Router();
const agendaController = require("../controllers/agendaController");
const authenticate = require("../middleware/auth"); // Використовуємо твій метод автентифікації

// ✅ Створення порядку денного (лише для авторизованих користувачів)
router.post("/create", authenticate, agendaController.createAgenda);

// ✅ Отримання всіх записів порядку денного (лише для авторизованих користувачів)
router.get("/", authenticate, agendaController.getAllAgendas);

// ✅ Отримання конкретного порядку денного за ID (лише для авторизованих користувачів)
router.get("/:id", authenticate, agendaController.getAgendaById);

module.exports = router;
