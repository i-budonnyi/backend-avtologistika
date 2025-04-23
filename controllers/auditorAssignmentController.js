// controllers/auditorAssignmentController.js
const AuditorAssignment = require("../models/auditorAssignment");

// Призначення аудитора на проєкт
exports.assignAuditor = async (req, res) => {
  try {
    const { auditor_id, project_id } = req.body;

    const assignment = await AuditorAssignment.create({
      auditor_id,
      project_id,
      status: "assigned",
    });

    res.status(201).json({ message: "Auditor assigned successfully", assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Отримання призначень аудитора
exports.getAssignments = async (req, res) => {
  try {
    const { auditor_id } = req.params;

    const assignments = await AuditorAssignment.findAll({
      where: { auditor_id },
    });

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Оновлення статусу призначення
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await AuditorAssignment.update(
      { status },
      { where: { id } }
    );

    res.status(200).json({ message: "Assignment status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
