const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class TaskComment extends Model {}

TaskComment.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  task_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { sequelize, modelName: 'TaskComment', tableName: 'task_comments', timestamps: false });

module.exports = TaskComment;
