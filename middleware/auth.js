const jwt = require("jsonwebtoken");
const { sequelize } = require("../config/database");
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
        const userId = decoded.userId;

        if (!userId) {
            console.log("[AUTH] ❌ Некоректний токен (відсутній userId)");
            return res.status(401).json({ error: "Токен недійсний" });
        }

        // ✅ Отримання користувача з бази
        const [user] = await sequelize.query(
            `SELECT id, first_name, last_name, email, role FROM users WHERE id = :userId`,
            { replacements: { userId }, type: QueryTypes.SELECT }
        );

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
            role: user.role,
        };

        console.log(`[AUTH] ✅ Авторизований: ${user.first_name} ${user.last_name} (${user.email})`);
        next();
    } catch (err) {
        console.error("[AUTH] ❌ Помилка перевірки токена:", err.message);
        return res.status(401).json({ error: "Токен недійсний" });
    }
};

module.exports = { authenticate };
