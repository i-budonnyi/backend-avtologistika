require("dotenv").config();
const { Sequelize } = require("sequelize");

// ��������� ���������� �� Render PostgreSQL
const sequelize = new Sequelize(
  "idea_backend_db", // ����� ���� �����
  "idea_user",       // ��'� �����������
  "fK2W0gYFdKpMY2zRq5mVF4L97Kv4VkOy", // ������
  {
    host: "dpg-cvvokdi4d50c739ja380-a", // ����
    dialect: "postgres", // ������������� PostgreSQL
    logging: false, // �������� ���� SQL-������ (�����������)
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

// �������� ����������
sequelize.authenticate()
  .then(() => {
    console.log("? Database connection has been established successfully.");
  })
  .catch((error) => {
    console.error("? Unable to connect to the database:", error.message);
  });

module.exports = sequelize;
