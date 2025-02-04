const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const sequelize = require("./config/db"); // Підключення Sequelize
const UserModel = require("./models/users"); // Імпортуємо модель користувача
const UserRoleModel = require("./models/UserRoles"); // Імпортуємо модель ролей користувача

const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST || "192.168.0.116"; // Ваша IP-адреса

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Middleware для обробки JSON та встановлення правильного кодування
app.use(cors({ origin: `http://${host}:8080` })); // Доступ лише з фронтенда
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    next();
});

// Логування запитів
app.use((req, res, next) => {
    const log = `[${new Date().toISOString()}] Method: ${req.method}, URL: ${req.url}, IP: ${req.ip}`;
    console.log(log);

    // Асинхронний запис до файлу
    fs.appendFile("server.log", log + "\n", (err) => {
        if (err) console.error("Error writing log:", err.message);
    });

    console.log(`[PROCESS] Запит отримано: ${req.method} ${req.url}`);
    next();
});

// Middleware для перевірки токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
    });
};

// Контролер для отримання профілю користувача
const getUserProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await UserModel.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userRole = await UserRoleModel.findOne({ where: { user_id: userId } });

        return res.status(200).json({
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                email: user.email,
                role: userRole ? userRole.role_id : null,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Маршрут для отримання профілю користувача
app.get("/api/profile", authenticateToken, getUserProfile);

// Автоматичне підключення всіх роутів із папки `routes`
const routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith(".js")) {
        try {
            const route = require(path.join(routesPath, file));
            const routeName = file === "index.js" ? "" : file.replace(".js", ""); // Видалення .js із назви

            if (typeof route === "function" || route instanceof express.Router) {
                app.use(`/api/${routeName}`, route);
                console.log(`[ROUTES] Підключено маршрут: /api/${routeName}`);
            } else {
                console.error(`[ERROR] Некоректний маршрут у файлі: ${file}.`);
            }
        } catch (error) {
            console.error(`[ERROR] Неможливо підключити маршрут ${file}:`, error.message);
        }
    }
});

// Логування відповіді
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        console.log(`[RESPONSE] Статус: ${res.statusCode}, Відповідь:`, body);
        fs.appendFile(
            "server.log",
            `[${new Date().toISOString()}] Response Status: ${res.statusCode}, Body: ${JSON.stringify(body)}\n`,
            (err) => {
                if (err) console.error("Error writing log:", err.message);
            }
        );
        originalSend.apply(res, arguments);
    };
    next();
});

// Перевірка синхронізації бази даних
sequelize
    .sync()
    .then(() => console.log(`[DATABASE] Синхронізація бази даних успішна`))
    .catch((error) => {
        console.error(`[DATABASE] Помилка синхронізації бази даних:`, error.message);
        process.exit(1);
    });

// Запуск сервера
app.listen(port, host, () => {
    console.log(`[SERVER] Сервер запущено на http://${host}:${port}`);
});
