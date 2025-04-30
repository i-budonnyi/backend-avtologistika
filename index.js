// 📈 server.js — головний файл сервера Express
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const sequelize = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const ideaRoutes = require("./routes/ideaRoutes"); // ✅ пряме підключення
const { register, login } = require("./controllers/authController");

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ CORS
app.use(cors({
  origin: ["https://leanavtologistika.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ JSON парсер
app.use(express.json());

// ✅ Заголовки Content-Type
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// 📝 Глобальне логування вхідних запитів
app.use((req, res, next) => {
  const now = new Date().toISOString();
  const log = `[${now}] ${req.method} ${req.originalUrl} — IP: ${req.ip}`;
  console.log("\n" + log);
  console.log("🔸 Headers:", req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📦 Body:", req.body);
  }
  fs.appendFile("server.log", log + "\n", (err) => {
    if (err) console.error("Помилка запису логу:", err.message);
  });
  next();
});

// 🔐 Middleware для перевірки токена
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

// ✅ Прямі маршрути для логіну та реєстрації
app.post("/login", login);
app.post("/register", register);

// ✅ authRoutes окремо
app.use("/api/authRoutes", authRoutes);

// ✅ ideaRoutes — ПРЯМО
app.use("/api/ideaRoutes", ideaRoutes);

// 📁 Автоматичне підключення інших роутиків з /routes (крім уже підключених)
const routesDir = path.join(__dirname, "routes");
fs.readdirSync(routesDir).forEach((file) => {
  if (
    file.endsWith(".js") &&
    file !== "authRoutes.js" &&
    file !== "ideaRoutes.js"
  ) {
    const routeName = file.replace(".js", "");
    const fullPath = `/api/${routeName}`;
    const filePath = path.join(routesDir, file);
    const router = require(filePath);
    app.use(fullPath, router);
    console.log(`[ROUTES] ✅ Підключено: ${fullPath}`);
  }
});

// 🛠 Простий ping для перевірки доступності
app.get("/api/ping", (req, res) => {
  console.log("🔔 Пінг від клієнта: бекенд живий");
  res.status(200).json({ message: "pong" });
});

// 📤 Логування відповідей
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    console.log(`[RESPONSE] ${res.statusCode} =>`, body);
    fs.appendFile(
      "server.log",
      `[${new Date().toISOString()}] Response ${res.statusCode}: ${JSON.stringify(body)}\n`,
      (err) => {
        if (err) console.error("Помилка логування відповіді:", err.message);
      }
    );
    originalSend.apply(res, arguments);
  };
  next();
});
app.get("/api/ideaRoutes/ambassadors", (req, res) => {
  console.log("✅ Запит на амбасадорів (тимчасовий)");
  res.json([
    { id: 1, first_name: "Test", last_name: "Ambassador" },
    { id: 2, first_name: "Demo", last_name: "User" }
  ]);
});

app.post("/api/ideaRoutes", (req, res) => {
  console.log("✅ Отримано ідею:", req.body);
  res.status(201).json({ message: "Ідея прийнята (тимчасово)" });
});

// 🔌 Перевірка підключення до бази даних
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
