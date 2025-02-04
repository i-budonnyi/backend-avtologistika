const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Task extends Model {}

Task.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  assigned_to: { type: DataTypes.INTEGER },
  created_by_pm_id: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { sequelize, modelName: 'Task', tableName: 'tasks', timestamps: false });

module.exports = Task;
