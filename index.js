const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const sequelize = require("./config/db");

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ CORS
app.use(cors({
  origin: [
    "https://leanavtologistika.netlify.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ JSON parser
app.use(express.json());

// ✅ Content-Type
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// 🔍 Логування запитів
app.use((req, res, next) => {
  const log = `[${new Date().toISOString()}] Method: ${req.method}, URL: ${req.url}, IP: ${req.ip}`;
  console.log(log);

  fs.appendFile("server.log", log + "\n", (err) => {
    if (err) console.error("Error writing log:", err.message);
  });

  next();
});

// 🔐 Middleware: перевірка токена
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

// 📁 Автоматичне підключення роутів з папки /routes
const routesDir = path.join(__dirname, "routes");
fs.readdirSync(routesDir).forEach((file) => {
  if (file.endsWith(".js")) {
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

// 📦 Логування відповіді
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

// 🔌 Підключення до бази
sequelize
  .authenticate()
  .then(() => console.log(`[DATABASE] Підключення успішне`))
  .catch((error) => {
    console.error(`[DATABASE] Помилка підключення:`, error.message);
    process.exit(1);
  });

// 🚀 Запуск сервера
app.listen(PORT, () => {
  console.log(`[SERVER] Сервер запущено на порту ${PORT}`);
});
