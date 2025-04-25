require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST, // має бути: idea-backend-db
    port: process.env.PG_PORT || 5432,
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

sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connection has been established successfully.");
  })
  .catch((error) => {
    console.error("❌ Unable to connect to the database:", error.message);
  });

module.exports = sequelize;
