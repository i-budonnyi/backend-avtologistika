const express = require("express");
const router = express.Router();
const approvedProjectsController = require("../controllers/approvedProjectsController");
const authenticat = require("../middleware/auth"); // Переконайся, що middleware існує

// 📌 Отримати поточного залогіненого PM
router.get("/pm/me", authenticat, (req, res, next) => {
    req.params.pmId = req.user.id; // Використовуємо ID авторизованого користувача
    next();
}, approvedProjectsController.getProjectManagerById);

// 📌 Отримати інформацію про конкретного PM за його ID
router.get("/pm/:pmId", authenticat, approvedProjectsController.getProjectManagerById);

// 📌 Отримати всі фінальні рішення журі
router.get("/jury-decisions/final", authenticat, approvedProjectsController.getFinalJuryDecisions);

module.exports = router;
