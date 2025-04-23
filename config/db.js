require("dotenv").config();
const { Sequelize } = require("sequelize");

// Параметри підключення до Render PostgreSQL
const sequelize = new Sequelize(
  "idea_backend_db", // Назва бази даних
  "idea_user",       // Ім'я користувача
  "fK2W0gYFdKpMY2zRq5mVF4L97Kv4VkOy", // Пароль
  {
    host: "dpg-cvvokdi4d50c739ja380-a", // Хост
    dialect: "postgres", // Використовуємо PostgreSQL
    logging: false, // Вимикаємо логи SQL-запитів (опціонально)
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

// Перевірка підключення
sequelize.authenticate()
  .then(() => {
    console.log("? Database connection has been established successfully.");
  })
  .catch((error) => {
    console.error("? Unable to connect to the database:", error.message);
  });

module.exports = sequelize;
