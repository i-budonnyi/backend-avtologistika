// 📈 server.js — головний файл сервера Express
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const sequelize = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { register, login } = require("./controllers/authController"); // 🔥 пряме підключення

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ CORS
app.use(cors({
  origin: ["https://leanavtologistika.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ JSON
app.use(express.json());

// ✅ Content-Type
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// 📝 Запити
app.use((req, res, next) => {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.url} — IP: ${req.ip}`;
  console.log(log);
  fs.appendFile("server.log", log + "\n", (err) => {
    if (err) console.error("Помилка запису логу:", err.message);
  });
  next();
});

// 🔐 Middleware токена
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

// ✅ Прямі маршрути для /login та /register
app.post("/login", login);
app.post("/register", register);

// ✅ Група маршрутів /api/authRoutes
app.use("/api/authRoutes", authRoutes);

// 📁 Інші файли з /routes
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

// 📤 Відповіді
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

// 🔌 Підключення до бази
sequelize.authenticate()
  .then(() => console.log("[DATABASE] Підключення успішне"))
  .catch((error) => {
    console.error("[DATABASE] Помилка підключення:", error.message);
    process.exit(1);
  });

// 🚀 Сервер
app.listen(PORT, () => {
  console.log(`[SERVER] Сервер запущено на порту ${PORT}`);
});
