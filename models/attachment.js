// models/attachment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Attachment = sequelize.define("Attachment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  application_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: "Applications", key: "id" },
  },
  file_name: { type: DataTypes.STRING, allowNull: false },
  file_path: { type: DataTypes.STRING, allowNull: false },
  uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Attachment;
