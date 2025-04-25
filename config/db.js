require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.PG_DATABASE,         // ✅ Назва бази даних
  process.env.PG_USER,             // ✅ Користувач БД
  process.env.PG_PASSWORD,         // ✅ Пароль
  {
    host: process.env.PG_HOST,     // ✅ Хост з .env (наприклад: dpg-...frankfurt-postgres.render.com)
    port: Number(process.env.PG_PORT) || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

// ✅ Перевірка підключення
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connection has been established successfully.");
  })
  .catch((error) => {
    console.error("❌ Unable to connect to the database:", error.message);
    process.exit(1); // Вийти з процесу при фейлі
  });

module.exports = sequelize;
