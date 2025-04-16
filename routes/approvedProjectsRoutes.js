const express = require("express");
const router = express.Router();
const approvedProjectsController = require("../controllers/approvedProjectsController");
const authenticat = require("../middleware/auth"); // Переконайся, що цей файл існує

// 📌 Отримати інформацію про конкретного PM за його ID
router.get("/pm/:pmId", authenticat, approvedProjectsController.getProjectManagerById);

// 📌 Отримати всі фінальні рішення журі
router.get("/jury-decisions/final", authenticat, approvedProjectsController.getFinalJuryDecisions);

module.exports = router;
