// models/auditorAssignment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Auditor = require("./auditor");
const Project = require("./project");

const AuditorAssignment = sequelize.define("AuditorAssignment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  auditor_id: { 
    type: DataTypes.INTEGER, 
    references: { model: Auditor, key: "id" },
    allowNull: false,
  },
  project_id: { 
    type: DataTypes.INTEGER, 
    references: { model: Project, key: "id" },
    allowNull: false,
  },
  assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { 
    type: DataTypes.ENUM("assigned", "in progress", "completed"), 
    defaultValue: "assigned" 
  },
});

module.exports = AuditorAssignment;
