// routes/auditReportRoutes.js
const express = require("express");
const router = express.Router();
const auditReportController = require("../controllers/auditReportController");

// Створення звіту
router.post("/", auditReportController.createReport);

// Отримання звітів аудитора
router.get("/:auditor_id", auditReportController.getReports);

module.exports = router;
