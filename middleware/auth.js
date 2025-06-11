const jwt = require("jsonwebtoken");
const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log("[AUTH] ❌ Заголовок авторизації відсутній");
            return res.status(401).json({ error: "Заголовок авторизації відсутній" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            console.log("[AUTH] ❌ Токен не знайдено в заголовку");
            return res.status(401).json({ error: "Токен відсутній" });
        }

        // ✅ Розшифровка токена
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        if (!userId) {
            console.log("[AUTH] ❌ Токен не містить ID користувача");
            return res.status(401).json({ error: "Токен недійсний" });
        }

        // ✅ Отримання користувача з БД
        const [user] = await sequelize.query(
            `
            SELECT 
                u.id, 
                u.first_name, 
                u.last_name, 
                u.email, 
                COALESCE(r.name, 'user') AS role
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.id = :userId
            LIMIT 1;
            `,
            {
                replacements: { userId },
                type: QueryTypes.SELECT
            }
        );

        if (!user) {
            console.log("[AUTH] ❌ Користувача з ID", userId, "не знайдено");
            return res.status(401).json({ error: "Користувача не знайдено" });
        }

        req.user = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
        };

        console.log(`[AUTH] ✅ Авторизовано: ${user.first_name} ${user.last_name} (${user.email}) | Роль: ${user.role}`);
        next();

    } catch (err) {
        console.error("[AUTH] ❌ Помилка токена:", err.message);
        return res.status(401).json({ error: "Недійсний токен" });
    }
};

module.exports = authenticate;
