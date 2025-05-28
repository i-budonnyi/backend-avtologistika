const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Призначити супервізора
exports.assignSupervisor = async (req, res) => {
  try {
    const { supervisor_id, project_id, assigned_by_pm_id } = req.body;

    if (!supervisor_id || !project_id || !assigned_by_pm_id) {
      return res.status(400).json({ message: 'Усі поля мають бути заповнені' });
    }

    const [assignment] = await sequelize.query(
      `INSERT INTO supervisor_projects (supervisor_id, project_id, assigned_by_pm_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      {
        bind: [supervisor_id, project_id, assigned_by_pm_id],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: 'Супервізора успішно призначено', assignment });
  } catch (error) {
    console.error('❌ assignSupervisor error:', error);
    res.status(500).json({ message: 'Помилка сервера', error });
  }
};

// Отримати всі призначення з даними супервізорів
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await sequelize.query(
      `SELECT sp.*, s.first_name, s.last_name, s.email, s.phone
       FROM supervisor_projects sp
       JOIN supervisors s ON sp.supervisor_id = s.id`,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(assignments);
  } catch (error) {
    console.error('❌ getAssignments error:', error);
    res.status(500).json({ message: 'Помилка сервера', error });
  }
};

// Видалити призначення
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await sequelize.query(
      `DELETE FROM supervisor_projects
       WHERE id = $1
       RETURNING *`,
      {
        bind: [id],
        type: QueryTypes.DELETE,
      }
    );

    if (!deleted) {
      return res.status(404).json({ message: 'Призначення не знайдено' });
    }

    res.status(200).json({ message: 'Призначення успішно видалено' });
  } catch (error) {
    console.error('❌ deleteAssignment error:', error);
    res.status(500).json({ message: 'Помилка сервера', error });
  }
};
