// ✅ src/config/database.js
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.PG_DATABASE,         // Назва бази даних
  process.env.PG_USER,             // Користувач бази даних
  process.env.PG_PASSWORD,         // Пароль користувача
  {
    host: process.env.PG_HOST,     // Хост бази даних
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

module.exports = sequelize;
