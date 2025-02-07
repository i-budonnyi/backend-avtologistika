const sequelize = require("../config/database");

console.log("[rolesController] 📌 Ініціалізація контролера ролей...");

// ✅ Отримання ролі користувача
const getUserRole = async (userId) => {
    console.log(`[rolesController] 🔍 Отримуємо роль для userId=${userId}`);
    try {
        const [user] = await sequelize.query(
            `SELECT id, first_name, last_name, email, role, profile_picture 
             FROM users WHERE id = :userId LIMIT 1`,
            {
                replacements: { userId },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!user) {
            console.warn(`[rolesController] ❌ Користувача не знайдено userId=${userId}`);
            return null;
        }

        console.log("[rolesController] ✅ Знайдено роль:", user);
        return user;
    } catch (error) {
        console.error("[rolesController] ❌ Помилка отримання ролі:", error);
        throw error;
    }
};

// ✅ Призначення ролі користувачу
const assignRole = async (req, res) => {
    try {
        const { user_id, role_id } = req.body;
        console.log(`[assignRole] 🏷 Призначення ролі role_id=${role_id} для user_id=${user_id}`);

        const [existingRole] = await sequelize.query(
            `SELECT * FROM user_roles WHERE user_id = :user_id AND role_id = :role_id LIMIT 1`,
            {
                replacements: { user_id, role_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (existingRole) {
            return res.status(400).json({ message: "Користувач вже має цю роль." });
        }

        await sequelize.query(
            `INSERT INTO user_roles (user_id, role_id) VALUES (:user_id, :role_id)`,
            {
                replacements: { user_id, role_id },
                type: sequelize.QueryTypes.INSERT,
            }
        );

        console.log("[assignRole] ✅ Роль успішно призначено.");
        res.status(201).json({ message: "Роль успішно призначено." });
    } catch (error) {
        console.error("[assignRole] ❌ Помилка призначення ролі:", error);
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
};

// ✅ Отримання всіх ролей
const getRoles = async (req, res) => {
    try {
        console.log("[getRoles] 📜 Отримання всіх ролей...");
        const roles = await sequelize.query(
            `SELECT * FROM roles`,
            { type: sequelize.QueryTypes.SELECT }
        );

        console.log(`[getRoles] ✅ Отримано ${roles.length} ролей.`);
        res.status(200).json(roles);
    } catch (error) {
        console.error("[getRoles] ❌ Помилка отримання ролей:", error);
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
};

// ✅ Отримання ролей конкретного користувача
const getUserRoles = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[getUserRoles] 🔍 Отримання ролей для user_id=${id}`);

        const userRoles = await sequelize.query(
            `SELECT * FROM user_roles WHERE user_id = :id`,
            {
                replacements: { id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!userRoles.length) {
            return res.status(404).json({ message: "Ролі для цього користувача не знайдено." });
        }

        console.log(`[getUserRoles] ✅ Знайдено ${userRoles.length} ролей для user_id=${id}`);
        res.status(200).json(userRoles);
    } catch (error) {
        console.error("[getUserRoles] ❌ Помилка отримання ролей користувача:", error);
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
};

module.exports = { getUserRole, assignRole, getRoles, getUserRoles };
