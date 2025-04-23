const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Шлях до вашого файлу конфігурації бази даних

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      unique: true,
      allowNull: true, // Поле не обов'язкове
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    profile_picture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: 'user', // Значення за замовчуванням
    },
  },
  {
    tableName: 'users', // Назва таблиці
    timestamps: false, // Вимикаємо автоматичне додавання createdAt і updatedAt
    underscored: true, // Перетворення camelCase в snake_case
  }
);

module.exports = User;
