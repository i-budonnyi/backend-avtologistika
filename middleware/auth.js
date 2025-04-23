const jwt = require("jsonwebtoken");
const sequelize = require("../config/database"); // ✅ Правильний імпорт
const { QueryTypes } = require("sequelize");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            console.log("[AUTH] ❌ Токен відсутній");
            return res.status(401).json({ error: "Токен відсутній" });
        }

        // ✅ Розшифровка токена
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id; // 🛠 Виправлено з `userId` на `id`

        if (!userId) {
            console.log("[AUTH] ❌ Некоректний токен (відсутній ID користувача)");
            return res.status(401).json({ error: "Токен недійсний" });
        }

        // ✅ Отримання користувача з бази
        const userQuery = `
            SELECT u.id, u.first_name, u.last_name, u.email, COALESCE(r.name, 'user') AS role
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.id = :userId
            LIMIT 1;
        `;

        const [user] = await sequelize.query(userQuery, {
            replacements: { userId },
            type: QueryTypes.SELECT
        });

        if (!user) {
            console.log("[AUTH] ❌ Користувач не знайдений у БД.");
            return res.status(401).json({ error: "Користувача не знайдено" });
        }

        // ✅ Додаємо інформацію про користувача в `req.user`
        req.user = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role, // 🛠 Виправлено, щоб правильно передавалася роль
        };

        console.log(`[AUTH] ✅ Авторизований: ${user.first_name} ${user.last_name} (${user.email}) | Роль: ${user.role}`);
        next();
    } catch (err) {
        console.error("[AUTH] ❌ Помилка перевірки токена:", err.message);
        return res.status(401).json({ error: "Токен недійсний" });
    }
};

module.exports = authenticate; // ✅ Виправлений експорт
