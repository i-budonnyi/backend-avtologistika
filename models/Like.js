const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // ✅ Правильний імпорт

const Like = sequelize.define(
  "Like",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    ideaId: { type: DataTypes.INTEGER, allowNull: true },
    blogId: { type: DataTypes.INTEGER, allowNull: true }, // ✅ Виправлено problemId -> blogId
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "likes", timestamps: false }
);

module.exports = Like;
