require("dotenv").config();
const { Sequelize } = require("sequelize");

// ✅ Параметри підключення
const sequelize = new Sequelize(
  process.env.DB_NAME || "avtologistika",   // Назва бази даних
  process.env.DB_USER || "postgres",        // Ім'я користувача
  process.env.DB_PASSWORD || "Pmzpolska2024", // Пароль
  {
    host: process.env.DB_HOST || "192.168.0.116", // Хост
    dialect: "postgres", // Використовуємо PostgreSQL
    logging: false, // Вимикаємо логи SQL-запитів
  }
);

// ✅ Перевірка підключення
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

// Викликаємо підключення до бази
connectDB();

// ✅ Експортуємо sequelize БЕЗ `{}` ✅
module.exports = sequelize;  // ⬅️ ВАЖЛИВО! Без { }
