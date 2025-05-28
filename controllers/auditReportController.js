const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Створення аудиторського звіту
exports.createReport = async (req, res) => {
  try {
    const { auditor_id, title, content } = req.body;

    const [report] = await sequelize.query(
      `INSERT INTO audit_reports (auditor_id, title, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      {
        bind: [auditor_id, title, content],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: "Report created successfully", report });
  } catch (error) {
    console.error('❌ createReport error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Отримання звітів аудитора
exports.getReports = async (req, res) => {
  try {
    const { auditor_id } = req.params;

    const reports = await sequelize.query(
      `SELECT * FROM audit_reports WHERE auditor_id = $1`,
      {
        bind: [auditor_id],
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(reports);
  } catch (error) {
    console.error('❌ getReports error:', error);
    res.status(500).json({ error: error.message });
  }
};
