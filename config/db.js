require("dotenv").config();
const { Sequelize } = require("sequelize");

// ��������� ����������
const sequelize = new Sequelize(
  process.env.DB_NAME || "avtologistika", // ����� ���� �����
  process.env.DB_USER || "postgres",      // ��'� �����������
  process.env.DB_PASSWORD || "Pmzpolska2024", // ������
  {
    host: process.env.DB_HOST || "192.168.0.116", // ����
    dialect: "postgres", // ������������� PostgreSQL
    logging: false, // �������� ���� SQL-������ (�����������)
  }
);

// �������� ����������
sequelize.authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error.message);
  });

module.exports = sequelize;
