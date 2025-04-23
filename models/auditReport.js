// models/auditReport.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Auditor = require("./auditor");

const AuditReport = sequelize.define("AuditReport", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  auditor_id: { 
    type: DataTypes.INTEGER, 
    references: { model: Auditor, key: "id" },
    allowNull: false,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = AuditReport;
