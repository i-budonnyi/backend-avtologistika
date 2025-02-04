const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // ✅ Додаємо імпорт

const Idea = sequelize.define(
  "Idea",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "ideas", timestamps: false }
);

module.exports = Idea;
