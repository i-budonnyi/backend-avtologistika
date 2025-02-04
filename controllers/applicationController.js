// controllers/applicationController.js
const Application = require("../models/application");

// Створення заявки
exports.createApplication = async (req, res) => {
  try {
    const { user_id, ambassador_id, type, title, content } = req.body;
    const application = await Application.create({
      user_id,
      ambassador_id,
      type,
      title,
      content,
    });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Отримання заявок для амбасадора
exports.getApplicationsForAmbassador = async (req, res) => {
  try {
    const { ambassador_id, status } = req.query;
    const where = { ambassador_id };
    if (status) where.status = status;
    const applications = await Application.findAll({ where });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Оновлення заявки
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, status } = req.body;
    const application = await Application.update(
      { content, status, updated_at: new Date() },
      { where: { id } }
    );
    if (!application[0]) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.status(200).json({ message: "Application updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
