const jwt = require("jsonwebtoken");
const fs = require("fs");
const UserRoles = require("../models/UserRoles"); // Модель користувачів
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Логування
const logEvent = (type, endpoint, details, ip = "unknown") => {
    const logEntry = `[${new Date().toISOString()}] ${type} ${endpoint} (IP: ${ip}): ${JSON.stringify(details, null, 2)}\n`;
    try {
        fs.appendFileSync("server.log", logEntry);
    } catch (err) {
        console.error("[ERROR] Неможливо записати лог:", err.message);
    }
    console.log(logEntry);
};

// Перевірка токена і витягування ID користувача
const getUserFromToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            logEvent("ERROR", req.path, { message: "Токен не передано" }, req.ip);
            return res.status(401).json({ message: "Доступ заборонено. Токен не передано." });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.user_id;

        if (!userId) {
            logEvent("ERROR", req.path, { message: "ID користувача не знайдено в токені" }, req.ip);
            return res.status(400).json({ message: "ID користувача не знайдено в токені" });
        }

        logEvent("USER_FROM_TOKEN_SUCCESS", req.path, { userId }, req.ip);

        // ✅ Отримуємо користувача з усіма необхідними полями
        const user = await UserRoles.findByPk(userId, {
            attributes: ["id", "first_name", "last_name", "email", "role", "phone"], // Додаємо role і phone
        });

        if (!user) {
            logEvent("USER_NOT_FOUND", req.path, { userId }, req.ip);
            return res.status(404).json({ message: "Користувача не знайдено" });
        }

        logEvent("USER_FETCH_SUCCESS", req.path, user, req.ip);

        // ✅ Переконуємось, що всі поля існують
        return res.status(200).json({
            id: user.id,
            firstName: user.first_name || "Невідоме ім'я",
            lastName: user.last_name || "Невідоме прізвище",
            email: user.email || "Невідомий email",
            phone: user.phone || "Невідомий номер", // Додаємо phone
            role: user.role || "Роль невідома", // Додаємо role
        });
    } catch (error) {
        logEvent("ERROR", req.path, { message: error.message }, req.ip);
        return res.status(500).json({ message: "Внутрішня помилка сервера", error: error.message });
    }
};

// Вихід користувача (фронт сам очищує токен)
const logout = (req, res) => {
    logEvent("LOGOUT", req.path, {}, req.ip);
    return res.status(200).json({ message: "Користувач вийшов із системи." });
};

module.exports = {
    getUserFromToken,
    logout,
};
