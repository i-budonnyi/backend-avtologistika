const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class TaskLog extends Model {}

TaskLog.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  task_id: { type: DataTypes.INTEGER, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
  log_time: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { sequelize, modelName: 'TaskLog', tableName: 'task_logs', timestamps: false });

module.exports = TaskLog;
