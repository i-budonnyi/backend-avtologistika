// 📌 server.js — головний файл сервера Express
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const sequelize = require("./config/db");
const authRoutes = require("./routes/authRoutes"); // 🔥 авторизаційні маршрути

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Налаштування CORS
app.use(cors({
  origin: ["https://leanavtologistika.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Парсер JSON
app.use(express.json());

// ✅ Встановлення Content-Type за замовчуванням
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// 📝 Логування запитів
app.use((req, res, next) => {
  const log = `[${new Date().toISOString()}] Method: ${req.method}, URL: ${req.url}, IP: ${req.ip}`;
  console.log(log);
  fs.appendFile("server.log", log + "\n", (err) => {
    if (err) console.error("Error writing log:", err.message);
  });
  next();
});

// 🔐 Middleware для перевірки токенів
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// ✅ Пряме підключення маршрутів авторизації
app.use("/", authRoutes); // POST /register, /login, GET /me

// 📁 Автоматичне підключення інших роутів з папки routes/
const routesDir = path.join(__dirname, "routes");
fs.readdirSync(routesDir).forEach((file) => {
  if (file.endsWith(".js") && file !== "authRoutes.js") {
    const filePath = path.join(routesDir, file);
    const router = require(filePath);

    if (typeof router === "function" && router.stack) {
      const routeBase = file === "index.js" ? "/" : `/${file.replace(".js", "")}`;
      app.use(`/api${routeBase}`, router);
      console.log(`[ROUTES] Підключено: /api${routeBase}`);
    } else {
      console.warn(`[ROUTES] Пропущено ${file} — не express.Router`);
    }
  }
});

// 📦 Логування відповідей сервера
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

// 🔌 Підключення до бази даних
sequelize.authenticate()
  .then(() => console.log("[DATABASE] Підключення успішне"))
  .catch((error) => {
    console.error("[DATABASE] Помилка підключення:", error.message);
    process.exit(1);
  });

// 🚀 Запуск сервера
app.listen(PORT, () => {
  console.log(`[SERVER] Сервер запущено на порту ${PORT}`);
});
