// controllers/auditReportController.js
const AuditReport = require("../models/auditReport");

// Створення аудиторського звіту
exports.createReport = async (req, res) => {
  try {
    const { auditor_id, title, content } = req.body;

    const report = await AuditReport.create({
      auditor_id,
      title,
      content,
    });

    res.status(201).json({ message: "Report created successfully", report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Отримання звітів аудитора
exports.getReports = async (req, res) => {
  try {
    const { auditor_id } = req.params;

    const reports = await AuditReport.findAll({
      where: { auditor_id },
    });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
