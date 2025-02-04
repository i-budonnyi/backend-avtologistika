// routes/auditorAssignmentRoutes.js
const express = require("express");
const router = express.Router();
const auditorAssignmentController = require("../controllers/auditorAssignmentController");

// Призначення аудитора
router.post("/assign", auditorAssignmentController.assignAuditor);

// Отримання призначень
router.get("/:auditor_id", auditorAssignmentController.getAssignments);

// Оновлення статусу призначення
router.put("/:id/status", auditorAssignmentController.updateAssignmentStatus);

module.exports = router;
