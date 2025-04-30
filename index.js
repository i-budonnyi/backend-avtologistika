// 📈 server.js — головний файл сервера Express
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const sequelize = require("./config/db");
const authRoutes = require("./routes/authRoutes");
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

// ✅ Окремо підключаємо authRoutes
app.use("/api/authRoutes", authRoutes);

// 📁 Автоматично підключаємо всі інші роути з /routes
const routesDir = path.join(__dirname, "routes");

fs.readdirSync(routesDir).forEach((file) => {
  if (file.endsWith(".js") && file !== "authRoutes.js") {
    const filePath = path.join(routesDir, file);
    const router = require(filePath);

    if (typeof router === "function" && router.stack) {
      const routeBase = file === "index.js" ? "/" : `/${file.replace(".js", "")}`;
      const fullPath = `/api${routeBase}`;

      app.use(fullPath, (req, res, next) => {
        console.log(`📥 [ROUTE] Запит на ${req.method} ${fullPath}${req.url}`);
        next();
      }, router);

      console.log(`[ROUTES] Підключено: ${fullPath}`);
    } else {
      console.warn(`[ROUTES] Пропущено ${file} — не express.Router`);
    }
  }
});

// 📤 Логування відповідей (тільки для JSON)
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
