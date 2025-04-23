const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // НЕ { sequelize }

// 🔹 Оголошення моделі User
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: { // 🔸 додано phone
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: "users",      // Назва таблиці в базі даних
  timestamps: false        // Не використовуємо createdAt / updatedAt
});

module.exports = User;
