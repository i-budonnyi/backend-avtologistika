// models/application.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Ambassador = require("./ambassador");

const Application = sequelize.define("Application", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  ambassador_id: { 
    type: DataTypes.INTEGER, 
    references: { model: Ambassador, key: "id" },
    allowNull: false,
  },
  type: { type: DataTypes.STRING, allowNull: false }, // "idea" or "problem"
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  status: { 
    type: DataTypes.ENUM("draft", "submitted", "approved", "rejected"), 
    defaultValue: "draft",
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Application;
