const SupervisorProjects = require('../models/SupervisorProjects');
const Supervisors = require('../models/Supervisors');

// Призначити супервізора
exports.assignSupervisor = async (req, res) => {
    try {
        const { supervisor_id, project_id, assigned_by_pm_id } = req.body;

        if (!supervisor_id || !project_id || !assigned_by_pm_id) {
            return res.status(400).json({ message: 'Усі поля мають бути заповнені' });
        }

        const assignment = await SupervisorProjects.create({
            supervisor_id,
            project_id,
            assigned_by_pm_id,
        });

        res.status(201).json({ message: 'Супервізора успішно призначено', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Отримати всі призначення
exports.getAssignments = async (req, res) => {
    try {
        const assignments = await SupervisorProjects.findAll({
            include: [
                {
                    model: Supervisors,
                    attributes: ['first_name', 'last_name', 'email', 'phone'],
                },
            ],
        });

        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};

// Видалити призначення
exports.deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;

        const assignment = await SupervisorProjects.destroy({ where: { id } });

        if (!assignment) {
            return res.status(404).json({ message: 'Призначення не знайдено' });
        }

        res.status(200).json({ message: 'Призначення успішно видалено' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};
