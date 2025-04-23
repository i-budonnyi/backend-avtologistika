const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db"); // Підключення до БД

/**
 * ✅ Отримати всіх Project Manager-ів через `user_roles`
 */
const getAllProjectManagers = async (req, res) => {
    try {
        console.log("📌 Отримання всіх Project Manager-ів...");

        const projectManagers = await sequelize.query(
            `SELECT u.id AS pm_id, u.first_name, u.last_name, u.phone, u.email, 
                    r.name AS role
             FROM users u
             LEFT JOIN user_roles ur ON u.id = ur.user_id
             LEFT JOIN roles r ON ur.role_id = r.id
             WHERE r.name = 'project_manager'
             ORDER BY u.last_name ASC`,
            { type: QueryTypes.SELECT }
        );

        console.log(`✅ Знайдено ${projectManagers.length} PM-ів.`);
        res.status(200).json(projectManagers);

    } catch (error) {
        console.error("❌ Помилка отримання Project Manager-ів:", error);
        res.status(500).json({ error: "Не вдалося отримати Project Manager-ів." });
    }
};

/**
 /**
 * ✅ Отримати конкретного Project Manager за user_id через `user_roles`
 */
const getProjectManagerById = async (req, res) => {
    try {
        let { user_id } = req.params;

        // Якщо `user_id` == "me", замінюємо його на `req.user.id`
        if (user_id === "me") {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: "Користувач не автентифікований." });
            }
            user_id = req.user.id;
        }

        user_id = parseInt(user_id, 10);

        if (isNaN(user_id)) {
            return res.status(400).json({ error: "Некоректний user_id." });
        }

        console.log(`📌 Отримання інформації про PM з user_id=${user_id}`);

        const projectManager = await sequelize.query(
            `SELECT u.id AS pm_id, u.first_name, u.last_name, u.phone, u.email, 
                    r.name AS role
             FROM users u
             LEFT JOIN user_roles ur ON u.id = ur.user_id
             LEFT JOIN roles r ON ur.role_id = r.id
             WHERE u.id = :user_id AND r.name = 'project_manager'
             LIMIT 1`,
            {
                replacements: { user_id },
                type: QueryTypes.SELECT,
            }
        );

        if (!projectManager.length) {
            return res.status(404).json({ error: "Project Manager не знайдений." });
        }

        console.log("✅ Project Manager знайдений:", projectManager[0]);
        res.status(200).json(projectManager[0]);

    } catch (error) {
        console.error("❌ Помилка отримання Project Manager:", error);
        res.status(500).json({ error: "Не вдалося отримати Project Manager." });
    }
};


/**
 * ✅ Отримати поточного залогіненого Project Manager через `user_roles`
 */
const getLoggedProjectManager = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Користувач не автентифікований." });
        }

        let user_id = parseInt(req.user.id, 10);

        if (isNaN(user_id)) {
            return res.status(400).json({ error: "Некоректний user_id." });
        }

        console.log(`📌 Отримання даних Project Manager для user_id=${user_id}`);

        const projectManager = await sequelize.query(
            `SELECT u.id AS pm_id, u.first_name, u.last_name, u.phone, u.email, 
                    r.name AS role
             FROM users u
             LEFT JOIN user_roles ur ON u.id = ur.user_id
             LEFT JOIN roles r ON ur.role_id = r.id
             WHERE u.id = :user_id AND r.name = 'project_manager'
             LIMIT 1`,
            {
                replacements: { user_id },
                type: QueryTypes.SELECT,
            }
        );

        if (!projectManager.length) {
            return res.status(404).json({ error: "Project Manager не знайдений." });
        }

        console.log("📢 Відповідь сервера на /api/pm/me:", projectManager[0]);

        res.status(200).json(projectManager[0]);

    } catch (error) {
        console.error("❌ Помилка отримання залогіненого Project Manager:", error);
        res.status(500).json({ error: "Не вдалося отримати Project Manager.", details: error.message });
    }
};

console.log("🟢 Контролер projectManagerController.js завантажено!");
module.exports = { getAllProjectManagers, getProjectManagerById, getLoggedProjectManager };
