const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");

// Призначення аудитора на проєкт
exports.assignAuditor = async (req, res) => {
  try {
    const { auditor_id, project_id } = req.body;

    const [assignment] = await sequelize.query(
      `INSERT INTO auditor_assignments (auditor_id, project_id, status)
       VALUES ($1, $2, 'assigned')
       RETURNING *`,
      {
        bind: [auditor_id, project_id],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: "Auditor assigned successfully", assignment });
  } catch (error) {
    console.error("❌ assignAuditor error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Отримання призначень аудитора
exports.getAssignments = async (req, res) => {
  try {
    const { auditor_id } = req.params;

    const assignments = await sequelize.query(
      `SELECT * FROM auditor_assignments WHERE auditor_id = $1`,
      {
        bind: [auditor_id],
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(assignments);
  } catch (error) {
    console.error("❌ getAssignments error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Оновлення статусу призначення
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [updated] = await sequelize.query(
      `UPDATE auditor_assignments SET status = $1 WHERE id = $2 RETURNING *`,
      {
        bind: [status, id],
        type: QueryTypes.UPDATE,
      }
    );

    if (updated) {
      res.status(200).json({ message: "Assignment status updated successfully" });
    } else {
      res.status(404).json({ message: "Assignment not found" });
    }
  } catch (error) {
    console.error("❌ updateAssignmentStatus error:", error);
    res.status(500).json({ error: error.message });
  }
};
