require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.PG_DATABASE,           // Назва бази даних
  process.env.PG_USER,               // Користувач
  process.env.PG_PASSWORD,           // Пароль
  {
    host: process.env.PG_HOST,       // Хост Render (наприклад, dpg-....frankfurt-postgres.render.com)
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
