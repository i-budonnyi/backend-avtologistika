const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const sequelize = require("./config/db");
const UserModel = require("./models/users");
const UserRoleModel = require("./models/UserRoles");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ CORS: дозволяємо localhost, Netlify та твій ngrok
app.use(cors({
  origin: [
    "http://localhost:8080",
    "https://serene-fairy-1a0577.netlify.app",
    "https://nearby-walrus-crucial.ngrok-free.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// Логування запитів
app.use((req, res, next) => {
  const log = `[${new Date().toISOString()}] Method: ${req.method}, URL: ${req.url}, IP: ${req.ip}`;
  console.log(log);

  fs.appendFile("server.log", log + "\n", (err) => {
    if (err) console.error("Error writing log:", err.message);
  });

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

// ✅ Автоматичне підключення всіх роутів з папки routes
const routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith(".js")) {
    try {
      const routePath = path.join(routesPath, file);
      const route = require(routePath);

      if (route && Object.getPrototypeOf(route) === express.Router) {
        const routeName = file === "index.js" ? "" : file.replace(".js", "");
        app.use(`/api/${routeName}`, route);
        console.log(`[ROUTES] Підключено маршрут: /api/${routeName}`);
      } else {
        console.error(`[ERROR] Файл ${file} не експортує коректний маршрут`);
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

// Підключення до бази даних
sequelize
  .sync()
  .then(() => console.log(`[DATABASE] Синхронізація бази даних успішна`))
  .catch((error) => {
    console.error(`[DATABASE] Помилка синхронізації:`, error.message);
    process.exit(1);
  });

// ✅ Запуск сервера без хоста — Render сам підставить правильний
app.listen(PORT, () => {
  console.log(`[SERVER] Сервер запущено на порту ${PORT}`);
});
